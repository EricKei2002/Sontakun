"use client";

import { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  isToday,
  parseISO
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/google-calendar";
import { EventEditModal } from "./event-edit-modal";

interface SontaCalendarViewProps {
  initialEvents: CalendarEvent[];
}

export function SontaCalendarView({ initialEvents }: SontaCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState(initialEvents);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const eventsOnSelectedDate = useMemo(() => {
    return events.filter(event => {
      const startStr = event.start.dateTime || event.start.date;
      if (!startStr) return false;
      return isSameDay(parseISO(startStr), selectedDate);
    });
  }, [events, selectedDate]);

  // Helper to check if a day has events
  const hasEvents = (day: Date) => {
    return events.some(event => {
        const startStr = event.start.dateTime || event.start.date;
        if (!startStr) return false;
        return isSameDay(parseISO(startStr), day);
    });
  };

  const handleEventUpdate = () => {
    // Remove the deleted event from state
    setEvents(events.filter(e => e.id !== selectedEvent?.id));
    setSelectedEvent(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Calendar Grid Section */}
      <div className="flex-1 p-6 rounded-3xl bg-secondary/30 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <CalendarIcon className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold tracking-tight">
                {format(currentDate, "yyyy年 MMMM", { locale: ja })}
             </h2>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-white/10 border border-white/5 transition-all text-muted-foreground hover:text-white"
             >
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-white/10 border border-white/5 transition-all text-muted-foreground hover:text-white"
             >
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
            <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentToday = isToday(day);
            const dayHasEvents = hasEvents(day);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group overflow-hidden",
                  !isCurrentMonth && "opacity-20",
                  isSelected 
                    ? "bg-linear-to-br from-purple-500/80 to-pink-500/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                    : "hover:bg-white/10 border border-transparent hover:border-white/10",
                  isCurrentToday && !isSelected && "border-purple-500/50 text-purple-400"
                )}
              >
                <span className={cn(
                   "text-sm font-semibold z-10",
                   isSelected ? "scale-110" : "group-hover:scale-110 transition-transform"
                )}>
                  {format(day, "d")}
                </span>
                
                {dayHasEvents && (
                    <div className={cn(
                        "absolute bottom-2 w-1 h-1 rounded-full",
                        isSelected ? "bg-white" : "bg-purple-400"
                    )} />
                )}

                {/* Subtle Hover Effect Background */}
                {!isSelected && (
                    <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all opacity-0 group-hover:opacity-100" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events List Section */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex-1">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                  {format(selectedDate, "M月d日の予定", { locale: ja })}
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {eventsOnSelectedDate.length === 0 ? (
                      <div className="py-10 text-center">
                          <p className="text-sm text-muted-foreground italic">予定はありません</p>
                      </div>
                  ) : (
                      eventsOnSelectedDate.map((event) => {
                          const start = parseISO(event.start.dateTime || event.start.date || "");
                          const end = parseISO(event.end.dateTime || event.end.date || "");
                          const isAllDay = !event.start.dateTime;

                          return (
                              <div key={event.id} onClick={() => setSelectedEvent(event)} className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <h4 className="font-bold text-sm mb-2 line-clamp-2">{event.summary || "(タイトルなし)"}</h4>
                                  <div className="space-y-1.5">
                                      {!isAllDay && (
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                              <Clock className="w-3 h-3 text-pink-400/70" />
                                              {format(start, "HH:mm")} - {format(end, "HH:mm")}
                                          </div>
                                      )}
                                      {event.location && (
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                              <MapPin className="w-3 h-3 text-blue-400/70" />
                                              <span className="truncate">{event.location}</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )
                      })
                  )}
              </div>
          </div>
          
          {/* Quick info card */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1 opacity-70">Total Events</p>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white leading-none">{events.length}</span>
                  <span className="text-xs text-indigo-300 font-medium pb-0.5">Upcoming Sync</span>
              </div>
          </div>
      </div>

      {selectedEvent && (
        <EventEditModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleEventUpdate}
        />
      )}
    </div>
  );
}
