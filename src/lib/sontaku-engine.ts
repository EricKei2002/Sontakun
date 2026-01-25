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
}

export function generateSontakuSlots(
  constraints: ExtractedConstraints,
  interviewDurationMinutes: number = 60,
  busySlots: { start: Date; end: Date }[] = []
): Slot[] {
  const slots: Slot[] = [];
  const now = new Date();
  const startDate = addDays(startOfDay(now), 1); // 明日からチェック開始
  const daysToCheck = 14; 

  for (let i = 0; i < daysToCheck; i++) {
    const currentDay = addDays(startDate, i);
    const dayName = format(currentDay, "EEEE");

    // 1. 希望日のフィルター
    if (constraints.preferred_days && constraints.preferred_days.length > 0) {
      const match = constraints.preferred_days.some(pd => 
        dayName.toLowerCase().includes(pd.toLowerCase())
      );
      if (!match) continue; 
    }

    // 勤務時間を定義 (デフォルト 9:00 - 18:00)
    let searchStart = set(currentDay, { hours: 9, minutes: 0 });
    const searchEnd = set(currentDay, { hours: 18, minutes: 0 });

    // 15分刻みで反復
    while (isBefore(searchStart, searchEnd)) {
      const slotEnd = addMinutes(searchStart, interviewDurationMinutes);
      
      if (isAfter(slotEnd, searchEnd)) break;

      let score = 0;
      const reasons: string[] = [];

      // 2. 全体の空き状況チェック
      const isBusy = busySlots.some(busy => areIntervalsOverlapping(
        { start: searchStart, end: slotEnd },
        busy
      ));

      if (isBusy) {
        searchStart = addMinutes(searchStart, 15);
        continue;
      }

      // 3. 時間帯の制約
      if (constraints.time_ranges && constraints.time_ranges.length > 0) {
        let inRange = false;
        for (const range of constraints.time_ranges) {
            // 現在の日付に関連して範囲をパース
            const rStart = parse(range.start, "HH:mm", currentDay);
            const rEnd = parse(range.end, "HH:mm", currentDay);
            
            // スロットが範囲内に完全に収まるかチェック
            if ((isAfter(searchStart, rStart) || searchStart.getTime() === rStart.getTime()) &&
                (isBefore(slotEnd, rEnd) || slotEnd.getTime() === rEnd.getTime())) {
                inRange = true;
                break;
            }
        }
        if (!inRange) {
            searchStart = addMinutes(searchStart, 15);
            continue;
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

      if (constraints.lunch_break_policy === 'avoid') {
        if (overlapsLunch) {
            score -= 50;
            reasons.push("ランチタイムに干渉 (-50)");
        } else {
            score += 20;
            reasons.push("ランチタイムを考慮 (+20)");
        }
      } else if (constraints.lunch_break_policy === 'preferred') {
         if (overlapsLunch) {
             score += 30;
             reasons.push("ランチミーティング推奨 (+30)");
         }
      }

      // クリーンな開始時間ボーナス
      if (searchStart.getMinutes() === 0 || searchStart.getMinutes() === 30) {
          score += 5;
          // reasons.push("区切りの良い開始時間 (+5)"); // 冗長すぎるためコメントアウト
      }

      // バッファーのヒント (ユーザーが具体的にバッファーを求めた場合、ギャップのあるスロットを優先する可能性がありますが、
      // ここではbusySlots以外の隣接する会議の制約がないため、完全なスケジュールコンテキストなしではバッファーロジックを完全に実装することはできません。
      // Sontakun 2.0の機能です。)

      slots.push({
          start: searchStart,
          end: slotEnd,
          score,
          reasons
      });

      searchStart = addMinutes(searchStart, 15);
    }
  }

  // 重複するスロットを排除しますか？
  // 今のところ、重複に関係なくトップ5を返します (ユーザーが最適な開始時間を選択できます)
  return slots.sort((a, b) => b.score - a.score).slice(0, 5);
}
