import { createClient } from "@/lib/supabase/server";
import { generateSontakuSlots, Slot } from "@/lib/sontaku-engine";
import { format } from "date-fns";
import { ExtractedConstraints } from "@/lib/gemini";

export default async function SuggestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: availability } = await supabase.from('availabilities')
    .select('*')
    .eq('interview_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!availability) {
      return (
          <div className="container py-20 text-center min-h-screen flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-2">候補者からの回答待ち</h1>
              <div className="animate-pulse bg-muted h-4 w-64 rounded mb-4"></div>
              <p className="text-muted-foreground">まだ回答がありません。<br/>しばらくしてから再度ご確認ください。</p>
          </div>
      );
  }

  // Type assertion since jsonb is explicitly defined in interface/schema but needs cast
  const constraints = availability.extracted_json as unknown as ExtractedConstraints;
  const slots = generateSontakuSlots(constraints);

  return (
    <div className="container py-12 max-w-5xl min-h-screen">
       <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
           ソンタくんの提案
       </h1>
       
       <div className="grid gap-8 lg:grid-cols-2">
           <div className="space-y-6">
               <div className="space-y-2">
                    <h2 className="text-xl font-semibold opacity-80">候補者のメッセージ</h2>
                    <div className="p-6 rounded-xl border bg-muted/20 backdrop-blur-sm">
                        <p className="italic text-lg text-foreground/90 leading-relaxed">&quot;{availability.raw_text}&quot;</p>
                    </div>
               </div>
               
               <div className="space-y-2">
                    <h2 className="text-xl font-semibold opacity-80">AIが読み取った条件</h2>
                    <pre className="p-4 rounded-xl border bg-black/50 text-xs text-muted-foreground overflow-auto h-64 font-mono">
                        {JSON.stringify(constraints, null, 2)}
                    </pre>
               </div>
           </div>
           
           <div className="space-y-6">
               <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                   おすすめの日時トップ5
               </h2>
               <div className="space-y-4">
                   {slots.map((slot: Slot, i: number) => (
                       <div key={i} className="flex flex-col p-5 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 group">
                           <div className="flex justify-between items-center mb-3">
                               <div className="text-xl font-bold text-foreground">
                                   {format(slot.start, "M月d日 (EEE)")}
                               </div>
                               <div className="text-2xl font-mono text-primary group-hover:scale-105 transition-transform">
                                   {format(slot.start, "HH:mm")} <span className="text-muted-foreground text-lg mx-1">-</span> {format(slot.end, "HH:mm")}
                               </div>
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
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
}
