import { CreateInterviewForm } from "./form";

export default function NewInterviewPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-10 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sontakun</h1>
          <p className="text-muted-foreground">新規日程調整</p>
        </div>
        <CreateInterviewForm />
      </div>
    </div>
  );
}
