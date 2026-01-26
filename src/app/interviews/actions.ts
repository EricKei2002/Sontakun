"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createInterview(formData: FormData) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: "Server Configuration Error: Missing Supabase Environment Variables" };
    }

    const supabase = await createClient();
    
    // Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Authentication required. Please log in." };
    }

    const title = formData.get("title") as string;
    const recruiter_name = formData.get("recruiter_name") as string;

    const { data: interview, error } = await supabase.from("interviews").insert({
        title,
        recruiter_name,
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

    redirect(`/interviews/${interview.id}/share?token=${tokenData.token}`);

  } catch (e) {
    // redirect() throws an error (NEXT_REDIRECT) which must be re-thrown
    if (isRedirectError(e)) {
        throw e;
    }
    console.error("Unexpected Server Action Error:", e);
    return { 
        error: `Server Action Failed: ${e instanceof Error ? e.message : String(e)}` 
    };
  }
}

function isRedirectError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
        return false;
    }
    const e = error as { digest?: string; message?: string };
    return Boolean(
        e.digest?.startsWith('NEXT_REDIRECT') || 
        e.message === 'NEXT_REDIRECT'
    );
}
