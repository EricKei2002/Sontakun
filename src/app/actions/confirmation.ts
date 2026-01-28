"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { addToGoogleCalendar, createGoogleMeetEvent } from "@/app/actions/calendar";
import { createZoomMeeting } from "@/lib/zoom";
import { sendConfirmationRequestEmail, sendConfirmedEmail } from "@/lib/email";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type MeetingProvider = 'google_meet' | 'zoom';

// 面接官が候補者に確認を依頼する
export async function requestConfirmation(
  interviewId: string,
  availabilityId: string,
  slotStart: string,
  slotEnd: string,
  provider: MeetingProvider = 'google_meet',
  candidateEmail?: string
) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "認証が必要です" };
  }

  // インタビューが自分のものか確認
  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .single();

  if (interviewError || !interview) {
    return { success: false, error: "面談が見つかりません" };
  }

  // 会議URLを生成
  let meetingUrl: string | null = null;
  let eventId: string | null = null;

  if (provider === 'google_meet') {
    // Google Meet付きイベントを作成
    const meetingResult = await createGoogleMeetEvent(user.id, {
      summary: `[仮] 面談: ${interview.title}`,
      description: `候補者確認待ち\n※ 承諾後に正式確定されます\nSontaくんによる自動作成`,
      start: slotStart,
      end: slotEnd,
    });

    if (meetingResult.success) {
      meetingUrl = meetingResult.meetingUrl || null;
      eventId = meetingResult.eventId || null;
    } else {
      console.error("Failed to create Google Meet:", meetingResult.error);
    }
  } else if (provider === 'zoom') {
    // Zoom会議を作成
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

    const zoomResult = await createZoomMeeting({
      topic: `[仮] 面談: ${interview.title}`,
      startTime: slotStart,
      duration: durationMinutes,
      agenda: `候補者確認待ち - Sontaくんによる自動作成`,
    });

    if (zoomResult.success) {
      meetingUrl = zoomResult.meetingUrl || null;
      eventId = zoomResult.meetingId || null;
    } else {
      console.error("Failed to create Zoom meeting:", zoomResult.error);
    }
  }

  // pending_slotとpending_statusを更新（Meeting URLも保存）
  const { error: updateError } = await supabase
    .from("availabilities")
    .update({
      pending_slot: { start: slotStart, end: slotEnd },
      pending_status: "pending",
      meeting_url: meetingUrl,
      provider_event_id: eventId,
      meeting_provider: provider,
    })
    .eq("id", availabilityId);

  if (updateError) {
    console.error("Failed to update availability:", updateError);
    return { success: false, error: "更新に失敗しました" };
  }

  // インタビューのステータスを更新
  await supabase
    .from("interviews")
    .update({ status: "pending_confirmation" })
    .eq("id", interviewId);

  // トークンを取得して確認URLを生成
  const { data: tokenData } = await supabase
    .from("interview_tokens")
    .select("token")
    .eq("interview_id", interviewId)
    .single();

  const confirmUrl = tokenData 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/i/${tokenData.token}`
    : null;

  // メール送信（候補者メールアドレスがある場合）
  if (candidateEmail && confirmUrl) {
    const startDate = new Date(slotStart);
    const proposedTimeStr = format(startDate, "M月d日 (EEEE) HH:mm", { locale: ja });

    await sendConfirmationRequestEmail({
      to: candidateEmail,
      candidateName: "候補者様",
      interviewTitle: interview.title,
      recruiterName: interview.recruiter_name,
      proposedTime: proposedTimeStr,
      confirmUrl: confirmUrl,
      meetingProvider: provider,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/interviews/${interviewId}/suggestions`);
  
  return { 
    success: true,
    meetingUrl,
    confirmUrl,
  };
}

