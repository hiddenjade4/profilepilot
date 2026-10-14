"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  AlertCircleIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteResume,
  uploadResume,
  type ResumeActionState,
} from "@/app/(app)/resume/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MAX_RESUME_BYTES, RESUME_ACCEPT, formatBytes } from "@/lib/resume/constants";
import { cn } from "@/lib/utils";

export type ResumeSummary = {
  filename: string;
  sizeBytes: number;
  typeLabel: string;
  uploadedLabel: string;
};

const initialState: ResumeActionState = { status: "idle" };

export function ResumeManager({ resume }: { resume: ResumeSummary | null }) {
  const [state, formAction, uploading] = useActionState(uploadResume, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Announce each upload result once.
  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
  }, [state]);

  // Quick checks in the browser for instant feedback. The server repeats
  // them (and more) because browser checks can be bypassed.
  function submitFile(file: File | undefined) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setClientError(
        ext === "doc"
          ? "That's the older Word .doc format. Save it as .docx or PDF first."
          : "Please choose a PDF or a Word document (.docx).",
      );
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setClientError("That file is larger than 4 MB. Try saving it without images, or as a PDF.");
      return;
    }
    setClientError(null);
    formRef.current?.requestSubmit();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (!files.length || !inputRef.current) return;
    inputRef.current.files = files;
    submitFile(files[0]);
  }

  function onDelete() {
    startDelete(async () => {
      const result = await deleteResume();
      setConfirmingDelete(false);
      if (result.status === "error") toast.error(result.message);
      else toast.success(result.message);
    });
  }

  const error = clientError ?? (state.status === "error" ? state.message : null);

  return (
    <div className="space-y-4">
      {/* One form handles both first upload and replacement. */}
      <form ref={formRef} action={formAction} className="contents">
        <input
          ref={inputRef}
          id="resume-file"
          type="file"
          name="file"
          accept={RESUME_ACCEPT}
          className="sr-only"
          onChange={(e) => submitFile(e.target.files?.[0])}
          disabled={uploading || deleting}
          aria-describedby="resume-rules"
        />

        {resume ? (
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileTextIcon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium" title={resume.filename}>
                    {resume.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {resume.typeLabel} · {formatBytes(resume.sizeBytes)} · Uploaded{" "}
                    {resume.uploadedLabel}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="self-start sm:self-center">
                Stored privately
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
              <a
                href="/resume/file"
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                View
              </a>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={uploading || deleting}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2Icon className="animate-spin" aria-hidden />
                ) : (
                  <RefreshCwIcon data-icon="inline-start" />
                )}
                {uploading ? "Uploading…" : "Replace"}
              </Button>

              {!confirmingDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={uploading || deleting}
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2Icon data-icon="inline-start" />
                  Delete
                </Button>
              ) : (
                <div
                  role="group"
                  aria-label="Confirm deletion"
                  className="flex w-full flex-wrap items-center gap-2 rounded-lg bg-destructive/5 p-3 sm:w-auto sm:p-1.5 sm:pl-3"
                >
                  <span className="text-sm">Delete permanently?</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="lg"
                    disabled={deleting}
                    onClick={onDelete}
                    autoFocus
                  >
                    {deleting && <Loader2Icon className="animate-spin" aria-hidden />}
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    disabled={deleting}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <label
            htmlFor="resume-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-card px-6 py-14 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
              "has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
              dragging && "border-primary bg-primary/5",
              uploading && "pointer-events-none opacity-70",
            )}
          >
            {uploading ? (
              <Loader2Icon className="size-8 animate-spin text-primary" aria-hidden />
            ) : (
              <UploadCloudIcon className="size-8 text-primary" aria-hidden />
            )}
            <span className="font-medium">
              {uploading
                ? "Uploading and checking your file…"
                : dragging
                  ? "Drop to upload"
                  : "Drag your resume here, or click to choose a file"}
            </span>
            <span id="resume-rules" className="text-sm text-muted-foreground">
              PDF or Word (.docx) · up to 4 MB
            </span>
          </label>
        )}
      </form>

      {error && (
        <div
          role="alert"
          className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
