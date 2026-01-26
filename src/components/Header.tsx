import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/60 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/50">
          <Image
            src="/sontakun-icon.jpg"
            alt="Sontakun Icon"
            fill
            className="object-cover"
          />
        </div>
        <span className="text-lg font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Sontaくん
        </span>
      </Link>
      
      <nav className="flex gap-4">
        {/* Future nav items can go here */}
      </nav>
    </header>
  );
}
