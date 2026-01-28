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

  // トークンとインタビュー情報を取得
  const { data: tokenData } = await supabase.from('interview_tokens')
    .select('*, interviews(id, title, recruiter_name, status)')
    .eq('token', token)
    .single();

  if (!tokenData) return notFound();

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
        />
      </div>
    );
  }

  // 確定済みの場合
  if (tokenData.interviews.status === 'confirmed') {
    return (
      <div className="container mx-auto min-h-screen flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-green-500/20 shadow-xl">
             <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
        </div>
        <h1 className="text-4xl font-bold text-green-400">日程が確定しました！</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          面談の日程が確定しました。<br/>
          詳細はメールまたはカレンダーをご確認ください。
        </p>
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
