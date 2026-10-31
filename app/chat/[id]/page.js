"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { getLocalProfile } from "../../../lib/identity";

export default function ChatRoom() {
  const router = useRouter();
  const params = useParams();
  const otherId = params.id;

  const [me, setMe] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) {
      router.replace("/");
      return;
    }
    setMe(profile);
    init(profile.id);

    const channel = supabase
      .channel(`room-${[profile.id, otherId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          const belongs =
            (m.from_id === profile.id && m.to_id === otherId) ||
            (m.from_id === otherId && m.to_id === profile.id);
          if (belongs) setMessages((prev) => [...prev, m]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function init(myId) {
    const { data: otherProfile } = await supabase
      .from("profiles")
      .select("id, name, bio")
      .eq("id", otherId)
      .maybeSingle();
    setOther(otherProfile);

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_id.eq.${myId},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${myId})`
      )
      .order("created_at", { ascending: true });
    setMessages(history || []);
  }

  async function send() {
    const content = text.trim();
    if (!content || !me) return;
    setText("");
    await supabase.from("messages").insert({
      from_id: me.id,
      to_id: otherId,
      content,
    });
  }

  if (!me) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <button
          className="btn-ghost"
          style={{ width: "auto", padding: "6px 10px", borderRadius: 8 }}
          onClick={() => router.push("/chat")}
        >
          ←
        </button>
        <div>
          <div className="name-row">
            <strong>{other?.name || otherId}</strong>
            <span className="id-tag mono">@{otherId}</span>
          </div>
          {other?.bio && <div className="bio-line">{other.bio}</div>}
        </div>
      </div>

      <div className="msg-area">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.from_id === me.id ? "mine" : "theirs"}`}>
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <input
          className="field"
          style={{ marginBottom: 0 }}
          placeholder="Mesaj yaz..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn" onClick={send}>
          Göndər
        </button>
      </div>
    </div>
  );
}
