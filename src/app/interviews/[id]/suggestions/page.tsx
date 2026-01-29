import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { generateSontakuSlots, Slot } from "@/lib/sontaku-engine";
import { format } from "date-fns";
import { ExtractedConstraints } from "@/lib/gemini";
import { FormattedMessageViewer } from "@/components/formatted-message-viewer";
import { ConstraintsViewer } from "@/components/constraints-viewer";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { ConfirmSlotButton } from "@/components/confirm-slot-button";
import { ArrowLeft, Crown, Clock } from "lucide-react";

export default async function SuggestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: availability } = await supabase.from('availabilities')
    .select('*')
    .eq('interview_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: interview } = await supabase.from('interviews')
    .select('title')
    .eq('id', id)
    .single();

  if (!availability) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="absolute -top-14 left-1/2 -translate-x-1/2">
              <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
                <Image src="/sontakun.jpg" alt="Sontaくん" fill className="object-cover" />
              </div>
            </div>
            <div className="pt-14">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold mb-2">候補者からの回答待ち</h1>
              <p className="text-muted-foreground text-sm mb-6">
                まだ回答がありません。<br/>しばらくしてから再度ご確認ください。
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ダッシュボードに戻る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const constraints = availability.extracted_json as unknown as ExtractedConstraints;

  const { data: { user } } = await supabase.auth.getUser();
  let lunchPolicyOverride: "avoid" | "allow" | "none" | undefined;
  
  if (user) {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('lunch_policy')
      .eq('user_id', user.id)
      .single();
    
    if (settings?.lunch_policy) {
      lunchPolicyOverride = settings.lunch_policy as "avoid" | "allow" | "none";
    }
  }

  const slots = generateSontakuSlots(constraints, 60, [], lunchPolicyOverride);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> ダッシュボードに戻る
        </Link>

        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg">
            <Image src="/sontakun.jpg" alt="Sontaくん" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sontaくんの提案
            </h1>
            <p className="text-sm text-muted-foreground">AIが最適な日程を分析しました</p>
          </div>
        </div>
       
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左側: メッセージと制約 */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">💬</span>
                候補者のメッセージ
              </h2>
              <FormattedMessageViewer 
                rawText={availability.raw_text} 
                formalText={constraints.formal_message_japanese} 
              />
            </div>
            
            <div className="rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10 p-6">
              <ConstraintsViewer constraints={constraints} />
            </div>
          </div>
           
          {/* 右側: ベスト5提案 */}
          <div>
            {slots.length > 0 && (
              <div className="rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10 p-6">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </span>
                  ベスト5
                </h2>
                <div className="space-y-4">
                  {slots.slice(0, 5).map((slot: Slot, i: number) => {
                    const rank = i + 1;
                    const isTop = rank === 1;
                    return (
                      <div key={i} className={`p-4 rounded-xl border transition-all hover:shadow-lg ${isTop ? 'bg-linear-to-r from-primary/10 to-purple-500/10 border-primary/30' : 'bg-black/20 border-white/5 hover:border-primary/30'}`}>
                        {/* ランキングバッジ */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                            rank === 2 ? "bg-slate-400/20 text-slate-400" :
                            rank === 3 ? "bg-amber-600/20 text-amber-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {isTop && "👑 "}{rank}位
                          </span>
                          <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                            スコア: {slot.score}
                          </span>
                        </div>

                        {/* 日時 */}
                        <div className="mb-3">
                          <div className="text-sm text-muted-foreground">
                            {format(slot.start, "M月d日 (EEE)")}
                          </div>
                          <div className="text-2xl font-mono font-bold text-foreground">
                            {format(slot.start, "HH:mm")} <span className="text-muted-foreground">-</span> {format(slot.end, "HH:mm")}
                          </div>
                        </div>

                        {/* 理由タグ */}
                        <div className="flex gap-1 flex-wrap mb-4">
                          {slot.reasons.map((r, k) => (
                            <span key={k} className="bg-white/5 text-muted-foreground px-2 py-0.5 rounded text-xs border border-white/5">
                              {r}
                            </span>
                          ))}
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2">
                          <AddToCalendarButton 
                            interviewId={id}
                            interviewTitle={interview?.title || "面談"}
                            slotStart={slot.start.toISOString()}
                            slotEnd={slot.end.toISOString()}
                          />
                          <ConfirmSlotButton 
                            interviewId={id}
                            availabilityId={availability.id}
                            slotStart={slot.start.toISOString()}
                            slotEnd={slot.end.toISOString()}
                            candidateEmail={availability.candidate_email}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
