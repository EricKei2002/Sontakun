import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PendingConfirmationCard } from "@/components/pending-confirmation-card";

interface PendingSlot {
  start: string;
  end: string;
}

// 共通レイアウト（レンダー外で定義）
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
}

export default async function ThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: simpleTokenData, error: simpleTokenError } = await supabase.from('interview_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (simpleTokenError) {
      console.error('[ThankYouPage] Token fetch error:', simpleTokenError);
  }

  if (!simpleTokenData) {
      return notFound();
  }

  const { data: interviewData, error: interviewError } = await supabase.from('interviews')
    .select('id, title, recruiter_name, status')
    .eq('id', simpleTokenData.interview_id)
    .single();

  if (interviewError || !interviewData) {
      return notFound();
  }

  const tokenData = {
      ...simpleTokenData,
      interviews: interviewData
  };

  const { data: pendingAvailability } = await supabase
    .from('availabilities')
    .select('*')
    .eq('interview_id', tokenData.interview_id)
    .eq('pending_status', 'pending')
    .single();

  // 確認待ちの場合
  if (pendingAvailability && pendingAvailability.pending_slot) {
    return (
      <PageWrapper>
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
              <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
            </div>
          </div>
          <div className="pt-14 pb-6 text-center">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              日程の確認
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              採用担当者から日程の提案が届いています
            </p>
          </div>
          <PendingConfirmationCard
            token={token}
            availabilityId={pendingAvailability.id}
            pendingSlot={pendingAvailability.pending_slot as PendingSlot}
            interviewTitle={tokenData.interviews.title}
            meetingUrl={pendingAvailability.meeting_url}
            meetingProvider={pendingAvailability.meeting_provider}
          />
        </div>
      </PageWrapper>
    );
  }

  // 確定済みの場合
  if (tokenData.interviews.status === 'confirmed') {
    const { data: acceptedAvailability } = await supabase
      .from('availabilities')
      .select('*')
      .eq('interview_id', tokenData.interview_id)
      .eq('pending_status', 'accepted')
      .single();

    const meetingUrl = acceptedAvailability?.meeting_url;
    const meetingProvider = (acceptedAvailability?.meeting_provider || 'google_meet') as 'google_meet' | 'zoom';
    const providerLabel = meetingProvider === 'zoom' ? 'Zoom' : 'Google Meet';

    return (
      <PageWrapper>
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-green-500/30 shadow-2xl bg-secondary">
              <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
            </div>
          </div>
          <div className="pt-14 pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">日程が確定しました！</h1>
            <p className="text-muted-foreground">面談の日程が確定しました</p>
          </div>

          {meetingUrl && (
            <div className="mt-6">
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-linear-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {providerLabel} に参加
              </a>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="text-primary font-medium">Sontaくん</span>
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // デフォルト: 回答受付済み
  return (
    <PageWrapper>
      <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl text-center">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
            <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
          </div>
        </div>
        <div className="pt-14 pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            承りました！
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Sontaくんがあなたのメッセージを分析し、<br/>
            最適な日程を探しています。
          </p>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/5">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="animate-spin">🔄</span>
            <span>採用担当者に通知中...</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          日程が決まりましたら、このページで確認できます
        </p>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="text-primary font-medium">Sontaくん</span>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
