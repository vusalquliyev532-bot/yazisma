"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { saveLocalProfile, getLocalProfile } from "../lib/identity";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function generateUniqueId() {
  for (let i = 0; i < 8; i++) {
    let candidate = "";
    for (let j = 0; j < 7; j++) candidate += CHARS[Math.floor(Math.random() * CHARS.length)];
    const { data } = await supabase.from("profiles").select("id").eq("id", candidate).maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("id yaradıla bilmədi");
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState("register");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pass, setPass] = useState("");

  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [newId, setNewId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = getLocalProfile();
    if (existing) router.replace("/chat");
  }, [router]);

  async function handleRegister() {
    setErr("");
    if (!name.trim()) return setErr("Adını yaz.");
    if (!/^\d{4,}$/.test(pass)) return setErr("Şifrə ən azı 4 rəqəmdən ibarət olmalıdır.");
    setLoading(true);
    try {
      const id = await generateUniqueId();
      const { data, error } = await supabase
        .from("profiles")
        .insert({ id, name: name.trim(), bio: bio.trim(), pin: pass })
        .select()
        .single();
      setLoading(false);
      if (error) return setErr("Xəta baş verdi, yenidən cəhd et.");
      saveLocalProfile(data);
      setNewId(data.id);
    } catch {
      setLoading(false);
      setErr("Xəta baş verdi, yenidən cəhd et.");
    }
  }

  async function handleLogin() {
    setErr("");
    const cleanId = loginId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanId.length !== 7) return setErr("7 simvoldan ibarət ID daxil et.");
    if (!loginPass) return setErr("Şifrəni daxil et.");
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", cleanId)
      .eq("pin", loginPass)
      .maybeSingle();
    setLoading(false);
    if (error || !data) return setErr("ID və ya şifrə səhvdir.");
    saveLocalProfile(data);
    router.replace("/chat");
  }

  function copyId() {
    navigator.clipboard?.writeText(newId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (newId) {
    return (
      <div className="screen pad">
        <div style={{ marginTop: 48 }}>
          <div className="title">Hazırsan</div>
          <div className="subtitle">Bu sənin ID-ndir — başqa cihazdan girmək və ya tanışlarına özünü tapdırmaq üçün lazım olacaq. Unutma.</div>
          <div className="id-reveal" onClick={copyId}>
            <span className="mono">{newId}</span>
            <span className="copy-hint">{copied ? "Kopyalandı" : "Toxun, kopyala"}</span>
          </div>
          <button className="btn" style={{ marginTop: 20 }} onClick={() => router.replace("/chat")}>
            Davam et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen pad">
      <div style={{ marginTop: 40 }}>
        <div className="title">Yazışma</div>
        <div className="subtitle">Profil şəkli yoxdur — sadəcə ad, bio və şifrə.</div>

        <div className="tabs">
          <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setErr(""); }}>Yeni profil</button>
          <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setErr(""); }}>Daxil ol</button>
        </div>

        {tab === "register" && (
          <>
            <input className="field" placeholder="Adın" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" name="yazisma-name-field" />
            <textarea className="field" placeholder="Bio (istəyə görə)" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} autoComplete="off" name="yazisma-bio-field" />
            <input className="field mono" placeholder="Şifrə (ən azı 4 rəqəm)" inputMode="numeric" value={pass} onChange={(e) => setPass(e.target.value.replace(/\D/g, ""))} autoComplete="off" name="yazisma-pass-field" />
            {err && <div className="error">{err}</div>}
            <button className="btn" onClick={handleRegister} disabled={loading}>{loading ? "Yaradılır..." : "Profili yarat"}</button>
          </>
        )}

        {tab === "login" && (
          <>
            <input className="field mono" placeholder="7 simvollu ID" maxLength={7} value={loginId} onChange={(e) => setLoginId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))} autoComplete="off" name="yazisma-loginid-field" />
            <input className="field mono" placeholder="Şifrə" inputMode="numeric" value={loginPass} onChange={(e) => setLoginPass(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && handleLogin()} autoComplete="off" name="yazisma-loginpass-field" />
            {err && <div className="error">{err}</div>}
            <button className="btn" onClick={handleLogin} disabled={loading}>{loading ? "Daxil olunur..." : "Daxil ol"}</button>
          </>
        )}
      </div>
    </div>
  );
}
