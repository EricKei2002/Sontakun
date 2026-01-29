import { createClient } from "@/lib/supabase/server";
import { CandidateForm } from "./candidate-form";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PendingConfirmationCard } from "@/components/pending-confirmation-card";

interface PendingSlot {
  start: string;
  end: string;
}

// エラー状態用の共通コンポーネント（レンダー外で定義）
function ErrorCard({ icon, title, message, color }: { icon: string; title: string; message: string; color: string }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-4xl shadow-xl`}>
              {icon}
            </div>
          </div>
          <div className="pt-12">
            <h1 className="text-xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  
  const { data: tokenData } = await supabase.from('interview_tokens')
    .select('*, interviews(id, title, recruiter_name, status, candidate_email)')
    .eq('token', token)
    .single();
  
  if (!tokenData) return notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const candidateEmail = user?.email || tokenData.interviews?.candidate_email || '';

  // 期限切れ
  if (new Date(tokenData.expires_at) < new Date()) {
    return <ErrorCard icon="⏰" title="リンクの有効期限が切れています" message="新しいリンクを発行してもらってください。" color="bg-red-500/20" />;
  }

  // 確認待ち
  const { data: pendingAvailability } = await supabase
    .from('availabilities')
    .select('*')
    .eq('interview_id', tokenData.interview_id)
    .eq('pending_status', 'pending')
    .single();

  if (pendingAvailability && pendingAvailability.pending_slot) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full max-w-lg mx-auto">
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
        </div>
      </div>
    );
  }

  // 確定済み
  if (tokenData.interviews.status === 'confirmed') {
    return <ErrorCard icon="✅" title="日程が確定しています" message="この面談の日程は既に確定されています。" color="bg-green-500/20" />;
  }

  // 使用済み
  if (tokenData.is_used) {
    return <ErrorCard icon="📝" title="回答済みです" message="このリンクは既に使用されています。" color="bg-yellow-500/20" />;
  }

  // メインフォーム
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          
          {/* ソンタくんアバター */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
              <Image src="/sontakun.jpg" alt="Sontaくん" fill className="object-cover" priority />
            </div>
          </div>

          {/* ヘッダー */}
          <div className="pt-14 pb-4 text-center space-y-2">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              こんにちは！
            </h1>
          </div>

          {/* 面談情報 */}
          <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-bold text-lg">{tokenData.interviews.recruiter_name}</span> さんが
            </p>
            <p className="text-primary font-semibold text-lg">
              &quot;{tokenData.interviews.title}&quot;
            </p>
            <p className="text-sm text-muted-foreground">の日程調整をお願いしています</p>
          </div>

          {/* 説明 */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              💡 空気を読みながら最適な日程を提案します。<br/>
              ご都合の良い日時を教えてください！
            </p>
          </div>
          
          <CandidateForm token={token} defaultEmail={candidateEmail} />

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="text-primary font-medium">Sontaくん</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
