"use client";

import { useState } from "react";
import { registerShotClip } from "@/app/(product)/actions";
import { createClient } from "@/lib/supabase/browser";
import { ASSEMBLY_CLIP_MIME, isAssemblyClip } from "@/lib/studio/domain";

export function ShotUploader({ workspaceId, productionId, shotId }: { workspaceId: string; productionId: string; shotId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("clip") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !isAssemblyClip(file.type, file.size)) {
      setMessage("Choose an MP4 clip up to 100 MB.");
      return;
    }
    setBusy(true); setMessage("");
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
    const path = `workspace/${workspaceId}/production/${productionId}/shots/${shotId}/${crypto.randomUUID()}-${cleanName}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("creative-assets").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); setMessage("Upload failed. Try again."); return; }
    const metadata = new FormData();
    metadata.set("production_id", productionId);
    metadata.set("shot_id", shotId);
    metadata.set("storage_path", path);
    metadata.set("mime_type", file.type);
    metadata.set("byte_size", String(file.size));
    const result = await registerShotClip(metadata);
    if (!result.ok) {
      await supabase.storage.from("creative-assets").remove([path]);
      setMessage(result.error);
    } else {
      input.value = "";
      setMessage("Clip uploaded.");
    }
    setBusy(false);
  }

  return <form className="clip-upload" onSubmit={upload}><label>Upload assembly-ready MP4<input name="clip" type="file" accept={ASSEMBLY_CLIP_MIME} required /></label><button className="button button-outline" type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload version"}</button>{message ? <small role="status">{message}</small> : null}</form>;
}
