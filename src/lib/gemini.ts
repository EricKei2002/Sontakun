import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export interface ExtractedConstraints {
  preferred_days: string[]; // 例: ["Monday", "Friday"]
  time_ranges: { start: string; end: string }[]; // HH:MM 形式
  excluded_periods: { description: string; start?: string; end?: string }[];
  lunch_break_policy: "avoid" | "allow" | "preferred";
  buffer_time_preference: boolean;
  raw_analysis?: string; // 任意の分析理由
  formal_message_japanese?: string; // AIによる敬語変換
}

export async function geminiExtractConstraints(
  text: string, 
  customInstructions: string = ""
): Promise<ExtractedConstraints> {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are a polite scheduling assistant (Sontakun). Extract scheduling constraints from the user's input.
    Today is ${new Date().toDateString()}.
    
    [IMPORTANT]
    The organizer has provided specific instructions for your persona/behavior:
    "${customInstructions}"
    
    Please reflect these instructions in the "formal_message_japanese" tone and content.
    If the instructions ask to ignore certain days, reflect that in the extracted constraints.
    If the instructions ask for a specific tone (e.g. "speak like a Gyaru", "use Kansai dialect"), you MUST follow it in the "formal_message_japanese" field.
    
    Detect nuances like "lunch time" (usually 12:00-13:00), "start of the day" (09:00-10:00), etc.
    
    Return JSON format:
    {
      "preferred_days": ["Monday", "Tuesday", ...], 
      "time_ranges": [{"start": "HH:MM", "end": "HH:MM"}],
      "excluded_periods": [{"description": "reason", "start": "HH:MM", "end": "HH:MM"}],
      "lunch_break_policy": "avoid" | "allow" | "preferred", // If they say "lunch is fine", allow. If "avoid lunch", avoid. Default to "avoid" if ambiguous to be polite.
      "buffer_time_preference": boolean, // If they seem busy or ask for gaps.
      "raw_analysis": "Short summary of what you understood",
      "formal_message_japanese": "Rewrite the User Input into a polite, formal business Japanese message suitable for a scheduling context. Even if the input is casual (e.g., 'next week is fine'), convert it to Keigo (e.g., '来週の平日であればいつでも調整可能です。よろしくお願いいたします。')."
    }

    Input Text: "${text}"
  `;

  try {
    console.log("[Gemini] Calling API with text:", text.substring(0, 100));
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log("[Gemini] Response:", responseText.substring(0, 200));
    return JSON.parse(responseText);
  } catch (error) {
    console.error("[Gemini] Extraction Error:", error);
    console.error("[Gemini] Error details:", JSON.stringify(error, null, 2));
    
    // フォールバック: 最小限の制約を返す
    console.log("[Gemini] Using fallback constraints");
    return {
      preferred_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      time_ranges: [{ start: "10:00", end: "18:00" }],
      excluded_periods: [],
      lunch_break_policy: "avoid",
      buffer_time_preference: true,
      raw_analysis: "Error occurred, using default constraints",
      formal_message_japanese: text
    };
  }
}
