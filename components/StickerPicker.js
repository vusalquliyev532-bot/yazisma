"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { uploadImage } from "../lib/upload";

export default function StickerPicker({ me, onSelect }) {
  const [stickers, setStickers] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("stickers").select("*").eq("owner_id", me.id).order("created_at", { ascending: false });
    setStickers(data || []);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage("stickers", file, me.id);
    await supabase.from("stickers").insert({ owner_id: me.id, url });
    load();
  }

  return (
    <div className="sticker-panel">
      <div className="sticker-grid">
        <button className="sticker-add" onClick={() => fileRef.current?.click()}>+</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
        {stickers.map((s) => (
          <img key={s.id} src={s.url} className="sticker-thumb" onClick={() => onSelect(s.url)} />
        ))}
        {stickers.length === 0 && <div className="sticker-empty">Hələ stikerin yoxdur, + ilə əlavə et</div>}
      </div>
    </div>
  );
}
