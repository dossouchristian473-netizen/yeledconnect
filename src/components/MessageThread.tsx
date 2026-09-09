"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function MessageThread({ currentUserId, otherUserId }: { currentUserId: string; otherUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at, read_at")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    setMessages(data ?? []);
    setLoading(false);

    const unread = (data ?? []).filter((m) => m.recipient_id === currentUserId && !m.read_at);
    await Promise.all(unread.map((m) => supabase.rpc("mark_message_read", { _message_id: m.id })));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    if (!body.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, recipient_id: otherUserId, body: body.trim() });
    if (!error) {
      setBody("");
      await load();
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-2.5">
        {!loading && messages.length === 0 && (
          <p className="text-soft text-[14px] text-center pt-8">
            Aucun message pour le moment. Écrivez le premier !
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-md2 px-4 py-2.5 text-[14px] ${
                  mine ? "bg-blue-dark text-white" : "bg-card shadow-card text-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <div className={`text-[10.5px] mt-1 ${mine ? "text-white/70" : "text-faint"}`}>
                  {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pt-3 pb-6 flex items-center gap-2.5">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Écrire un message..."
          className="flex-1 border border-border bg-card rounded-full px-[18px] py-3 text-[14.5px]"
        />
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          className="rounded-full bg-blue-dark text-white font-bold text-[13.5px] px-5 py-3 flex-shrink-0 disabled:opacity-60"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
