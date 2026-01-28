"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Loader2 } from "lucide-react";

interface AddToCalendarButtonProps {
  interviewId: string;
  interviewTitle: string;
  slotStart: string;
  slotEnd: string;
}

export function AddToCalendarButton({ 
  interviewTitle, 
  slotStart, 
  slotEnd 
}: AddToCalendarButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCalendar() {
    setLoading(true);
    try {
      const { addLocalCalendarEvent } = await import("@/app/actions/local-calendar");
      
      const result = await addLocalCalendarEvent(
        interviewTitle,
        "Sontaくんが提案した日程",
        slotStart,
        slotEnd
      );

      if (result.success) {
        setAdded(true);
        // Redirect to dashboard to see the event
        window.location.href = "/dashboard";
      } else {
        alert(result.error || "カレンダーへの追加に失敗しました");
      }
    } catch (error) {
      console.error("Calendar add error:", error);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (added) {
    return (
      <Button size="sm" variant="ghost" disabled className="text-green-400">
        <Check className="w-4 h-4 mr-1" />
        ダウンロード済み
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleAddToCalendar}
      disabled={loading}
      className="hover:bg-primary/10"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          追加中...
        </>
      ) : (
        <>
          <Calendar className="w-4 h-4 mr-1" />
          カレンダーに追加
        </>
      )}
    </Button>
  );
}
