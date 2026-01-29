"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function ConnectCalendarButton({ userEmail }: { userEmail?: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleConnect() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/meetings.space.created",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            login_hint: userEmail || "",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
       console.error("Calendar connection failed:", error);
       setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={loading}
      variant="outline"
      className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 transition-colors text-foreground"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Calendar className="w-4 h-4" />
      )}
      Googleカレンダー
    </Button>
  );
}
