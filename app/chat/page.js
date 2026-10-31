"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getLocalProfile, clearLocalProfile } from "../../lib/identity";

export default function ChatList() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const profile = getLocalProfile();
    if (!profile) {
      router.replace("/");
      return;
    }
    setMe(profile);
    loadPeople(profile.id);
  }, [router]);

  async function loadPeople(myId) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, bio")
      .neq("id", myId)
      .order("name");
    setPeople(data || []);
  }

  function logout() {
    clearLocalProfile();
    router.replace("/");
  }

  const filtered = people.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

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
          className="field"
          placeholder="Ad və ya ID ilə axtar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 && <div className="empty">Hələ heç kim tapılmadı.</div>}
        {filtered.map((p) => (
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
