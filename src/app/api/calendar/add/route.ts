import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addToGoogleCalendar } from "@/app/actions/calendar";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interviewTitle, slotStart, slotEnd } = body;

    if (!interviewTitle || !slotStart || !slotEnd) {
      return NextResponse.json(
        { success: false, error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    // カレンダーに予定を追加
    const result = await addToGoogleCalendar(user.id, {
      summary: interviewTitle,
      description: "Sontaくんが提案した日程",
      start: slotStart,
      end: slotEnd,
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        link: result.link 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || "カレンダーへの追加に失敗しました" 
      });
    }
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { success: false, error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
