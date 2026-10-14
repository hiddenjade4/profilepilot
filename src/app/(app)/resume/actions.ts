"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { MAX_RESUME_BYTES } from "@/lib/resume/constants";
import { getMyResume } from "@/lib/resume/data";
import { checkResumeFile } from "@/lib/resume/validate";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "resumes";

export type ResumeActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function uploadResume(
  _prev: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file to upload." };
  }
  // Cheap size check before reading the whole file into memory.
  if (file.size > MAX_RESUME_BYTES) {
    return {
      status: "error",
      message: "That file is larger than 4 MB. Try saving it without images, or as a PDF.",
    };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkResumeFile(file.name, bytes);
  if (!check.ok) return { status: "error", message: check.message };

  const supabase = await createClient();
  const previous = await getMyResume();

  // Random file name inside the user's own folder. The storage rules only
  // allow writes where the first folder equals the user's id.
  const storagePath = `${user.id}/${crypto.randomUUID()}.${check.kind}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: check.mimeType, upsert: false });

  if (uploadError) {
    console.error("Resume upload failed", { name: uploadError.name });
    return {
      status: "error",
      message: "We couldn't store your file. Please try again in a moment.",
    };
  }

  const record = {
    storage_path: storagePath,
    original_filename: check.filename,
    mime_type: check.mimeType,
    size_bytes: bytes.length,
    status: "uploaded",
  };
  const { error: dbError } = previous
    ? await supabase.from("resumes").update(record).eq("id", previous.id)
    : await supabase.from("resumes").insert({ ...record, user_id: user.id });

  if (dbError) {
    console.error("Saving resume record failed", { code: dbError.code });
    // Don't leave an orphaned file behind.
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return {
      status: "error",
      message: "We couldn't save your resume. Please try again.",
    };
  }

  // Replacing: the old file is no longer needed, so remove it right away
  // rather than keeping personal data longer than necessary.
  if (previous) {
    const { error } = await supabase.storage.from(BUCKET).remove([previous.storagePath]);
    if (error) console.error("Removing replaced resume failed", { name: error.name });
  }

  revalidatePath("/resume");
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: previous ? "Resume replaced." : "Resume uploaded.",
  };
}

export async function deleteResume(): Promise<ResumeActionState> {
  await requireUser();
  const resume = await getMyResume();
  if (!resume) return { status: "success", message: "There was no resume to delete." };

  const supabase = await createClient();

  // Delete the file first: if that fails, keep the record so the user can
  // see the file still exists and try again.
  const { error: fileError } = await supabase.storage
    .from(BUCKET)
    .remove([resume.storagePath]);
  if (fileError) {
    console.error("Deleting resume file failed", { name: fileError.name });
    return { status: "error", message: "We couldn't delete your file. Please try again." };
  }

  const { error: dbError } = await supabase.from("resumes").delete().eq("id", resume.id);
  if (dbError) {
    console.error("Deleting resume record failed", { code: dbError.code });
    return { status: "error", message: "We couldn't finish deleting. Please try again." };
  }

  revalidatePath("/resume");
  revalidatePath("/dashboard");
  return { status: "success", message: "Your resume has been permanently deleted." };
}
