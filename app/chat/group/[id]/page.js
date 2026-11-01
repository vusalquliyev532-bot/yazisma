"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { getLocalProfile } from "../../../../lib/identity";

export default function GroupRoom() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id;

  const [me, setMe] = useState(null);
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [names, setNames] = useState({});
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) { router.replace("/"); return; }
    setMe(profile);
    init(profile.id);

    const channel = supabase
      .channel(`group-${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        if (m.group_id === groupId) {
          setMessages((prev) => [...prev, m]);
          ensureName(m.from_id);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function init(myId) {
    const { data: g } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle();
    setGroup(g);

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });
    setMessages(history || []);

    const ids = [...new Set((history || []).map((m) => m.from_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, name").in("id", ids);
      const map = {};
      (profs || []).forEach((p) => (map[p.id] = p.name));
      setNames(map);
    }
  }

  function ensureName(id) {
    setNames((prev) => {
      if (prev[id]) return prev;
      supabase.from("profiles").select("id, name").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) setNames((p) => ({ ...p, [data.id]: data.name }));
      });
      return prev;
    });
  }

  async function send() {
    const content = text.trim();
    if (!content || !me) return;
    setText("");
    await supabase.from("messages").insert({ from_id: me.id, group_id: groupId, content });
  }

  if (!me) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" style={{ width: "auto", padding: "6px 10px", borderRadius: 8 }} onClick={() => router.push("/chat")}>←</button>
        <strong>{group?.name || "Qrup"}</strong>
      </div>

      <div className="msg-area">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.from_id === me.id ? "mine" : "theirs"}`}>
            {m.from_id !== me.id && (
              <div style={{ fontSize: "0.75rem", color: "var(--accent)", marginBottom: 2 }}>{names[m.from_id] || m.from_id}</div>
            )}
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <input className="field" style={{ marginBottom: 0 }} placeholder="Mesaj yaz..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="btn" onClick={send}>Göndər</button>
      </div>
    </div>
  );
}
