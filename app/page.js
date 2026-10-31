"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { saveLocalProfile, getLocalProfile } from "../lib/identity";

export default function Home() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState(null); // "new" | "existing" | null
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getLocalProfile();
    if (existing) router.replace("/chat");
  }, [router]);

  async function checkId() {
    setErr("");
    const cleanId = id.trim().toLowerCase().replace(/\s+/g, "");
    if (!cleanId) return setErr("ID daxil et.");
    setId(cleanId);
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", cleanId)
      .maybeSingle();
    setLoading(false);
    if (error) return setErr("Xəta baş verdi, yenidən cəhd et.");
    setMode(data ? "existing" : "new");
  }

  async function handleLogin() {
    setErr("");
    if (pin.length !== 4) return setErr("4 rəqəmli kodu daxil et.");
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("pin", pin)
      .maybeSingle();
    setLoading(false);
    if (error || !data) return setErr("ID və ya kod səhvdir.");
    saveLocalProfile(data);
    router.replace("/chat");
  }

  async function handleRegister() {
    setErr("");
    if (!name.trim()) return setErr("Adını yaz.");
    if (pin.length !== 4) return setErr("4 rəqəmli kod seç (başqa cihazdan girmək üçün lazım olacaq).");
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id, name: name.trim(), bio: bio.trim(), pin })
      .select()
      .single();
    setLoading(false);
    if (error) return setErr("Bu ID artıq götürülüb, başqasını sına.");
    saveLocalProfile(data);
    router.replace("/chat");
  }

  return (
    <div className="screen pad">
      <div style={{ marginTop: 40 }}>
        <div className="title">Yazışma</div>
        <div className="subtitle">Profil şəkli yoxdur — sadəcə ID, ad və bio.</div>

        {mode === null && (
          <>
            <input
              className="field mono"
              placeholder="öz ID-ni seç (məs: vusal_c)"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkId()}
              autoCapitalize="none"
            />
            {err && <div className="error">{err}</div>}
            <button className="btn" onClick={checkId} disabled={loading}>
              {loading ? "Yoxlanılır..." : "Davam et"}
            </button>
          </>
        )}

        {mode === "existing" && (
          <>
            <div className="subtitle">
              <span className="mono">{id}</span> artıq var. Girmək üçün 4 rəqəmli kodunu daxil et.
            </div>
            <input
              className="field mono"
              placeholder="PIN (4 rəqəm)"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {err && <div className="error">{err}</div>}
            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Daxil olunur..." : "Daxil ol"}
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => { setMode(null); setErr(""); }}>
              Geri
            </button>
          </>
        )}

        {mode === "new" && (
          <>
            <div className="subtitle">
              <span className="mono">{id}</span> boşdur — yeni profil yarat.
            </div>
            <input
              className="field"
              placeholder="Adın"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="field"
              placeholder="Bio (istəyə görə)"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              className="field mono"
              placeholder="4 rəqəmli kod seç"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
            {err && <div className="error">{err}</div>}
            <button className="btn" onClick={handleRegister} disabled={loading}>
              {loading ? "Yaradılır..." : "Profili yarat"}
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => { setMode(null); setErr(""); }}>
              Geri
            </button>
          </>
        )}
      </div>
    </div>
  );
}
