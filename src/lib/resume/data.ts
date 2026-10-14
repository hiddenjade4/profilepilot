import "server-only";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ResumeStatus = "uploaded" | "processing" | "processed" | "failed";

export type MyResume = {
  id: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  status: ResumeStatus;
  uploadedAt: string; // ISO timestamp
};

// The signed-in user's current resume, or null. Row Level Security limits
// this query to their own row.
export async function getMyResume(): Promise<MyResume | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resumes")
    .select("id, storage_path, original_filename, mime_type, size_bytes, status, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load resume", { code: error.code });
    throw new Error("We couldn't load your resume. Please refresh.");
  }
  if (!data) return null;

  return {
    id: data.id,
    storagePath: data.storage_path,
    filename: data.original_filename,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    status: data.status,
    uploadedAt: data.updated_at,
  };
}
