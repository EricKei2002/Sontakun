import fs from "fs";
import path from "path";

async function checkModelsRaw() {
  let apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
        if (match) {
          apiKey = match[1].trim();
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not read .env.local");
    }
  }

  if (!apiKey || apiKey === "mock-key") {
    console.error("❌ Error: GEMINI_API_KEY is missing or invalid");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log(`Querying API specifically for key ending in: ...${apiKey.slice(-4)}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ Available Models for this Key:");
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods?.includes("generateContent")) {
            console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.error("\n❌ No models found. API Error response:");
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error("\n❌ Network or Fetch Error:");
    console.error(error);
  }
}

checkModelsRaw();
