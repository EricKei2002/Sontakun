"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Trash2, Loader2 } from "lucide-react";
import { updateLocalCalendarEvent, deleteLocalCalendarEvent } from "@/app/actions/local-calendar";
import type { CalendarEvent } from "@/lib/google-calendar";

interface EventEditModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (updatedEvent?: CalendarEvent) => void;
}

export function EventEditModal({ event, onClose, onUpdate }: EventEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(event.summary);
  const [description, setDescription] = useState(event.description || "");
  const [meetingUrl, setMeetingUrl] = useState(event.meeting_url || "");
  const [notes, setNotes] = useState(event.notes || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if this is a local event (has no htmlLink)
  const isLocalEvent = !event.htmlLink;

  async function handleSave() {
    if (!isLocalEvent) {
      alert("Googleカレンダーのイベントは編集できません");
      return;
    }

    if (!event.id) {
      alert("イベントIDが見つかりません");
      return;
    }

    setLoading(true);
    const result = await updateLocalCalendarEvent(
      event.id,
      title,
      description,
      event.start.dateTime || event.start.date || "",
      event.end.dateTime || event.end.date || "",
      meetingUrl,
      notes
    );

    if (result.success) {
      const updatedEvent: CalendarEvent = {
        id: event.id,
        summary: title,
        description,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink,
        meeting_url: meetingUrl,
        notes,
      };
      onUpdate(updatedEvent);
      onClose();
    } else {
      alert(result.error || "更新に失敗しました");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!isLocalEvent) {
      alert("Googleカレンダーのイベントは削除できません");
      return;
    }

    if (!event.id) {
      alert("イベントIDが見つかりません");
      return;
    }

    setLoading(true);
    const result = await deleteLocalCalendarEvent(event.id);

    if (result.success) {
      onUpdate(undefined);
      onClose();
    } else {
      alert(result.error || "削除に失敗しました");
    }
    setLoading(false);
    setShowDeleteConfirm(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">予定の編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isLocalEvent && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-500">
              Googleカレンダーのイベントは閲覧のみ可能です
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">タイトル</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isLocalEvent || loading}
              className="bg-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">説明</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isLocalEvent || loading}
              className="bg-black/20 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ミーティングURL</label>
            <Input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              disabled={!isLocalEvent || loading}
              className="bg-black/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">メモ</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="準備事項や注意点など..."
              disabled={!isLocalEvent || loading}
              className="bg-black/20 min-h-[100px]"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>開始: {new Date(event.start.dateTime || event.start.date || "").toLocaleString("ja-JP")}</p>
            <p>終了: {new Date(event.end.dateTime || event.end.date || "").toLocaleString("ja-JP")}</p>
          </div>

          {isLocalEvent && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="flex-1 text-red-400 hover:bg-red-500/10"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                この予定を削除する
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                変更
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-secondary/95 backdrop-blur-xl border border-red-500/20 rounded-2xl max-w-sm w-full p-6 shadow-2xl mx-4">
            <h3 className="text-xl font-bold mb-3 text-red-400">本当に削除しますか？</h3>
            <p className="text-sm text-muted-foreground mb-6">
              この操作は取り消せません。予定を完全に削除します。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    削除中...
                  </>
                ) : (
                  "削除する"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
