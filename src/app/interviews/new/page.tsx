import { CreateInterviewForm } from "./form";

export default function NewInterviewPage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-secondary/30 backdrop-blur-md p-10 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Sontakun
          </h1>
          <p className="text-muted-foreground">新規日程調整を作成</p>
        </div>
        <CreateInterviewForm />
      </div>
    </div>
  );
}
