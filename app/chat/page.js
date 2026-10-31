"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getLocalProfile, clearLocalProfile } from "../../lib/identity";

export default function ChatList() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) {
      router.replace("/");
      return;
    }
    setMe(profile);
  }, [router]);

  useEffect(() => {
    if (!me) return;
    const term = search.trim().toLowerCase();
    if (!term) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, bio")
        .neq("id", me.id)
        .ilike("id", `%${term}%`)
        .limit(20);
      setResults(data || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, me]);

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
        <button className="btn-ghost" style={{ width: "auto", padding: "6px 12px", borderRadius: 8 }} onClick={logout}>
          Çıxış
        </button>
      </div>

      <div className="pad" style={{ paddingBottom: 0 }}>
        <input
          className="field mono"
          placeholder="ID ilə axtar (məs: vusal_c)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoCapitalize="none"
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {!search.trim() && (
          <div className="empty">Birini tapmaq üçün ID yaz.</div>
        )}
        {search.trim() && searching && <div className="empty">Axtarılır...</div>}
        {search.trim() && !searching && results.length === 0 && (
          <div className="empty">Bu ID ilə heç kim tapılmadı.</div>
        )}
        {results.map((p) => (
          <div key={p.id} className="list-item" onClick={() => router.push(`/chat/${p.id}`)}>
            <div className="avatar-letter">{p.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="name-row">
                <strong>{p.name}</strong>
                <span className="id-tag mono">@{p.id}</span>
              </div>
              <div className="bio-line">{p.bio || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
