import { supabase } from "./supabaseClient";

export async function uploadImage(bucket, file, idHint) {
  const ext = file.name.split(".").pop();
  const path = `${idHint}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
