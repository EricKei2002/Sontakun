import { createClient } from "@/lib/supabase/server";
import { CandidateForm } from "./candidate-form";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PendingConfirmationCard } from "@/components/pending-confirmation-card";

interface PendingSlot {
  start: string;
  end: string;
}

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  
  const { data: tokenData } = await supabase.from('interview_tokens')
    .select('*, interviews(id, title, recruiter_name, status)')
    .eq('token', token)
    .single();
  
  if (!tokenData) return notFound();

  // Validate Expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    return (
        <div className="container mx-auto min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-black/20 rounded-xl border border-white/10">
                <h1 className="text-2xl font-bold text-red-400 mb-2">リンクの有効期限が切れています</h1>
                <p className="text-muted-foreground">新しいリンクを発行してもらってください。</p>
            </div>
        </div>
    );
  }

  // Check for pending confirmation - fetch availability with pending status
  const { data: pendingAvailability } = await supabase
    .from('availabilities')
    .select('*')
    .eq('interview_id', tokenData.interview_id)
    .eq('pending_status', 'pending')
    .single();

  // If there's a pending confirmation, show the confirmation UI
  if (pendingAvailability && pendingAvailability.pending_slot) {
    return (
      <div className="container max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 mx-auto">
        <div className="mb-8 flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
                 <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                日程の確認
            </h1>
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

  // Check if already confirmed
  if (tokenData.interviews.status === 'confirmed') {
    return (
        <div className="container mx-auto min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-black/20 rounded-xl border border-white/10">
                <h1 className="text-2xl font-bold text-green-400 mb-2">日程が確定しています</h1>
                <p className="text-muted-foreground">この面談の日程は既に確定されています。</p>
            </div>
        </div>
    );
  }

  // Validate Usage
  if (tokenData.is_used) {
    return (
        <div className="container mx-auto min-h-screen flex items-center justify-center">
            <div className="text-center p-8 bg-black/20 rounded-xl border border-white/10">
                <h1 className="text-2xl font-bold text-yellow-500 mb-2">回答済みです</h1>
                <p className="text-muted-foreground">このリンクは既に使用されています。</p>
            </div>
        </div>
    );
  }

  return (
     <div className="container max-w-2xl min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 mx-auto">
        <div className="bg-secondary/20 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Background decoration */ }
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="mb-8 flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="relative w-24 h-24 mb-2 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl">
                     <Image src="/sontakun.jpg" alt="Sontakun" fill className="object-cover" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    こんにちは。
                </h1>
            </div>
            
            <div className="mb-8 space-y-4 text-center relative z-10">
                <p className="text-lg text-muted-foreground leading-relaxed">
                    <strong className="text-foreground text-xl block mb-1">{tokenData.interviews.recruiter_name}</strong> さんが
                    <br/>
                    <span className="text-foreground font-semibold">&quot;{tokenData.interviews.title}&quot;</span> <br/>
                    の日程調整をお願いしています。
                </p>
                <div className="h-px w-20 bg-linear-to-r from-transparent via-white/20 to-transparent mx-auto my-6" />
                <p className="text-base text-muted-foreground">
                    空気を読みながら最適な日程を提案します。<br/>
                    ご都合の良い日時を教えていただけますか？
                </p>
            </div>
            
            <CandidateForm token={token} />
        </div>
     </div>
  );
}
