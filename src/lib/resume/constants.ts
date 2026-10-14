// Shared by the browser (quick pre-checks) and the server (the real checks).

// 4 MB. Vercel rejects request bodies over 4.5 MB, so the limit leaves room
// for upload overhead. The storage bucket and database enforce it too.
export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export const RESUME_TYPES = {
  pdf: { mimeType: "application/pdf", label: "PDF" },
  docx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word (.docx)",
  },
} as const;

export type ResumeKind = keyof typeof RESUME_TYPES;

// For the file picker's "accept" attribute.
export const RESUME_ACCEPT = [
  ".pdf",
  ".docx",
  RESUME_TYPES.pdf.mimeType,
  RESUME_TYPES.docx.mimeType,
].join(",");

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
