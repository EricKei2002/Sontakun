"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createInterview(formData: FormData) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: "Server Configuration Error: Missing Supabase Environment Variables" };
    }

    const supabase = await createClient();
    const title = formData.get("title") as string;
    const recruiter_name = formData.get("recruiter_name") as string;

    const { data: interview, error } = await supabase.from("interviews").insert({
        title,
        recruiter_name
    }).select().single();

    if (error) {
        console.error("Supabase Insert Error:", error);
        return { error: `Interview creation failed: ${error.message}` };
    }

    // 候補者のためのトークンを作成
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7日間有効

    const { data: tokenData, error: tokenError } = await supabase.from("interview_tokens").insert({
        interview_id: interview.id,
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

function isRedirectError(error: any) {
    return error && typeof error === 'object' && (
        error.digest?.startsWith('NEXT_REDIRECT') || 
        error.message === 'NEXT_REDIRECT'
    );
}
