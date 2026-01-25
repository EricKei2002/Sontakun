"use server";
import { createClient } from "@/lib/supabase/server";
import { geminiExtractConstraints } from "@/lib/gemini";
import { redirect } from "next/navigation";

export async function submitAvailability(token: string, formData: FormData) {
   const rawText = formData.get("availability") as string;
   const supabase = await createClient();

   // トークンを検証
   const { data: tokenData, error } = await supabase.from('interview_tokens').select('interview_id').eq('token', token).single();
   
   if (error || !tokenData) {
     throw new Error("Invalid or expired token");
   }

   // 1. 抽出 (数秒かかる場合があります)
   const constraints = await geminiExtractConstraints(rawText);
   
   // 2. 保存
   const { error: insertError } = await supabase.from("availabilities").insert({
       interview_id: tokenData.interview_id,
       raw_text: rawText,
       extracted_json: constraints
   });

   if (insertError) throw insertError;

   redirect(`/i/${token}/thank-you`);
}
