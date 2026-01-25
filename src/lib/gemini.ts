import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export interface ExtractedConstraints {
  preferred_days: string[]; // 例: ["Monday", "Friday"]
  time_ranges: { start: string; end: string }[]; // HH:MM 形式
  excluded_periods: { description: string; start?: string; end?: string }[];
  lunch_break_policy: "avoid" | "allow" | "preferred";
  buffer_time_preference: boolean;
  raw_analysis?: string; // 任意の分析理由
}

export async function geminiExtractConstraints(text: string): Promise<ExtractedConstraints> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are a polite scheduling assistant (Sontakun). Extract scheduling constraints from the user's input.
    Detect nuances like "lunch time" (usually 12:00-13:00), "start of the day" (09:00-10:00), etc.
    
    Return JSON format:
    {
      "preferred_days": ["Monday", "Tuesday", ...], 
      "time_ranges": [{"start": "HH:MM", "end": "HH:MM"}],
      "excluded_periods": [{"description": "reason", "start": "HH:MM", "end": "HH:MM"}],
      "lunch_break_policy": "avoid" | "allow" | "preferred", // If they say "lunch is fine", allow. If "avoid lunch", avoid. Default to "avoid" if ambiguous to be polite.
      "buffer_time_preference": boolean, // If they seem busy or ask for gaps.
      "raw_analysis": "Short summary of what you understood"
    }

    Input Text: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    // フォールバックまたは再スロー
    throw new Error("Failed to extract constraints.");
  }
}
