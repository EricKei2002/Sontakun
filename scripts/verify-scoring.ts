import { generateSontakuSlots } from "../src/lib/sontaku-engine";
import { ExtractedConstraints } from "../src/lib/gemini";

// モック制約: ユーザーはランチミーティングを嫌い、月曜日を好む
const constraints: ExtractedConstraints = {
  preferred_days: ["Monday", "Tuesday"],
  specific_dates: [],
  time_ranges: [], // 厳密な範囲指定なし
  excluded_periods: [],
  lunch_break_policy: "avoid",
  buffer_time_preference: true
};

console.log("Running Sontaku Engine verification...");
console.log("Constraints:", JSON.stringify(constraints, null, 2));

try {
    const slots = generateSontakuSlots(constraints);
    
    console.log("\nTop 5 Recommended Slots:");
    slots.forEach((s, i) => {
        console.log(`\n#${i + 1}: ${s.start.toLocaleDateString()} ${s.start.toLocaleTimeString()} - ${s.end.toLocaleTimeString()}`);
        console.log(`    Score: ${s.score}`);
        console.log(`    Reasons: ${s.reasons.join(", ")}`);
    });
    
    if (slots.length > 0) {
        console.log("\n✅ Verification Successful: Slots generated.");
    } else {
        console.error("\n❌ No slots generated.");
    }
} catch (e) {
    console.error(e);
}
