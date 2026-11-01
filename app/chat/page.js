"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getLocalProfile, clearLocalProfile } from "../../lib/identity";

export default function ChatHome() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) { router.replace("/"); return; }
    setMe(profile);
    loadConvos(profile.id);
  }, [router]);

  async function loadConvos(myId) {
    setLoading(true);

    const { data: dmMsgs } = await supabase
      .from("messages")
      .select("from_id, to_id, content, created_at")
      .is("group_id", null)
      .or(`from_id.eq.${myId},to_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    const dmMap = new Map();
    (dmMsgs || []).forEach((m) => {
      const otherId = m.from_id === myId ? m.to_id : m.from_id;
      if (!otherId) return;
      if (!dmMap.has(otherId)) dmMap.set(otherId, { lastContent: m.content, lastTime: m.created_at });
    });

    const otherIds = [...dmMap.keys()];
    let profiles = [];
    if (otherIds.length) {
      const { data } = await supabase.from("profiles").select("id,name").in("id", otherIds);
      profiles = data || [];
    }
    const dmItems = profiles.map((p) => ({
      type: "dm",
      id: p.id,
      title: p.name,
      subtitle: dmMap.get(p.id).lastContent,
      time: dmMap.get(p.id).lastTime,
    }));

    const { data: memberRows } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name)")
      .eq("profile_id", myId);

    const groupItems = [];
    for (const row of memberRows || []) {
      const g = row.groups;
      if (!g) continue;
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("group_id", g.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      groupItems.push({
        type: "group",
        id: g.id,
        title: g.name,
        subtitle: lastMsg ? lastMsg.content : "Hələ mesaj yoxdur",
        time: lastMsg ? lastMsg.created_at : null,
      });
    }

    const all = [...dmItems, ...groupItems].sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time) - new Date(a.time);
    });

    setConvos(all);
    setLoading(false);
  }

  function logout() {
    clearLocalProfile();
    router.replace("/");
  }

  if (!me) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <div className="name-row">
            <strong>{me.name}</strong>
            <span className="id-tag mono">@{me.id}</span>
          </div>
        </div>
        <button className="btn-ghost" style={{ width: "auto", padding: "6px 12px", borderRadius: 8 }} onClick={logout}>Çıxış</button>
      </div>

      <div className="pad" style={{ paddingBottom: 0, display: "flex", gap: 8 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => router.push("/chat/search")}>+ Yeni söhbət</button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.push("/chat/group/new")}>+ Qrup</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginTop: 8 }}>
        {loading && <div className="empty">Yüklənir...</div>}
        {!loading && convos.length === 0 && <div className="empty">Hələ söhbətin yoxdur. "+ Yeni söhbət" ilə başla.</div>}
        {convos.map((c) => (
          <div key={c.type + c.id} className="list-item" onClick={() => router.push(c.type === "group" ? `/chat/group/${c.id}` : `/chat/${c.id}`)}>
            <div className="avatar-letter">{c.type === "group" ? "G" : c.title.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="name-row">
                <strong>{c.title}</strong>
                {c.type === "group" && <span className="id-tag">qrup</span>}
              </div>
              <div className="bio-line">{c.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
