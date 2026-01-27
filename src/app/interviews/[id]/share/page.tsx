import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function SharePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ token: string }> }) {
  const { id } = await params;
  const { token } = await searchParams;
  
  // In real app, use request.headers to get host or env var
  const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/i/${token}`;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-secondary/30 backdrop-blur-md p-10 text-center shadow-xl">
             <div className="flex justify-center">
               <div className="rounded-full bg-green-500/10 p-3 ring-1 ring-green-500/30">
                  <CheckCircle2 className="h-12 w-12 text-green-500 animate-pulse" />
               </div>
             </div>
             <h1 className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                 リンクを発行しました！
             </h1>
             <p className="text-muted-foreground">候補者にこのリンクを共有してください。</p>
             
             <div className="flex items-center gap-2 p-2 pr-2 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                 <div className="flex-1 px-3 py-2 font-mono text-sm text-muted-foreground truncate text-left">
                    {shareLink}
                 </div>
                 <CopyButton value={shareLink} className="shrink-0" />
             </div>
             
             <div className="flex gap-4 justify-center">
                 <Link href={`/interviews/${id}/suggestions`}>
                    <Button variant="outline">提案を見る</Button>
                 </Link>
             </div>
        </div>
    </div>
  )
}
