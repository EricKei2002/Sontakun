import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectCalendarButton } from "@/components/connect-calendar-button";
import { ConfirmSlotButton } from "@/components/confirm-slot-button";
import { Check } from "lucide-react";
import { CalendarEventList } from "@/components/calendar-event-list";
import { DeleteInterviewButton } from "@/components/delete-interview-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    redirect("/");
  }

  const user = session.user;
  let isConnected = false;
  
  if (session.provider_token) {
      try {
          // Verify access by making a lightweight call, suppress logs on failure
          const { listGoogleCalendarEvents } = await import("@/lib/google-calendar");
          await listGoogleCalendarEvents(session.provider_token, new Date().toISOString(), 1, false);
          isConnected = true;
      } catch (e) {
          isConnected = false;
      }
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, interview_tokens(token, is_used), availabilities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
       <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-bold">ダッシュボード</h1>
         <Link href="/interviews/new">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
                + 新規作成
            </Button>
         </Link>
       </div>

       <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">その予定、Sontaくんが入れとくよ。</h2>
            <p className="text-sm text-muted-foreground">Googleカレンダーと連携すると、確定した日程を自動で書き込みます。</p>
          </div>
          {isConnected ? (
              <div className="flex items-center gap-2 text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Check className="w-4 h-4" />
                  連携済み
              </div>
          ) : (
              <ConnectCalendarButton />
          )}
       </div>
       
       <div className="mb-8">
          <CalendarEventList />
       </div>

       <div className="grid gap-4">
          {!interviews || interviews.length === 0 ? (
             <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-muted-foreground mb-4">まだ面談がありません</p>
                <Link href="/interviews/new">
                    <Button variant="outline">最初の面談を作る</Button>
                </Link>
             </div>
          ) : (
            interviews.map((interview) => (
                <div key={interview.id} className="p-6 rounded-xl bg-secondary/30 border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold">{interview.title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {new Date(interview.created_at).toLocaleDateString('ja-JP')} 作成
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-mono border ${
                            interview.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            interview.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {interview.status === 'active' ? '調整中' : interview.status === 'confirmed' ? '確定済み' : interview.status}
                        </span>
                        <div className="ml-4">
                            <DeleteInterviewButton interviewId={interview.id} />
                        </div>
                    </div>

                    {/* Candidate Responses */}
                    <div className="mb-4 space-y-3">
                        {interview.availabilities?.map((av: any) => (
                            <div key={av.id} className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <p className="text-sm font-semibold mb-2 text-indigo-300">
                                    候補者からの回答: <span className="text-white">{av.candidate_name || "名無し"}</span>
                                </p>
                                <div className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap bg-white/5 p-2 rounded">
                                    {av.raw_text}
                                </div>
                                
                                {av.final_selected_slot ? (
                                    <div className="text-green-400 text-sm font-bold flex items-center">
                                        <Check className="w-4 h-4 mr-1" />
                                        確定日時: {new Date(av.final_selected_slot).toLocaleString('ja-JP')}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-400">AI提案日時 (クリックで確定):</p>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            {av.extracted_json?.candidate_slots?.map((slot: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                                                    <span className="text-sm font-mono">
                                                        {new Date(slot.start).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        <br/>~ {new Date(slot.end).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
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
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!interview.availabilities || interview.availabilities.length === 0) && (
                            <p className="text-sm text-gray-500 italic">まだ回答はありません</p>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                         <Link href={`/interviews/${interview.id}/share?token=${interview.interview_tokens?.[0]?.token}`}>
                            <Button variant="outline" size="sm">リンク確認</Button>
                         </Link>
                    </div>
                </div>
            ))
          )}
       </div>
    </main>
  );
}
