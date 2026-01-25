"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createInterview(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const recruiter_name = formData.get("recruiter_name") as string;

  const { data: interview, error } = await supabase.from("interviews").insert({
    title,
    recruiter_name
  }).select().single();

  if (error) {
      console.error(error);
      return { error: `Interview creation failed: ${error.message}` };
  }

  // 候補者のためのトークンを作成
  const { data: tokenData, error: tokenError } = await supabase.from("interview_tokens").insert({
    interview_id: interview.id
  }).select().single();

  if (tokenError) {
      console.error(tokenError);
      return { error: `Token creation failed: ${tokenError.message}` };
  }

  redirect(`/interviews/${interview.id}/share?token=${tokenData.token}`);
}
