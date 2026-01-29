import { 
  addDays, 
  addMinutes, 
  areIntervalsOverlapping, 
  format, 
  set, 
  startOfDay, 
  isBefore, 
  isAfter,
  parse
} from "date-fns";
import { ExtractedConstraints } from "./gemini";

export interface Slot {
  start: Date;
  end: Date;
  score: number;
  reasons: string[];
  isFallback?: boolean;
}

export function generateSontakuSlots(
  constraints: ExtractedConstraints,
  interviewDurationMinutes: number = 60,
  busySlots: { start: Date; end: Date }[] = [],
  lunchPolicyOverride?: "avoid" | "allow" | "none"
): Slot[] {
  let slots: Slot[] = [];
  const now = new Date();
  const startDate = addDays(startOfDay(now), 1); // 明日からチェック開始
  const daysToCheck = 14; 

  // ヘルパー関数: スロット検索実行
  const findSlots = (relaxed: boolean) => {
    const foundSlots: Slot[] = [];
    
    for (let i = 0; i < daysToCheck; i++) {
        const currentDay = addDays(startDate, i);
        const dayName = format(currentDay, "EEEE");
        const dateStr = format(currentDay, "yyyy-MM-dd");

        // 1. 日付フィルター
        if (!relaxed) {
            if (constraints.specific_dates && constraints.specific_dates.length > 0) {
                const isSpecificDate = constraints.specific_dates.includes(dateStr);
                if (!isSpecificDate) continue;
            } else if (constraints.preferred_days && constraints.preferred_days.length > 0) {
                const match = constraints.preferred_days.some(pd => 
                    dayName.toLowerCase().includes(pd.toLowerCase())
                );
                if (!match) continue; 
            }
        }

        // 勤務時間を定義 (デフォルト 9:00 - 18:00)
        let searchStart = set(currentDay, { hours: 9, minutes: 0 });
        const searchEnd = set(currentDay, { hours: 18, minutes: 0 });

        // 15分刻みで反復
        while (isBefore(searchStart, searchEnd)) {
            const slotEnd = addMinutes(searchStart, interviewDurationMinutes);
            if (isAfter(slotEnd, searchEnd)) break;

            let score = relaxed ? -100 : 0; // 緩和モードは初期スコア低
            const reasons: string[] = [];
            
            if (relaxed) {
                reasons.push("希望日程外");
            }

            // 2. 全体の空き状況チェック (ここは緩和しない)
            const isBusy = busySlots.some(busy => areIntervalsOverlapping(
                { start: searchStart, end: slotEnd },
                busy
            ));

            if (isBusy) {
                searchStart = addMinutes(searchStart, 15);
                continue;
            }

            // 3. 時間帯の制約 (緩和モード時は無視、または減点)
            if (constraints.time_ranges && constraints.time_ranges.length > 0) {
                let inRange = false;
                for (const range of constraints.time_ranges) {
                    const rStart = parse(range.start, "HH:mm", currentDay);
                    const rEnd = parse(range.end, "HH:mm", currentDay);
                    if ((isAfter(searchStart, rStart) || searchStart.getTime() === rStart.getTime()) &&
                        (isBefore(slotEnd, rEnd) || slotEnd.getTime() === rEnd.getTime())) {
                        inRange = true;
                        break;
                    }
                }
                if (!inRange) {
                    if (!relaxed) {
                        searchStart = addMinutes(searchStart, 15);
                        continue;
                    } else {
                        score -= 50;
                        reasons.push("時間帯外 (-50)");
                    }
                }
            }

            // 4. 忖度（ソンタク）スコアリング
            // ランチ (12:00 - 13:00)
            const lunchStart = set(currentDay, { hours: 12, minutes: 0 });
            const lunchEnd = set(currentDay, { hours: 13, minutes: 0 });
            const overlapsLunch = areIntervalsOverlapping(
                { start: searchStart, end: slotEnd },
                { start: lunchStart, end: lunchEnd }
            );

            const effectiveLunchPolicy = lunchPolicyOverride || constraints.lunch_break_policy;

            if (effectiveLunchPolicy === 'avoid') {
                if (overlapsLunch) {
                    score -= 50;
                    reasons.push("ランチタイムに干渉 (-50)");
                } else {
                    score += 20;
                    if (!relaxed) reasons.push("ランチタイムを考慮 (+20)");
                }
            } else if (effectiveLunchPolicy === 'preferred') {
                if (overlapsLunch) {
                    score += 30;
                    reasons.push("ランチミーティング推奨 (+30)");
                }
            } else if (effectiveLunchPolicy === 'none') {
                if (overlapsLunch) {
                    score += 10; 
                    reasons.push("昼食時間帯も可 (+10)");
                }
            } else if (effectiveLunchPolicy === 'allow') {
                if (overlapsLunch) {
                    reasons.push("ランチタイム許容");
                }
            }

            // クリーンな開始時間ボーナス
            if (searchStart.getMinutes() === 0 || searchStart.getMinutes() === 30) {
                score += 5;
            }

            foundSlots.push({
                start: searchStart,
                end: slotEnd,
                score,
                reasons,
                isFallback: relaxed
            });

            searchStart = addMinutes(searchStart, 15);
        }
    }
    return foundSlots;
  };

  // 1. まず厳密検索
  slots = findSlots(false);

  // 2. 見つからなければ緩和検索 (フォールバック)
  if (slots.length === 0) {
     slots = findSlots(true);
  }

  // 重複するスロットを排除しますか？
  // 今のところ、重複に関係なくトップ5を返します (ユーザーが最適な開始時間を選択できます)
  return slots.sort((a, b) => b.score - a.score).slice(0, 5);
}
