'use server';

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// 管理者権限でSupabaseを操作するためのクライアント
// ※ auth.identities にアクセスしてトークンを取り出すために必要
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Google OAuth2クライアントの初期化
const oauth2Client = new google.auth.OAuth2(
  process.env.SUPABASE_AUTH_GOOGLE_ID,
  process.env.SUPABASE_AUTH_GOOGLE_SECRET,
  process.env.NEXT_PUBLIC_SITE_URL // Redirect URI (Server-side処理では直接使いませんが設定必須)
);

type CalendarEvent = {
  summary: string;
  description: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  meetingUrl?: string;
};

/**
 * 主催者(user_id)のカレンダーに予定を追加する
 */
export async function addToGoogleCalendar(userId: string, event: CalendarEvent) {
  try {
    console.log(`[Calendar] Starting sync for user: ${userId}`);

    // 1. Supabaseからユーザー情報を取得（identitiesの中にトークンがある）
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user) {
      throw new Error(`User not found: ${userError?.message}`);
    }

    // 2. Googleの連携情報(identity)を探す
    const googleIdentity = user.identities?.find((id) => id.provider === 'google');

    if (!googleIdentity) {
      throw new Error('Google連携が見つかりません。再連携してください。');
    }

    // 3. Refresh Tokenを取り出す
    // ※ identity_data は型定義が曖昧なため、必要なプロパティを持つ型としてキャスト
    const identityData = googleIdentity.identity_data as { provider_refresh_token?: string } | null;
    const refreshToken = identityData?.provider_refresh_token;

    if (!refreshToken) {
      console.error('[Calendar] Refresh Token is missing. Identity data:', googleIdentity.identity_data);
      throw new Error('Googleカレンダーの書き込み権限がありません（Refresh Token欠落）。連携ボタンから再認証してください。');
    }

    // 4. Googleライブラリに認証情報をセット
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 5. カレンダーにイベント挿入
    const response = await calendar.events.insert({
      calendarId: 'primary', // 主催者のメインカレンダー
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
        location: event.meetingUrl || 'Online',
        // 会議室やMeetが必要ならここに conferenceData 等を追加可能
      },
    });

    console.log('[Calendar] Event created successfully:', response.data.htmlLink);
    return { success: true, link: response.data.htmlLink };

  } catch (error: unknown) {
    console.error('[Calendar] Failed to add event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    // カレンダー書き込み失敗で全体を落とさないよう、エラーメッセージを返す
    return { success: false, error: errorMessage };
  }
}
