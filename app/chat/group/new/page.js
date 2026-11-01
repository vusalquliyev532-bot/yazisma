"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { getLocalProfile } from "../../../../lib/identity";

export default function NewGroup() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) { router.replace("/"); return; }
    setMe(profile);
  }, [router]);

  useEffect(() => {
    if (!me) return;
    const term = search.trim().toLowerCase();
    if (!term) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name")
        .neq("id", me.id)
        .ilike("id", `%${term}%`)
        .limit(15);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [search, me]);

  function toggle(p) {
    setSelected((prev) => prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]);
  }

  async function createGroup() {
    setErr("");
    if (!name.trim()) return setErr("Qrup adı yaz.");
    if (selected.length === 0) return setErr("Ən azı bir üzv seç.");
    setLoading(true);
    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name: name.trim(), created_by: me.id })
      .select()
      .single();
    if (error) { setLoading(false); return setErr("Xəta baş verdi."); }

    const members = [...selected.map((s) => s.id), me.id].map((profile_id) => ({ group_id: group.id, profile_id }));
    await supabase.from("group_members").insert(members);
    setLoading(false);
    router.replace(`/chat/group/${group.id}`);
  }

  if (!me) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" style={{ width: "auto", padding: "6px 10px", borderRadius: 8 }} onClick={() => router.push("/chat")}>←</button>
        <strong>Yeni qrup</strong>
      </div>

      <div className="pad" style={{ paddingBottom: 0 }}>
        <input className="field" placeholder="Qrup adı" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field mono" placeholder="Üzv axtar (ID)" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {selected.map((s) => (
              <span key={s.id} onClick={() => toggle(s)} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px", fontSize: "0.85rem", cursor: "pointer" }}>
                {s.name} ✕
              </span>
            ))}
          </div>
        )}
        {err && <div className="error">{err}</div>}
        <button className="btn" onClick={createGroup} disabled={loading}>{loading ? "Yaradılır..." : "Qrupu yarat"}</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {results.map((p) => (
          <div key={p.id} className="list-item" onClick={() => toggle(p)}>
            <div className="avatar-letter">{p.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="name-row">
                <strong>{p.name}</strong>
                <span className="id-tag mono">@{p.id}</span>
              </div>
            </div>
            <div>{selected.some((x) => x.id === p.id) ? "✓" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
