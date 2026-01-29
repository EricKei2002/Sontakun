"use server";

import { createClient } from "@supabase/supabase-js"; // Direct client for Admin
import { redirect } from "next/navigation";

export async function submitAvailability(token: string, formData: FormData) {
   const rawText = formData.get("availability") as string;
   const candidateEmail = formData.get("email") as string;
   
   // Input Validation
   if (!rawText || rawText.length > 2000) {
       throw new Error("Input text is too long (max 2000 chars).");
   }

   if (!candidateEmail || !candidateEmail.includes("@")) {
       throw new Error("Valid email address is required.");
   }

   // Admin Client for Security Logic (Bypass RLS)
   // Note: Ensure SUPABASE_SERVICE_ROLE_KEY is set in your env vars
   const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );

   // トークンを検証 (有効期限と使用済みチェック)
   const { data: tokenData, error } = await supabaseAdmin
     .from('interview_tokens')
     .select('interview_id, is_used, expires_at')
     .eq('token', token)
     .single();
   
   if (error || !tokenData) {
     throw new Error("Invalid token");
   }

   if (tokenData.is_used) {
       throw new Error("Token already used");
   }

   if (new Date(tokenData.expires_at) < new Date()) {
       throw new Error("Token expired");
   }

   // 0. Fetch organizer settings (Persona logic moved to background API)

   // 1. 使用済みにマーク (Atomicity note: ideal to do in transaction but separate calls fine for MVP)
   const { error: updateError } = await supabaseAdmin
     .from("interview_tokens")
     .update({ is_used: true })
     .eq("token", token);

   if (updateError) {
       console.error("Failed to mark token used", updateError);
       throw new Error("System error: could not update token status");
   }

   // 2. 保存 (extracted_json is null initially)
   const { data: availability, error: insertError } = await supabaseAdmin
       .from("availabilities")
       .insert({
           interview_id: tokenData.interview_id,
           candidate_name: "Candidate",
           candidate_email: candidateEmail,
           raw_text: rawText,
           extracted_json: null // Processing...
       })
       .select()
       .single();

   if (insertError) throw insertError;

   // 3. バックグラウンド処理をトリガー (Fire and Forget)
   // Note: 本番Vercel環境では `waitUntil` 等が必要だが、Node環境/Dev環境ではこれで動作する
   const { headers } = await import("next/headers");
   const headersList = await headers();
   const host = headersList.get("host");
   const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
   
   fetch(`${protocol}://${host}/api/process-availability`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ availabilityId: availability.id })
   }).catch(err => console.error("Background trigger failed", err));

   redirect(`/i/${token}/thank-you`);
}
