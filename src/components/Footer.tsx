import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 mt-12">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0 mx-auto px-4 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center leading-loose md:text-left">
            Built by{" "}
            <a
              href="https://twitter.com/EricKei_2002"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              EricKei
            </a>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            利用規約
          </Link>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            プライバシーポリシー
          </Link>
          <a href="https://www.burst.style/#contact" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-primary">
            お問い合わせ
          </a>
        </div>
      </div>
    </footer>
  );
}
