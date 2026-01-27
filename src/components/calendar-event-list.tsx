import { createClient } from "@/lib/supabase/server";
import { listGoogleCalendarEvents, CalendarEvent } from "@/lib/google-calendar";
import { SontaCalendarView } from "./sonta-calendar-view";

export async function CalendarEventList() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.provider_token;
  let events: CalendarEvent[] = [];

  if (token) {
    try {
        // Fetch up to 100 events for the calendar view to be meaningful
        events = await listGoogleCalendarEvents(token, new Date().toISOString(), 100, false);
    } catch {
        // On error, just show empty calendar (or previously shown error UI, 
        // but user requested "show UI" so consistent behavior is better)
    }
  }

  return (
    <div className="w-full">
       <SontaCalendarView initialEvents={events} />
    </div>
  );
}
