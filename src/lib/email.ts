/**
 * メール通知 (Resend)
 * 環境変数:
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL (送信元メールアドレス)
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@sontakun.app';

type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

/**
 * 候補者に確認依頼メールを送信
 */
export async function sendConfirmationRequestEmail(options: {
  to: string;
  candidateName: string;
  interviewTitle: string;
  recruiterName: string;
  proposedTime: string;
  confirmUrl: string;
  meetingProvider: 'google_meet' | 'zoom';
}): Promise<EmailResult> {
  try {
    console.log('[Email] Sending confirmation request to:', options.to);

    const providerLabel = options.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet';

    const { data, error } = await resend.emails.send({
      from: `ソンタくん <${FROM_EMAIL}>`,
      to: options.to,
      subject: `【日程確認】${options.interviewTitle} - ${options.recruiterName}様より`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo img { width: 64px; height: 64px; border-radius: 50%; }
    h1 { text-align: center; color: #a78bfa; font-size: 24px; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 32px; }
    .time-block { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .time-date { font-size: 20px; color: #a78bfa; font-weight: bold; }
    .time-time { font-size: 32px; font-family: monospace; color: white; margin-top: 8px; }
    .provider { display: inline-flex; align-items: center; gap: 8px; background: rgba(74, 222, 128, 0.2); color: #4ade80; padding: 6px 12px; border-radius: 20px; font-size: 14px; margin-top: 12px; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🙇</div>
    <h1>日程のご確認</h1>
    <p class="subtitle">${options.recruiterName}様から「${options.interviewTitle}」の日程提案がありました</p>
    
    <div class="time-block">
      <div class="time-date">${options.proposedTime}</div>
      <div class="provider">📹 ${providerLabel}で開催</div>
    </div>
    
    <div class="cta">
      <a href="${options.confirmUrl}">日程を確認する</a>
    </div>
    
    <p style="text-align: center; color: #94a3b8;">
      上記ボタンから、日程の承諾または再調整のリクエストができます。
    </p>
    
    <div class="footer">
      <p>このメールはソンタくんから自動送信されています</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * 確定通知メールを送信（候補者がOKした後）
 */
export async function sendConfirmedEmail(options: {
  to: string;
  candidateName: string;
  interviewTitle: string;
  recruiterName: string;
  confirmedTime: string;
  meetingUrl: string;
  meetingProvider: 'google_meet' | 'zoom';
}): Promise<EmailResult> {
  try {
    console.log('[Email] Sending confirmed notification to:', options.to);

    const providerLabel = options.meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet';

    const { data, error } = await resend.emails.send({
      from: `ソンタくん <${FROM_EMAIL}>`,
      to: options.to,
      subject: `【確定】${options.interviewTitle} - ${options.confirmedTime}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(74, 222, 128, 0.3); }
    .logo { text-align: center; margin-bottom: 24px; }
    .success-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(74, 222, 128, 0.2); color: #4ade80; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    h1 { text-align: center; color: #4ade80; font-size: 24px; margin: 16px 0 8px; }
    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 32px; }
    .time-block { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .time-date { font-size: 20px; color: #4ade80; font-weight: bold; }
    .time-time { font-size: 32px; font-family: monospace; color: white; margin-top: 8px; }
    .join-button { text-align: center; margin: 24px 0; }
    .join-button a { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo" style="text-align: center;">
      <span class="success-badge">✓ 日程確定</span>
    </div>
    <h1>面談が確定しました！</h1>
    <p class="subtitle">${options.interviewTitle}</p>
    
    <div class="time-block">
      <div class="time-date">${options.confirmedTime}</div>
      <div style="color: #94a3b8; margin-top: 8px;">📹 ${providerLabel}</div>
    </div>
    
    <div class="join-button">
      <a href="${options.meetingUrl}">会議に参加</a>
    </div>
    
    <p style="text-align: center; color: #94a3b8; font-size: 14px;">
      当日は上記ボタンから会議にご参加ください。
    </p>
    
    <div class="footer">
      <p>このメールはソンタくんから自動送信されています</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * 未登録ユーザーに招待メールを送信
 */
export async function sendInvitationEmail(options: {
  to: string;
  interviewTitle: string;
  recruiterName: string;
  inviteUrl: string;
}): Promise<EmailResult> {
  try {
    console.log('[Email] Sending invitation to:', options.to);

    const { data, error } = await resend.emails.send({
      from: `ソンタくん <${FROM_EMAIL}>`,
      to: options.to,
      subject: `【招待】${options.recruiterName}様から日程調整のご依頼`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f23; color: #e2e8f0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); }
    .logo { text-align: center; margin-bottom: 16px; }
    .logo img { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(167, 139, 250, 0.3); }
    h1 { text-align: center; color: #a78bfa; font-size: 24px; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #94a3b8; margin-bottom: 32px; }
    .info-block { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .info-label { color: #64748b; font-size: 12px; margin-bottom: 4px; }
    .info-value { color: white; font-size: 18px; font-weight: bold; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><img src="https://sontakun.burst.style/sontakun.jpg" alt="ソンタくん"></div>
    <h1>日程調整のご依頼</h1>
    <p class="subtitle">${options.recruiterName}様から面談のご依頼がありました</p>
    
    <div class="info-block">
      <div class="info-label">面談タイトル</div>
      <div class="info-value">${options.interviewTitle}</div>
    </div>
    
    <p style="text-align: center; color: #94a3b8; margin-bottom: 24px;">
      下のボタンから、ご都合の良い日時をお知らせください。<br>
      AIがあなたの予定を分析し、最適な日程を見つけます。
    </p>
    
    <div class="cta">
      <a href="${options.inviteUrl}">日程を入力する</a>
    </div>
    
    <div class="footer">
      <p>このメールはソンタくんから自動送信されています</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
