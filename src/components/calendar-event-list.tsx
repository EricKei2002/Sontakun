import { createClient } from "@/lib/supabase/server";
import { listGoogleCalendarEvents, CalendarEvent } from "@/lib/google-calendar";
import { SontaCalendarView } from "./sonta-calendar-view";

export async function CalendarEventList() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.provider_token;
  let events: CalendarEvent[] = [];

  // Fetch Google Calendar events if connected
  if (token) {
    try {
        events = await listGoogleCalendarEvents(token, new Date().toISOString(), 100, false);
    } catch {
        // On error, just show empty calendar
    }
  }

  // Fetch local calendar events
  if (session?.user) {
    const { data: localEvents } = await supabase
      .from("local_calendar_events")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("start_time", new Date().toISOString());

    if (localEvents) {
      // Convert local events to CalendarEvent format
      const formattedLocalEvents: CalendarEvent[] = localEvents.map((event) => ({
        id: event.id,
        summary: event.title,
        description: event.description || "",
        start: { dateTime: event.start_time },
        end: { dateTime: event.end_time },
        htmlLink: "", // Local events don't have links
      }));

      // Merge and sort by start time
      events = [...events, ...formattedLocalEvents].sort((a, b) => {
        const aStart = new Date(a.start.dateTime || a.start.date || "");
        const bStart = new Date(b.start.dateTime || b.start.date || "");
        return aStart.getTime() - bStart.getTime();
      });
    }
  }

  return (
    <div className="w-full">
       <SontaCalendarView initialEvents={events} />
    </div>
  );
}
