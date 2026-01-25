import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function SharePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ token: string }> }) {
  const { id } = await params;
  const { token } = await searchParams;
  
  // In real app, use request.headers to get host or env var
  const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/i/${token}`;

  return (
    <div className="container flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-10 text-center shadow-lg">
             <div className="flex justify-center">
               <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
             </div>
             <h1 className="text-2xl font-bold">リンクを発行しました！</h1>
             <p className="text-muted-foreground">候補者にこのリンクを共有してください。</p>
             
             <div className="p-4 bg-muted rounded-md break-all font-mono text-sm relative group cursor-pointer hover:bg-muted/80 transition-colors">
                 {shareLink}
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
