"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteInterview } from "@/app/dashboard/actions";
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

export function DeleteInterviewButton({ interviewId }: { interviewId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteInterview(interviewId);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            この操作は取り消せません。面談データおよび関連するすべての回答データが完全に削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">キャンセル</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700 text-white border-none"
          >
            {loading ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
