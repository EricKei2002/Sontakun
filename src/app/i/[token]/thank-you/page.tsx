import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PendingConfirmationCard } from "@/components/pending-confirmation-card";

interface PendingSlot {
  start: string;
  end: string;
}

export default async function ThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const supabase = await createClient();

  // トークンを検証（JOINなし）
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

  // インタビュー情報を別途取得
  const { data: interviewData, error: interviewError } = await supabase.from('interviews')
    .select('id, title, recruiter_name, status')
    .eq('id', simpleTokenData.interview_id)
    .single();

  if (interviewError || !interviewData) {
      return notFound();
  }

  // データを結合
  const tokenData = {
      ...simpleTokenData,
      interviews: interviewData
  };

  // 確認待ちのavailabilityをチェック
  const { data: pendingAvailability } = await supabase
    .from('availabilities')
    .select('*')
    .eq('interview_id', tokenData.interview_id)
    .eq('pending_status', 'pending')
    .single();

  // 確認待ちの場合は確認UIを表示
  if (pendingAvailability && pendingAvailability.pending_slot) {
    return (
      <div className="container max-w-2xl min-h-screen flex flex-col justify-center py-10 px-4 mx-auto">
        <div className="mb-8 flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
                 <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                日程の確認
            </h1>
            <p className="text-muted-foreground">
              採用担当者から日程の提案がありました。
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
    );
  }

  // 確定済みの場合
  if (tokenData.interviews.status === 'confirmed') {
    // accepted状態のavailabilityを取得
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
      <div className="container mx-auto min-h-screen flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-green-500/20 shadow-xl">
             <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
        </div>
        <h1 className="text-4xl font-bold text-green-400">日程が確定しました！</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          面談の日程が確定しました。
        </p>
        
        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {providerLabel} に参加
          </a>
        )}
        
        <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Powered by ソンタくん</p>
        </div>
      </div>
    );
  }

  // デフォルト: 回答受付済み
  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
           <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
      </div>
      <h1 className="text-4xl font-bold text-primary">承りました。</h1>
      <p className="text-xl text-muted-foreground max-w-md">
        ソンタくんがあなたのメッセージを分析し、最も思いやりのある日時を探しています。<br/>
        採用担当者にお知らせします。
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        日程が決まりましたら、このページで確認できます。
      </p>
      <div className="pt-8">
          <p className="text-sm text-muted-foreground mb-4">Powered by ソンタくん</p>
      </div>
    </div>
  );
}
