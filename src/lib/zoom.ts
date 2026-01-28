/**
 * Zoom Server-to-Server OAuth 連携
 * 環境変数:
 *   ZOOM_ACCOUNT_ID
 *   ZOOM_CLIENT_ID
 *   ZOOM_CLIENT_SECRET
 */

type ZoomMeetingResult = {
  success: boolean;
  meetingUrl?: string;
  meetingId?: string;
  password?: string;
  error?: string;
};

type ZoomTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type ZoomMeetingResponse = {
  id: number;
  join_url: string;
  password: string;
  start_url: string;
};

// トークンをキャッシュ（有効期限内であれば再利用）
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Server-to-Server OAuth でアクセストークンを取得
 */
async function getZoomAccessToken(): Promise<string> {
  // キャッシュされたトークンがまだ有効なら再利用
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom API認証情報が設定されていません。環境変数を確認してください。');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: accountId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Zoom] Token request failed:', errorText);
    throw new Error('Zoomアクセストークンの取得に失敗しました');
  }

  const data: ZoomTokenResponse = await response.json();
  
  // トークンをキャッシュ
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return data.access_token;
}

/**
 * Zoom会議を作成
 */
export async function createZoomMeeting(options: {
  topic: string;
  startTime: string; // ISO 8601
  duration: number; // 分
  agenda?: string;
}): Promise<ZoomMeetingResult> {
  try {
    console.log('[Zoom] Creating meeting:', options.topic);

    const accessToken = await getZoomAccessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: options.topic,
        type: 2, // スケジュール済み会議
        start_time: options.startTime,
        duration: options.duration,
        timezone: 'Asia/Tokyo',
        agenda: options.agenda || '',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          waiting_room: false,
          mute_upon_entry: true,
          auto_recording: 'none',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Zoom] Meeting creation failed:', errorText);
      throw new Error(`Zoom会議の作成に失敗しました: ${response.status}`);
    }

    const meeting: ZoomMeetingResponse = await response.json();

    console.log('[Zoom] Meeting created:', { id: meeting.id, joinUrl: meeting.join_url });

    return {
      success: true,
      meetingUrl: meeting.join_url,
      meetingId: String(meeting.id),
      password: meeting.password,
    };
  } catch (error) {
    console.error('[Zoom] Failed to create meeting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Zoom会議をキャンセル（削除）
 */
export async function deleteZoomMeeting(meetingId: string): Promise<boolean> {
  try {
    const accessToken = await getZoomAccessToken();

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      console.error('[Zoom] Failed to delete meeting:', meetingId);
      return false;
    }

    console.log('[Zoom] Meeting deleted:', meetingId);
    return true;
  } catch (error) {
    console.error('[Zoom] Failed to delete meeting:', error);
    return false;
  }
}
