// src/lib/saveAvatar.ts
import { supabase } from "./supabase";

/**
 * Uploads the file to Storage under a key allowed by your RLS,
 * returns the public URL and persists it to public.users.avatar_url
 * (and Auth metadata for convenience).
 */
export async function saveAvatar(file: File): Promise<string> {
  const { data: { session }, error: sessErr } = await supabase.auth.getSession();
  if (sessErr) throw sessErr;
  if (!session) throw new Error("Not authenticated");

  const uid = session.user.id;
  const ext = (file.type.split("/")[1] || "png").toLowerCase();

  // RLS-friendly key: avatars/avatar-<uid>-<something>.<ext>
  // Using a stable key with upsert avoids piling up old files.
  const filePath = `avatars/avatar-${uid}-current.${ext}`;

  const { error: uploadErr } = await supabase
    .storage
    .from("user-content-avatar")
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type || "image/png",
      upsert: true, // overwrite the "current" avatar
    });

  if (uploadErr) throw uploadErr;

  const { data } = supabase
    .storage
    .from("user-content-avatar")
    .getPublicUrl(filePath);

  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error("Could not get public URL");

  // Persist to your public.users table (Header will read from here)
  await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", uid);

  // Optional: also store in Auth metadata so places reading only auth.user see it
  try {
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
  } catch {
    // non-fatal if this fails
  }

  return publicUrl;
}