// 候補者が確認に応答する
export async function respondToConfirmation(
  token: string,
  availabilityId: string,
  accepted: boolean
) {
  // Service Roleクライアントを作成（RLSを回避するため）
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // トークンを検証 (Joinなしで単純に検索)
  const { data: simpleTokenData, error: simpleTokenError } = await supabase
    .from("interview_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (simpleTokenError || !simpleTokenData) {
    return { success: false, error: "無効なトークンです" };
  }

  // インタビュー情報を別途取得
  const { data: interviewData, error: interviewError } = await supabase
    .from("interviews")
    .select("id, user_id, title, recruiter_name")
    .eq("id", simpleTokenData.interview_id)
    .single();

  if (interviewError || !interviewData) {
      return { success: false, error: "インタビューが見つかりません" };
  }
  
  // データを結合して既存の構造に合わせる
  const tokenData = {
      ...simpleTokenData,
      interviews: interviewData
  };

  // アベイラビリティを取得
  const { data: availability, error: availabilityError } = await supabase
    .from("availabilities")
    .select("*")
    .eq("id", availabilityId)
    .single();

  if (availabilityError || !availability) {
    console.error("Availability fetch failed:", availabilityError);
    return { success: false, error: "データが見つかりません" };
  }

  if (availability.pending_status !== "pending") {
    return { success: false, error: "既に回答済みです" };
  }

  if (accepted) {
    // 承諾の場合: Googleカレンダーに予定作成（Google Meetの場合のみ）
    const pendingSlot = availability.pending_slot as { start: string; end: string };
    const provider = (availability.meeting_provider || 'google_meet') as MeetingProvider;
    
    // Google Meetの場合のみカレンダー同期（Zoomは既に作成済み）
    if (provider === 'google_meet') {
      const calendarResult = await addToGoogleCalendar(tokenData.interviews.user_id, {
        summary: `面談: ${tokenData.interviews.title}`,
        description: `候補者: ${tokenData.interviews.recruiter_name}様案件\nSontaくんによる自動作成`,
        start: pendingSlot.start,
        end: pendingSlot.end,
        meetingUrl: availability.meeting_url,
      });

      if (!calendarResult.success) {
        console.error("Calendar creation failed:", calendarResult.error);
      }
    }

    // ローカルカレンダーUIにも追加
    await supabase.from("local_calendar_events").insert({
      user_id: tokenData.interviews.user_id,
      title: `面談: ${tokenData.interviews.title}`,
      description: `候補者: ${tokenData.interviews.recruiter_name}様案件\n${provider === 'zoom' ? 'Zoom' : 'Google Meet'}\nSontaくんによる自動作成`,
      start_time: pendingSlot.start,
      end_time: pendingSlot.end,
      meeting_url: availability.meeting_url,
    });

    // アベイラビリティを更新
    await supabase
      .from("availabilities")
      .update({
        pending_status: "accepted",
        final_selected_slot: pendingSlot.start
      })
      .eq("id", availabilityId);

    // インタビューのステータスを更新
    await supabase
      .from("interviews")
      .update({ status: "confirmed" })
      .eq("id", tokenData.interviews.id);

    // 確定メール送信（候補者メールアドレスがある場合）
    if (availability.candidate_email && availability.meeting_url) {
      const startDate = new Date(pendingSlot.start);
      const confirmedTimeStr = format(startDate, "M月d日 (EEEE) HH:mm", { locale: ja });

      await sendConfirmedEmail({
        to: availability.candidate_email,
        candidateName: "候補者様",
        interviewTitle: tokenData.interviews.title,
        recruiterName: tokenData.interviews.recruiter_name,
        confirmedTime: confirmedTimeStr,
        meetingUrl: availability.meeting_url,
        meetingProvider: provider,
      });
    }
  } else {
    // 拒否の場合
    await supabase
      .from("availabilities")
      .update({ pending_status: "declined" })
      .eq("id", availabilityId);

    // インタビューのステータスを調整中に戻す
    await supabase
      .from("interviews")
      .update({ status: "active" })
      .eq("id", tokenData.interviews.id);
  }

  revalidatePath(`/i/${token}`);
  return { success: true, accepted };
}
