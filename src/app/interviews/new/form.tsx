"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterview } from "../actions";

export function CreateInterviewForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      try {
        await createInterview(formData);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
       <div className="space-y-2">
         <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            面談タイトル
         </label>
         <Input name="title" placeholder="例: エンジニア採用面談" required />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            採用担当者名
         </label>
         <Input name="recruiter_name" placeholder="あなたの名前" required />
       </div>
       <Button type="submit" disabled={loading} className="w-full">
         {loading ? "作成中..." : "共有リンクを発行"}
       </Button>
    </form>
  );
}
