import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // ログイン成功後、過去の招待をチェックして通知を作成
      await linkPastInvites(supabase)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = origin.includes('localhost')
      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

/**
 * ログイン/登録時に、過去の面接招待を通知に変換
 */
async function linkPastInvites(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // このメールアドレス宛の未処理の面接招待を検索
    const { data: pendingInterviews } = await supabaseAdmin
      .from('interviews')
      .select('id, title, recruiter_name')
      .eq('candidate_email', user.email)
      .eq('status', 'active')

    if (!pendingInterviews || pendingInterviews.length === 0) return

    // 既存の通知をチェック（重複作成を防ぐ）
    const { data: existingNotifications } = await supabaseAdmin
      .from('notifications')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('type', 'interview_invitation')

    const existingInterviewIds = new Set(
      existingNotifications?.map(n => (n.metadata as { interview_id?: string })?.interview_id) || []
    )

    // 新規の招待のみ通知を作成
    for (const interview of pendingInterviews) {
      if (existingInterviewIds.has(interview.id)) continue

      // トークンを取得
      const { data: tokenData } = await supabaseAdmin
        .from('interview_tokens')
        .select('token')
        .eq('interview_id', interview.id)
        .single()

      if (!tokenData) continue

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const inviteUrl = `${baseUrl}/i/${tokenData.token}`

      await supabaseAdmin.from('notifications').insert({
        user_id: user.id,
        type: 'interview_invitation',
        title: `${interview.recruiter_name}様から日程調整のご依頼`,
        body: `「${interview.title}」の面談日程を入力してください`,
        link: inviteUrl,
        metadata: { interview_id: interview.id }
      })
    }
  } catch (error) {
    console.error('Failed to link past invites:', error)
  }
}
