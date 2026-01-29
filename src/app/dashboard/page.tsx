import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ConnectCalendarButton } from "@/components/connect-calendar-button";
import { ConfirmSlotButton } from "@/components/confirm-slot-button";
import { Check, Plus, Settings, Calendar, Clock, ExternalLink, Loader2 } from "lucide-react";
import { CalendarEventList } from "@/components/calendar-event-list";
import { DeleteInterviewButton } from "@/components/delete-interview-button";
import { DisconnectCalendarButton } from "@/components/disconnect-calendar-button";

interface CandidateSlot {
  start: string;
  end: string;
}

interface Availability {
  id: string;
  candidate_name?: string;
  raw_text: string;
  final_selected_slot?: string;
  extracted_json?: {
    candidate_slots?: CandidateSlot[];
    formal_message_japanese?: string;
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // セキュリティ向上のため getSession ではなく getUser を使用
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // プロバイダートークン取得のためにセッションを取得
  const { data: { session } } = await supabase.auth.getSession();
  
  let isConnected = false;
  
  if (session?.provider_token) {
      try {
          const { listGoogleCalendarEvents } = await import("@/lib/google-calendar");
          await listGoogleCalendarEvents(session.provider_token, new Date().toISOString(), 1, false);
          isConnected = true;
      } catch {
          isConnected = false;
      }
  }

  const { data: organizedInterviews } = await supabase
    .from("interviews")
    .select("*, interview_tokens(token, is_used), availabilities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: invitedInterviews } = await supabase
    .from("interviews")
    .select("*, interview_tokens(token, is_used), availabilities(*)")
    .eq("candidate_email", user.email)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8 px-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/30 shadow-lg">
              <Image src="/sontakun.jpg" alt="Sontaくん" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ダッシュボード
              </h1>
              <p className="text-sm text-muted-foreground">おかえりなさい！</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/settings">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                <Settings className="w-4 h-4 mr-2" />
                カスタマイズ
              </Button>
            </Link>
            <Link href="/interviews/new">
              <Button className="bg-linear-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 font-bold shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                新規作成
              </Button>
            </Link>
          </div>
        </div>

        {/* 招待された面談 (New Section) */}
        {invitedInterviews && invitedInterviews.length > 0 && (
          <div className="mb-10 space-y-4">
             <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <span className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">📩</span>
                招待された面談
             </h2>
             <div className="grid gap-4">
               {invitedInterviews.map((interview) => (
                 <div key={interview.id} className="p-6 rounded-2xl bg-linear-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/30 shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all">
                    {/* 背景エフェクト */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                             interview.status === 'pending_confirmation' ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse' :
                             interview.status === 'confirmed' ? 'bg-green-500 text-black border-green-400' :
                             'bg-gray-700 text-gray-300 border-gray-600'
                           }`}>
                             {interview.status === 'pending_confirmation' ? '⚠️ 日程確認のお願い' :
                              interview.status === 'confirmed' ? '✅ 確定済み' :
                              interview.status === 'active' ? '🕐 日程調整中' : interview.status}
                           </span>
                           <span className="text-xs text-purple-200">
                             主催者: {interview.recruiter_name} 様
                           </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{interview.title}</h3>
                        <p className="text-sm text-purple-200/70">
                           {interview.status === 'pending_confirmation' 
                             ? '主催者から日程の提案が届いています。内容を確認して回答してください。'
                             : '日程調整のステータスをご確認ください。'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                         {interview.interview_tokens?.[0]?.token && (
                           <Link href={`/i/${interview.interview_tokens[0].token}`}>
                             <Button 
                               size="lg" 
                               className={
                                 interview.status === 'pending_confirmation' 
                                 ? "bg-white text-purple-900 hover:bg-white/90 font-bold shadow-xl shadow-purple-900/20 border-0" 
                                 : "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border border-purple-500/30"
                               }
                             >
                               {interview.status === 'pending_confirmation' ? (
                                   <>日程を確認して回答する <Clock className="w-4 h-4 ml-2" /></>
                               ) : interview.status === 'active' ? (
                                   <>希望日時を回答する <ExternalLink className="w-4 h-4 ml-2" /></>
                               ) : (
                                   <>面談ページを開く <ExternalLink className="w-4 h-4 ml-2" /></>
                               )}
                             </Button>
                           </Link>
                         )}
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}



        {/* 主催した面談一覧 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            あなたが主催の面談
          </h2>
          
          {!organizedInterviews || organizedInterviews.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-muted-foreground mb-4">まだ主催した面談がありません</p>
              <Link href="/interviews/new">
                <Button className="bg-linear-to-r from-primary to-purple-500 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  最初の面談を作る
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {organizedInterviews.map((interview) => (
                <div key={interview.id} className="p-6 rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{interview.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(interview.created_at).toLocaleDateString('ja-JP')} 作成
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        interview.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        interview.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        interview.status === 'pending_confirmation' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {interview.status === 'active' ? '🕐 調整中' : 
                         interview.status === 'confirmed' ? '✅ 確定' : 
                         interview.status === 'pending_confirmation' ? '⏳ 確認待ち' : 
                         interview.status}
                      </span>
                      <DeleteInterviewButton interviewId={interview.id} />
                    </div>
                  </div>

                  {/* 候補者の回答 */}
                  <div className="mb-4 space-y-3">
                    {interview.availabilities?.map((av: Availability) => (
                      <div key={av.id} className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-sm text-muted-foreground mb-3 bg-white/5 p-3 rounded-lg">
                          {av.extracted_json?.formal_message_japanese || av.raw_text}
                        </div>
                        
                        {!av.extracted_json ? (
                          <div className="flex items-center gap-2 text-blue-400 p-4 bg-blue-400/10 rounded-lg animate-pulse border border-blue-400/20">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-bold">Sontaくんが解析中...</span>
                            <span className="text-xs text-muted-foreground ml-2">しばらくお待ちください</span>
                          </div>
                        ) : av.final_selected_slot ? (
                          <div className="flex items-center gap-2 text-green-400 font-medium bg-green-500/10 px-4 py-2 rounded-lg w-fit">
                            <Check className="w-4 h-4" />
                            確定: {new Date(av.final_selected_slot).toLocaleString('ja-JP')}
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {av.extracted_json?.candidate_slots?.map((slot: CandidateSlot, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                <span className="text-sm">
                                  <span className="font-medium">
                                    {new Date(slot.start).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                                  </span>
                                  <br />
                                  <span className="text-muted-foreground">
                                    {new Date(slot.start).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </span>
                                {interview.status !== 'confirmed' && (
                                  <ConfirmSlotButton 
                                    interviewId={interview.id}
                                    availabilityId={av.id}
                                    slotStart={slot.start}
                                    slotEnd={slot.end}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!interview.availabilities || interview.availabilities.length === 0) && (
                      <div className="text-center py-6 bg-black/10 rounded-xl border border-dashed border-white/10">
                        <p className="text-sm text-muted-foreground">💬 まだ回答はありません</p>
                      </div>
                    )}
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <Link href={`/interviews/${interview.id}/share?token=${interview.interview_tokens?.[0]?.token}`}>
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        リンク確認
                      </Button>
                    </Link>
                    <Link href={`/interviews/${interview.id}/suggestions`}>
                      <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30">
                        💡 提案確認
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* カレンダー連携 */}
        <div className="mb-6 p-5 rounded-2xl bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold">Googleカレンダー連携</h2>
              <p className="text-xs text-muted-foreground">確定した日程を自動で書き込みます</p>
            </div>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-green-400 font-medium bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                <Check className="w-4 h-4" />
                連携済み
              </div>
              <DisconnectCalendarButton />
            </div>
          ) : (
            <ConnectCalendarButton userEmail={user.email} />
          )}
        </div>
        
        {/* カレンダーイベント */}
        <div className="mb-8">
          <CalendarEventList />
        </div>
      </div>
    </main>
  );
}
