import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { generateSontakuSlots, Slot } from "@/lib/sontaku-engine";
import { format } from "date-fns";
import { ExtractedConstraints } from "@/lib/gemini";
import { FormattedMessageViewer } from "@/components/formatted-message-viewer";
import { ConstraintsViewer } from "@/components/constraints-viewer";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { ConfirmSlotButton } from "@/components/confirm-slot-button";

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
          <div className="container mx-auto py-20 text-center min-h-screen flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-2">候補者からの回答待ち</h1>
              <div className="animate-pulse bg-muted h-4 w-64 rounded mb-4"></div>
              <p className="text-muted-foreground mb-8">まだ回答がありません。<br/>しばらくしてから再度ご確認ください。</p>
              <Link href="/dashboard">
                  <Button variant="outline">ダッシュボードに戻る</Button>
              </Link>
          </div>
      );
  }

  // Type assertion since jsonb is explicitly defined in interface/schema but needs cast
  const constraints = availability.extracted_json as unknown as ExtractedConstraints;

  // Fetch organizer settings (lunch policy)
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
    <div className="container py-12 px-4 max-w-5xl mx-auto min-h-screen">
       <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
           ソンタくんの提案
       </h1>
       
       <div className="grid gap-8 lg:grid-cols-2">
           <div className="space-y-6">
               <div className="space-y-2">
                    <h2 className="text-xl font-semibold opacity-80">候補者のメッセージ</h2>
                    <FormattedMessageViewer 
                        rawText={availability.raw_text} 
                        formalText={constraints.formal_message_japanese} 
                    />
               </div>
               
               <div className="space-y-2">
                     <ConstraintsViewer constraints={constraints} />
                </div>
           </div>
           
           <div className="space-y-6">
               {/* Sontaくんが選ぶベスト5 */}
               {slots.length > 0 && (
                   <div className="mb-8">
                       <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                           <span className="text-yellow-500">👑</span>
                           Sontaくんが選ぶベスト5
                       </h2>
                       <div className="space-y-3">
                           {slots.slice(0, 5).map((slot: Slot, i: number) => {
                               const rank = i + 1;
                               const isTop = rank === 1;
                               return (
                                   <div key={i} className={`flex flex-row gap-4 p-5 rounded-xl border transition-all hover:shadow-lg hover:shadow-primary/5 group relative overflow-hidden ${isTop ? 'bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-primary/50' : 'bg-card hover:border-primary/50'}`}>
                                       
                                       {/* Left side: Time and details */}
                                       <div className="flex-1">
                                           {/* Ranking Badge */}
                                           <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl text-xs font-bold flex items-center gap-1 ${
                                               rank === 1 ? "bg-yellow-500/20 text-yellow-500 border-r border-b border-yellow-500/30" :
                                               rank === 2 ? "bg-slate-400/20 text-slate-400 border-r border-b border-slate-400/30" :
                                               rank === 3 ? "bg-amber-700/20 text-amber-600 border-r border-b border-amber-700/30" :
                                               "bg-muted text-muted-foreground"
                                           }`}>
                                               {isTop && "👑"} Rank {rank}
                                           </div>

                                           <div className="flex justify-between items-center mb-3 mt-8">
                                               <div className="text-xl font-bold text-foreground flex items-center gap-3">
                                                   {format(slot.start, "M月d日 (EEE)")}
                                               </div>
                                           </div>
                                           
                                           <div className="text-3xl font-mono text-primary group-hover:scale-105 transition-transform origin-left mb-4">
                                               {format(slot.start, "HH:mm")} <span className="text-muted-foreground text-xl mx-1">-</span> {format(slot.end, "HH:mm")}
                                           </div>

                                           <div className="flex gap-2 flex-wrap">
                                               <span className="bg-primary/20 text-primary px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-primary/30">
                                                   スコア: {slot.score}
                                               </span>
                                               {slot.reasons.map((r, k) => (
                                                   <span key={k} className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs border border-white/5">
                                                       {r}
                                                   </span>
                                               ))}
                                            </div>
                                        </div>
                                        
                                        {/* Right side: Action buttons */}
                                        <div className="flex flex-col gap-2 justify-center min-w-[200px]">
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
  );
}
