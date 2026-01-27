export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; date?: string };
  end: { dateTime: string; date?: string };
  attendees?: { email: string }[];
  htmlLink?: string;
  location?: string;
}

export async function listGoogleCalendarEvents(accessToken: string, timeMin?: string, maxResults: number = 10, logError: boolean = true) {
  const params = new URLSearchParams({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      maxResults: maxResults.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
  });

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Next.js caching: cache for a short time or no-store?
    // User might want fresh data.
    cache: 'no-store'
  });

  if (!response.ok) {
     // If 401, token might be expired. We can handle this upstream or just return empty/error.
     const errorText = await response.text();
     
     if (logError) {
        console.error(`Google Calendar List Error: ${response.status} ${response.statusText}`, errorText);
     }
     
     let errorMessage = "Unknown error";
     try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
     } catch {
        // Response was not JSON
        errorMessage = errorText;
     }

     throw new Error(`Failed to list events: ${errorMessage}`);
  }

  const data = await response.json();
  return data.items as CalendarEvent[];
}

export async function createGoogleCalendarEvent(accessToken: string, event: Partial<CalendarEvent>) {
  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Google Calendar API Error:", errorData);
    throw new Error(`Failed to create event: ${errorData.error?.message || "Unknown error"}`);
  }

  return await response.json();
}
