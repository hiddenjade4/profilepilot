import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_RESUME_BYTES } from "@/lib/resume/constants";
import { checkResumeFile, cleanFilename } from "@/lib/resume/validate";

// Small synthetic files that carry the same identifying bytes as real ones.
const ascii = (s: string) => new TextEncoder().encode(s);
const join = (...parts: (Uint8Array | number[])[]) =>
  Uint8Array.from(parts.flatMap((p) => Array.from(p)));

const pdf = ascii("%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF");
const zipHeader = [0x50, 0x4b, 0x03, 0x04];
const docx = join(zipHeader, ascii("....[Content_Types].xml....word/document.xml...."));
const docm = join(zipHeader, ascii("[Content_Types].xml word/document.xml word/vbaProject.bin"));
const xlsx = join(zipHeader, ascii("[Content_Types].xml xl/workbook.xml"));
const legacyDoc = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("checkResumeFile", () => {
  it("accepts a real PDF", () => {
    expect(checkResumeFile("Jordan Rivera Resume.pdf", pdf)).toMatchObject({
      ok: true,
      kind: "pdf",
      mimeType: "application/pdf",
    });
  });

  it("accepts a real Word document", () => {
    expect(checkResumeFile("resume.DOCX", docx)).toMatchObject({ ok: true, kind: "docx" });
  });

  it("rejects an empty file", () => {
    expect(checkResumeFile("resume.pdf", new Uint8Array())).toMatchObject({ ok: false });
  });

  it("rejects a file over 4 MB", () => {
    const big = new Uint8Array(MAX_RESUME_BYTES + 1);
    big.set(pdf);
    const result = checkResumeFile("resume.pdf", big);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toMatch(/4 MB/);
  });

  it("accepts a file of exactly 4 MB", () => {
    const max = new Uint8Array(MAX_RESUME_BYTES);
    max.set(pdf);
    expect(checkResumeFile("resume.pdf", max).ok).toBe(true);
  });

  it("rejects a renamed image pretending to be a PDF", () => {
    const result = checkResumeFile("resume.pdf", png);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.message).toMatch(/don't match/);
  });

  it("rejects a PDF renamed to .docx", () => {
    expect(checkResumeFile("resume.docx", pdf).ok).toBe(false);
  });

  it("rejects a spreadsheet renamed to .docx", () => {
    expect(checkResumeFile("resume.docx", xlsx).ok).toBe(false);
  });

  it("explains how to convert legacy .doc files", () => {
    const result = checkResumeFile("resume.doc", legacyDoc);
    expect(!result.ok && result.message).toMatch(/\.docx/);
    // Even when renamed to .docx
    expect(checkResumeFile("resume.docx", legacyDoc).ok).toBe(false);
  });

  it("rejects Word files containing macros", () => {
    const result = checkResumeFile("resume.docx", docm);
    expect(!result.ok && result.message).toMatch(/macros/);
  });

  it("rejects password-protected PDFs", () => {
    const encrypted = join(pdf, ascii("trailer << /Encrypt 5 0 R >>"));
    const result = checkResumeFile("resume.pdf", encrypted);
    expect(!result.ok && result.message).toMatch(/password/);
  });

  it("rejects other file types", () => {
    expect(checkResumeFile("resume.txt", ascii("hello")).ok).toBe(false);
    expect(checkResumeFile("resume", pdf).ok).toBe(false);
  });
});

describe("cleanFilename", () => {
  it("drops folder paths", () => {
    expect(cleanFilename("C:\\Users\\me\\resume.pdf")).toBe("resume.pdf");
    expect(cleanFilename("../../etc/resume.pdf")).toBe("resume.pdf");
  });

  it("removes control characters", () => {
    expect(cleanFilename("res\u0000ume\n.pdf")).toBe("resume.pdf");
  });

  it("caps long names but keeps the extension", () => {
    const cleaned = cleanFilename(`${"a".repeat(300)}.pdf`);
    expect(cleaned).toHaveLength(255);
    expect(cleaned.endsWith(".pdf")).toBe(true);
  });

  it("falls back to a default name", () => {
    expect(cleanFilename("   ")).toBe("resume");
  });
});

describe("checkResumeFile with real files", () => {
  // Generated on macOS from tests/fixtures/jordan-rivera-resume.txt
  // (a fictional person) with `textutil` and `cupsfilter`.
  const fixture = (name: string) =>
    new Uint8Array(readFileSync(new URL(`../fixtures/${name}`, import.meta.url)));

  it("accepts a real PDF", () => {
    expect(checkResumeFile("resume.pdf", fixture("jordan-rivera-resume.pdf"))).toMatchObject({
      ok: true,
      kind: "pdf",
    });
  });

  it("accepts a real Word document", () => {
    expect(checkResumeFile("resume.docx", fixture("jordan-rivera-resume.docx"))).toMatchObject({
      ok: true,
      kind: "docx",
    });
  });

  it("rejects real files with the wrong extension", () => {
    expect(checkResumeFile("resume.docx", fixture("jordan-rivera-resume.pdf")).ok).toBe(false);
    expect(checkResumeFile("resume.pdf", fixture("jordan-rivera-resume.docx")).ok).toBe(false);
  });
});
