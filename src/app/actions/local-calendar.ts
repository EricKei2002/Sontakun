"use server";

import { createClient } from "@/lib/supabase/server";

export async function addLocalCalendarEvent(
  title: string,
  description: string,
  startTime: string,
  endTime: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { error } = await supabase
    .from("local_calendar_events")
    .insert({
      user_id: user.id,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
    });

  if (error) {
    console.error("Failed to add local calendar event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateLocalCalendarEvent(
  eventId: string,
  title: string,
  description: string,
  startTime: string,
  endTime: string,
  meetingUrl?: string,
  notes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { error } = await supabase
    .from("local_calendar_events")
    .update({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      meeting_url: meetingUrl,
      notes,
    })
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to update local calendar event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteLocalCalendarEvent(eventId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です" };
  }

  const { error } = await supabase
    .from("local_calendar_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete local calendar event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
