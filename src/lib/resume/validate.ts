import { MAX_RESUME_BYTES, RESUME_TYPES, type ResumeKind } from "./constants";

export type ResumeCheck =
  | { ok: true; kind: ResumeKind; mimeType: string; filename: string }
  | { ok: false; message: string };

// Checks a resume file by looking at its actual bytes, not just its name.
// Anyone can rename virus.exe to resume.pdf; the first few bytes of a file
// (its "magic number") reveal what it really is.
export function checkResumeFile(name: string, bytes: Uint8Array): ResumeCheck {
  if (bytes.length === 0) {
    return { ok: false, message: "That file is empty. Try exporting your resume again." };
  }
  if (bytes.length > MAX_RESUME_BYTES) {
    return {
      ok: false,
      message: "That file is larger than 4 MB. Try saving it without images, or as a PDF.",
    };
  }

  const filename = cleanFilename(name);
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension === "doc" || startsWith(bytes, OLE_SIGNATURE)) {
    return {
      ok: false,
      message:
        "That's the older Word .doc format. In Word, choose File → Save As → Word Document (.docx), or save it as a PDF.",
    };
  }
  if (extension !== "pdf" && extension !== "docx") {
    return { ok: false, message: "Please upload a PDF or a Word document (.docx)." };
  }

  const detected = detectKind(bytes);
  if (detected === "docx-macro") {
    return {
      ok: false,
      message: "That Word file contains macros, which we don't accept. Save a copy as a regular .docx or PDF.",
    };
  }
  if (detected !== extension) {
    return {
      ok: false,
      message: `That file says it's a .${extension}, but its contents don't match. Try exporting it again from your word processor.`,
    };
  }
  if (detected === "pdf" && includesAscii(bytes, "/Encrypt")) {
    return {
      ok: false,
      message: "That PDF is password-protected, so we can't read it. Save an unprotected copy and upload that.",
    };
  }

  return { ok: true, kind: detected, mimeType: RESUME_TYPES[detected].mimeType, filename };
}

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // "PK\x03\x04" — .docx files are ZIP archives
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0]; // legacy .doc

function detectKind(bytes: Uint8Array): ResumeKind | "docx-macro" | "unknown" {
  if (startsWith(bytes, PDF_SIGNATURE)) return "pdf";
  if (startsWith(bytes, ZIP_SIGNATURE)) {
    // Every Word document contains these entries; other ZIPs (and .xlsx,
    // .pptx) don't. File names in a ZIP are stored as plain text.
    const isWord =
      includesAscii(bytes, "[Content_Types].xml") &&
      includesAscii(bytes, "word/document.xml");
    if (!isWord) return "unknown";
    return includesAscii(bytes, "vbaProject.bin") ? "docx-macro" : "docx";
  }
  return "unknown";
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((b, i) => bytes[i] === b);
}

function includesAscii(bytes: Uint8Array, text: string) {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).includes(text, 0, "latin1");
}

// Keep the original name for display only: drop any folder path and
// invisible control characters, and cap the length.
export function cleanFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "";
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!cleaned) return "resume";
  if (cleaned.length <= 255) return cleaned;
  const dot = cleaned.lastIndexOf(".");
  const ext = dot > 0 ? cleaned.slice(dot) : "";
  return cleaned.slice(0, 255 - ext.length) + ext;
}
