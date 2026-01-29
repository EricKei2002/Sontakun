"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { sendInvitationEmail } from "@/lib/email";

export async function createInterview(formData: FormData) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: "Server Configuration Error: Missing Supabase Environment Variables" };
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Authentication required. Please log in." };
    }

    const title = formData.get("title") as string;
    const recruiter_name = formData.get("recruiter_name") as string;
    const candidate_email = formData.get("candidate_email") as string;

    // バリデーション
    if (!candidate_email || !candidate_email.includes("@")) {
        return { error: "有効なメールアドレスを入力してください" };
    }

    const { data: interview, error } = await supabase.from("interviews").insert({
        title,
        recruiter_name,
        candidate_email,
        user_id: user.id
    }).select().single();

    if (error) {
        console.error("Supabase Insert Error:", error);
        return { error: `Interview creation failed: ${error.message}` };
    }

    // 候補者のためのトークンを作成
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7日間有効
    
    // トークンを生成 (シンプルにUUIDを使用)
    const token = crypto.randomUUID();

    const { data: tokenData, error: tokenError } = await supabase.from("interview_tokens").insert({
        interview_id: interview.id,
        token: token,
        expires_at: expiresAt.toISOString()
    }).select().single();

    if (tokenError) {
        console.error("Token Creation Error:", tokenError);
        return { error: `Token creation failed: ${tokenError.message}` };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/i/${tokenData.token}`;

    // 候補者がSontakunユーザーかチェック
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const candidateUser = existingUser?.users?.find(u => u.email === candidate_email);

    if (candidateUser) {
      // 登録済みユーザー → アプリ内通知を作成
      await supabaseAdmin.from("notifications").insert({
        user_id: candidateUser.id,
        type: "interview_invitation",
        title: `${recruiter_name}様から日程調整のご依頼`,
        body: `「${title}」の面談日程を入力してください`,
        link: inviteUrl,
        metadata: { interview_id: interview.id }
      });
    } else {
      // 未登録ユーザー → 招待メールを送信
      await sendInvitationEmail({
        to: candidate_email,
        interviewTitle: title,
        recruiterName: recruiter_name,
        inviteUrl: inviteUrl
      });
    }

    return { success: true, redirectUrl: '/interviews/new/success' };

  } catch (e) {
    console.error("Unexpected Server Action Error:", e);
    return { 
        error: `Server Action Failed: ${e instanceof Error ? e.message : String(e)}` 
    };
  }
}


