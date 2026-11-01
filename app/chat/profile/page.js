"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { uploadImage } from "../../../lib/upload";
import { getLocalProfile, saveLocalProfile } from "../../../lib/identity";

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = getLocalProfile();
    if (!p) { router.replace("/"); return; }
    setMe(p);
    setBio(p.bio || "");
    setAvatarPreview(p.avatar_url || null);
  }, [router]);

  function pickAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function save() {
    setSaving(true);
    let avatar_url = me.avatar_url || null;
    if (avatarFile) avatar_url = await uploadImage("avatars", avatarFile, me.id);
    const { data, error } = await supabase
      .from("profiles")
      .update({ bio: bio.trim(), avatar_url })
      .eq("id", me.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      saveLocalProfile(data);
      router.push("/chat");
    }
  }

  if (!me) return null;

  return (
    <div className="screen">
      <div className="topbar">
        <button className="btn-ghost" style={{ width: "auto", padding: "6px 10px", borderRadius: 8 }} onClick={() => router.push("/chat")}>←</button>
        <strong>Profilim</strong>
      </div>
      <div className="pad">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <label className="avatar-picker">
            {avatarPreview ? <img src={avatarPreview} className="avatar-img-lg" /> : <div className="avatar-letter avatar-lg">{me.name.charAt(0).toUpperCase()}</div>}
            <input type="file" accept="image/*" hidden onChange={pickAvatar} />
          </label>
        </div>
        <div className="subtitle" style={{ textAlign: "center" }}>
          <span className="mono">@{me.id}</span>
        </div>
        <textarea className="field" rows={3} placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <button className="btn" onClick={save} disabled={saving}>{saving ? "Saxlanılır..." : "Saxla"}</button>
      </div>
    </div>
  );
}
