"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Clock, Plus, Trash2, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
// Calendar, Popover removed
import { getSuggestedSlotsAction } from "@/app/actions/calendar";

export type TimeSlot = {
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;   // HH:mm
};

export function InterviewerAvailabilityEditor() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 時間の選択肢を生成 (30分刻み)
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    const h = i.toString().padStart(2, '0');
    timeOptions.push(`${h}:00`);
    timeOptions.push(`${h}:30`);
  }

  // スロットを追加
  const addSlot = () => {
    if (!date) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 重複チェックは簡易的に
    const exists = slots.some(s => s.date === dateStr && s.start === startTime && s.end === endTime);
    if (exists) return;

    setSlots([...slots, { date: dateStr, start: startTime, end: endTime }].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start.localeCompare(b.start);
    }));
  };

  // スロットを削除
  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // 自動提案を取得
  const handleAutoSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSuggestedSlotsAction();
      if (result.success && result.slots) {
        // 既存のスロットとマージ（重複排除）
        const newSlots = [...slots];
        result.slots.forEach((s: TimeSlot) => {
          const exists = newSlots.some(existing => 
            existing.date === s.date && existing.start === s.start && existing.end === s.end
          );
          if (!exists) {
            newSlots.push(s);
          }
        });
        setSlots(newSlots.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)));
      } else {
        setError(result.error || "候補が見つかりませんでした");
      }
    } catch {
      setError("自動提案の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
        setDate(new Date(e.target.value));
    } else {
        setDate(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="proposed_slots" value={JSON.stringify(slots)} />

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-primary/20 text-xs">📅</span>
            候補日時（任意）
        </label>
        <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAutoSuggest}
            disabled={loading}
            className="text-xs h-8 bg-white/5 hover:bg-white/10 border-white/10"
        >
            {loading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1 text-purple-400" />}
            カレンダーから提案
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Manual Input Area */}
      <div className="flex flex-wrap gap-2 items-center bg-black/20 p-3 rounded-xl border border-white/5">
        <div className="relative">
            <input 
                type="date" 
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={handleDateChange}
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 h-10"
            />
        </div>

        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-md px-2 h-10">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <select 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 w-[60px]"
            >
                {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
            </select>
            <span className="text-muted-foreground">~</span>
            <select 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 w-[60px]"
            >
                {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
            </select>
        </div>

        <Button type="button" size="sm" onClick={addSlot} className="h-10 w-10 p-0 rounded-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary/20">
            <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Selected Slots List */}
      <div className="space-y-2">
        {slots.length === 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground bg-white/5 rounded-lg border border-dashed border-white/10">
                日時を追加すると、候補者に提示されます
            </div>
        )}
        {slots.map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 group">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {index + 1}
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-primary mr-2">
                            {format(new Date(slot.date), "MM/dd(E)", { locale: ja })}
                        </span>
                        <span className="text-foreground">
                            {slot.start} ~ {slot.end}
                        </span>
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={() => removeSlot(index)}
                    className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
