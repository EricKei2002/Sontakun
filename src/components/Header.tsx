import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button"; 
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      
      <nav className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
             <Link href="/dashboard">
                <Button variant="ghost" className="text-foreground">Sontaくん Dashboard </Button> 
             </Link>
             <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
             </span>
             {user.user_metadata.avatar_url && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                     <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="User Avatar" 
                        fill 
                        className="object-cover" 
                     />
                </div>
             )}
             <SignOutButton />
          </div>
        ) : (
          <></>
        )}
      </nav>
    </header>
  );
}
