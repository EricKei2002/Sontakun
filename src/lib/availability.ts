import { listGoogleCalendarEvents } from './google-calendar';
import { addDays, format, parseISO, setHours, setMinutes, isBefore, isAfter, startOfDay } from 'date-fns';

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;   // HH:mm
}

interface WorkingHours {
  start: number; // 9
  end: number;   // 18
}

/**
 * 指定された期間の空き時間を提案する
 * @param accessToken Google Access Token
 * @param daysToCheck 向こう何日間をチェックするか (デフォルト14)
 * @param durationMinutes 必要とする最低空き時間 (デフォルト60分)
 */
export async function getSuggestedSlots(
  accessToken: string,
  daysToCheck: number = 7,
  durationMinutes: number = 60
): Promise<TimeSlot[]> {
  const now = new Date();
  const startDate = startOfDay(addDays(now, 1)); // 明日から
  
  // カレンダーイベント取得
  const events = await listGoogleCalendarEvents(
    accessToken, 
    startDate.toISOString(), 
    100, // maxResults
    true // logError
  );

  const slots: TimeSlot[] = [];
  const workingHours: WorkingHours = { start: 10, end: 19 }; // 10:00 - 19:00 仮定

  // 日ごとにスキャン
  for (let i = 0; i < daysToCheck; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // 土日はスキップ (簡易判定: 0=Sun, 6=Sat)
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // 勤務時間の開始・終了
    const workStart = setMinutes(setHours(currentDate, workingHours.start), 0);
    const workEnd = setMinutes(setHours(currentDate, workingHours.end), 0);

    // その日のイベントを抽出
    const daysEvents = events.filter(event => {
      if (!event.start.dateTime || !event.end.dateTime) return false; // 終日イベント等は一旦除外（改良余地あり）
      const eventStart = parseISO(event.start.dateTime);
      const eventEnd = parseISO(event.end.dateTime);
      // その日の範囲に重なるか
      return isBefore(eventStart, workEnd) && isAfter(eventEnd, workStart);
    }).sort((a, b) => parseISO(a.start.dateTime!).getTime() - parseISO(b.start.dateTime!).getTime());

    // 空き時間を探索
    // workStart から開始し、次のイベント開始までが durationMinutes 以上あれば採用
    
    let currentTime = workStart;

    for (const event of daysEvents) {
      const eventStart = parseISO(event.start.dateTime!);
      const eventEnd = parseISO(event.end.dateTime!);

      // 現在時刻〜イベント開始時刻の差分
      const diffMinutes = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);

      if (diffMinutes >= durationMinutes) {
        // 空きあり
        slots.push({
          date: dateStr,
          start: format(currentTime, 'HH:mm'),
          end: format(eventStart, 'HH:mm')
        });
      }

      // 次の探索開始位置はイベント終了時刻（ただし現在のcurrentTimeより前には戻らない）
      if (isAfter(eventEnd, currentTime)) {
        currentTime = eventEnd;
      }
    }

    // 最後のイベント終了後〜勤務終了まで
    const diffMinutesLast = (workEnd.getTime() - currentTime.getTime()) / (1000 * 60);
    if (diffMinutesLast >= durationMinutes) {
      slots.push({
        date: dateStr,
        start: format(currentTime, 'HH:mm'),
        end: format(workEnd, 'HH:mm')
      });
    }
  }

  // 最大5件程度に絞る（多すぎると選べないので）
  return slots.slice(0, 5);
}
