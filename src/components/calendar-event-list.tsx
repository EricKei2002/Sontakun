import { createClient } from "@/lib/supabase/server";
import { listGoogleCalendarEvents } from "@/lib/google-calendar";
import { SontaCalendarView } from "./sonta-calendar-view";
import { ConnectCalendarButton } from "./connect-calendar-button";

export async function CalendarEventList() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.provider_token;
  
  if (!token) {
    return (
        <div className="p-10 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-sm">
            <p className="text-muted-foreground text-sm font-medium">Googleカレンダーと連携して予定を同期</p>
        </div>
    );
  }

  let events = [];
  try {
      // Fetch up to 100 events for the calendar view to be meaningful
      events = await listGoogleCalendarEvents(token, new Date().toISOString(), 100);
  } catch (e) {
      console.error(e);
      return (
          <div className="p-10 rounded-3xl bg-red-500/10 border border-red-500/20 text-center backdrop-blur-sm flex flex-col items-center gap-4">
             <p className="text-red-400 text-sm font-medium">カレンダーの取得に失敗しました。<br/>アクセス権限が不足している可能性があります。</p>
             <ConnectCalendarButton />
          </div>
      );
  }

  return (
    <div className="w-full">
       <SontaCalendarView initialEvents={events} />
    </div>
  );
}
