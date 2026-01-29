"use server";

import { createClient } from "@supabase/supabase-js"; // Direct client for Admin
import { geminiExtractConstraints } from "@/lib/gemini";
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

   // 0. Fetch organizer settings for Persona customization
   let customInstructions = "";
   const { data: interview } = await supabaseAdmin
      .from('interviews')
      .select('user_id')
      .eq('id', tokenData.interview_id)
      .single();
   
   if (interview) {
       const { data: settings } = await supabaseAdmin
           .from('user_settings')
           .select('custom_instructions')
           .eq('user_id', interview.user_id)
           .single();
       if (settings?.custom_instructions) {
           customInstructions = settings.custom_instructions;
       }
   }

   // 1. 抽出 (数秒かかる場合があります)
   const constraints = await geminiExtractConstraints(rawText, customInstructions);
   
   // 2. 使用済みにマーク (Atomicity note: ideal to do in transaction but separate calls fine for MVP)
   const { error: updateError } = await supabaseAdmin
     .from("interview_tokens")
     .update({ is_used: true })
     .eq("token", token);

   if (updateError) {
       console.error("Failed to mark token used", updateError);
       throw new Error("System error: could not update token status");
   }

   // 3. 保存 (Use normal client or admin, admin is fine here)
   const { error: insertError } = await supabaseAdmin.from("availabilities").insert({
       interview_id: tokenData.interview_id,
       candidate_name: "Candidate", // Future: add name input
       candidate_email: candidateEmail,
       raw_text: rawText,
       extracted_json: constraints
   });

   if (insertError) throw insertError;

   // 4. 面接官に通知を送信
   const { data: interviewDetails } = await supabaseAdmin
       .from('interviews')
       .select('user_id, title, recruiter_name')
       .eq('id', tokenData.interview_id)
       .single();

   if (interviewDetails) {
       await supabaseAdmin.from("notifications").insert({
           user_id: interviewDetails.user_id,
           type: "availability_submitted",
           title: "📅 候補者から回答がありました",
           body: `「${interviewDetails.title}」の面談について、候補者から日程の回答が届きました。`,
           link: `/interviews/${tokenData.interview_id}/suggestions`,
           metadata: { 
               interview_id: tokenData.interview_id,
               candidate_email: candidateEmail
           }
       });
   }

   redirect(`/i/${token}/thank-you`);
}
