import Link from "next/link";
import { UserAuthForm } from "@/components/user-auth-form";

export default function LoginPage() {
  return (
    <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ログイン
          </h1>
          <p className="text-sm text-muted-foreground">
            以下のプロバイダーを選択して続行してください
          </p>
        </div>
        <div className="grid gap-6">
            <UserAuthForm />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          続行することで、{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            利用規約
          </Link>{" "}
          および{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            プライバシーポリシー
          </Link>{" "}
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
