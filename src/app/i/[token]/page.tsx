import { createClient } from "@/lib/supabase/server";
import { CandidateForm } from "./form";
import { notFound } from "next/navigation";

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  
  const { data: tokenData } = await supabase.from('interview_tokens')
    .select('*, interviews(title, recruiter_name)')
    .eq('token', token)
    .single();
  
  if (!tokenData) return notFound();

  return (
     <div className="container max-w-2xl min-h-screen flex flex-col justify-center py-20">
        <div className="mb-10 space-y-2">
            <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                こんにちは。
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
            <strong className="text-foreground">{tokenData.interviews.recruiter_name}</strong> さんが<br/><span className="text-foreground">&quot;{tokenData.interviews.title}&quot;</span> の日程調整をお願いしています。<br/>
            ご都合の良い日時を教えていただけますか？
            </p>
        </div>
        
        <CandidateForm token={token} />
     </div>
  );
}
