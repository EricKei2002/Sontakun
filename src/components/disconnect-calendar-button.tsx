"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { disconnectCalendar } from "@/app/dashboard/actions";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DisconnectCalendarButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDisconnect = () => {
    startTransition(async () => {
      await disconnectCalendar();
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
          disabled={isPending}
          title="連携を解除"
        >
          <LogOut className="w-4 h-4 mr-1" />
          解除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>連携を解除しますか？</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Googleカレンダーとの連携を解除します。<br/>
            解除後はカレンダーの自動同期機能などが利用できなくなります。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">キャンセル</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDisconnect} 
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            {isPending ? "解除中..." : "解除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
