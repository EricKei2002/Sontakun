"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const supabase = createClient();
    const router = useRouter();

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.refresh();
    }

    return (
        <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
        </Button>
    )
}
