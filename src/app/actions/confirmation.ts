"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addToGoogleCalendar } from "@/app/actions/calendar";

// 面接官が候補者に確認を依頼する
export async function requestConfirmation(
  interviewId: string,
  availabilityId: string,
  slotStart: string,
  slotEnd: string
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

  // pending_slotとpending_statusを更新
  const { error: updateError } = await supabase
    .from("availabilities")
    .update({
      pending_slot: { start: slotStart, end: slotEnd },
      pending_status: "pending"
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

  revalidatePath("/dashboard");
  revalidatePath(`/interviews/${interviewId}/suggestions`);
  
  return { success: true };
}

// 候補者が確認に応答する
export async function respondToConfirmation(
  token: string,
  availabilityId: string,
  accepted: boolean
) {
  const supabase = await createClient();

  // トークンを検証
  const { data: tokenData, error: tokenError } = await supabase
    .from("interview_tokens")
    .select("*, interviews(id, user_id, title, recruiter_name)")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return { success: false, error: "無効なトークンです" };
  }

  // アベイラビリティを取得
  const { data: availability, error: availabilityError } = await supabase
    .from("availabilities")
    .select("*")
    .eq("id", availabilityId)
    .single();

  if (availabilityError || !availability) {
    return { success: false, error: "データが見つかりません" };
  }

  if (availability.pending_status !== "pending") {
    return { success: false, error: "既に回答済みです" };
  }

  if (accepted) {
    // 承諾の場合: Googleカレンダーに予定作成
    const pendingSlot = availability.pending_slot as { start: string; end: string };
    
    const calendarResult = await addToGoogleCalendar(tokenData.interviews.user_id, {
      summary: `面談: ${tokenData.interviews.title}`,
      description: `候補者: ${tokenData.interviews.recruiter_name}様案件\nSontaくんによる自動作成`,
      start: pendingSlot.start,
      end: pendingSlot.end,
    });

    if (!calendarResult.success) {
      console.error("Calendar creation failed:", calendarResult.error);
      // カレンダー作成に失敗しても、ステータスは更新する
    }

    // ローカルカレンダーUIにも追加
    await supabase.from("local_calendar_events").insert({
      user_id: tokenData.interviews.user_id,
      title: `面談: ${tokenData.interviews.title}`,
      description: `候補者: ${tokenData.interviews.recruiter_name}様案件\nSontaくんによる自動作成`,
      start_time: pendingSlot.start,
      end_time: pendingSlot.end,
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
