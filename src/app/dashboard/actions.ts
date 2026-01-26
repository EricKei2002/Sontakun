"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { addToGoogleCalendar } from "@/app/actions/calendar";

export async function confirmInterview(
  interviewId: string, 
  availabilityId: string, 
  slotStart: string, 
  slotEnd: string
) {
  const supabase = await createClient();
  
  // 1. Get User & Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
      throw new Error("Unauthorized");
  }

  // 2. Fetch Interview Details
  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .eq("user_id", user.id)
    .single();

  if (interviewError || !interview) {
      throw new Error("Interview not found");
  }

  // 3. Create Calendar Event (Server-side with Service Role)
  const result = await addToGoogleCalendar(user.id, {
        summary: `面談: ${interview.title}`,
        description: `候補者: ${interview.recruiter_name}様案件\nSontaくんによる自動作成`,
        start: slotStart,
        end: slotEnd,
  });

  if (!result.success) {
      throw new Error(result.error || "Failed to sync calendar");
  }

  // 4. Update Database
  // Update interview status
  await supabase.from("interviews").update({ status: "confirmed" }).eq("id", interviewId);
  
  // Update availability with selected slot
  await supabase.from("availabilities").update({ 
      final_selected_slot: slotStart 
  }).eq("id", availabilityId);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInterview(interviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("interviews")
    .delete()
    .eq("id", interviewId)
    .eq("user_id", user.id); // Ensure own interview

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { success: true };
}
