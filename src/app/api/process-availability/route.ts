
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geminiExtractConstraints } from "@/lib/gemini";

export const maxDuration = 60; // Vercel Free limitation usually 10s, Pro 60s. Node runtime helps.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { availabilityId } = body;

    if (!availabilityId) {
      return NextResponse.json({ error: "Missing availabilityId" }, { status: 400 });
    }

    // Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch Availability & Interview info
    const { data: availability, error: fetchError } = await supabaseAdmin
      .from("availabilities")
      .select("*, interviews(user_id, title, recruiter_name)")
      .eq("id", availabilityId)
      .single();

    if (fetchError || !availability) {
      console.error("Availability not found", fetchError);
      return NextResponse.json({ error: "Availability not found" }, { status: 404 });
    }

    // 2. Fetch custom instructions
    let customInstructions = "";
    const { data: settings } = await supabaseAdmin
        .from('user_settings')
        .select('custom_instructions')
        .eq('user_id', availability.interviews.user_id)
        .single();
    
    if (settings?.custom_instructions) {
        customInstructions = settings.custom_instructions;
    }

    // 3. Extract Constraints (Heavy task)
    console.log(`[Background] Starting extraction for ${availabilityId}`);
    const constraints = await geminiExtractConstraints(availability.raw_text, customInstructions);
    console.log(`[Background] Extraction complete for ${availabilityId}`);

    // 4. Update Availability
    const { error: updateError } = await supabaseAdmin
      .from("availabilities")
      .update({ extracted_json: constraints })
      .eq("id", availabilityId);

    if (updateError) {
      console.error("[Background] Update failed", updateError);
      throw updateError;
    }

    // 5. Create Notification
    await supabaseAdmin.from("notifications").insert({
        user_id: availability.interviews.user_id,
        type: "availability_submitted",
        title: "📅 候補者から回答がありました",
        body: `「${availability.interviews.title}」の面談について、候補者から日程の回答が届きました。`,
        link: `/interviews/${availability.interview_id}/suggestions`,
        metadata: { 
            interview_id: availability.interview_id,
            candidate_email: availability.candidate_email
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Background] Process error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
