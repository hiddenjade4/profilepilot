import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftIcon, LockIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { ResumeManager } from "@/components/resume/resume-manager";
import { RESUME_TYPES } from "@/lib/resume/constants";
import { getMyResume } from "@/lib/resume/data";

export const metadata: Metadata = { title: "Your resume" };

export default function ResumePage({ searchParams }: PageProps<"/resume">) {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Your resume</h1>
        <p className="text-muted-foreground">
          Upload your current resume. In the next step, ProfilePilot will read
          it and show you everything it found so you can correct it before
          anything is written.
        </p>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}>
        <LoadedResume searchParams={searchParams} />
      </Suspense>

      <section
        aria-labelledby="privacy-heading"
        className="space-y-3 rounded-2xl border bg-muted/40 p-5 text-sm"
      >
        <h2 id="privacy-heading" className="font-medium">
          How your resume is handled
        </h2>
        <ul className="space-y-2.5 text-muted-foreground">
          <li className="flex gap-2">
            <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Stored in private storage that only your account can access. It
            never has a public link.
          </li>
          <li className="flex gap-2">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Nothing is sent to an AI service yet. Before your resume is read by
            AI in the next step, we&apos;ll explain what&apos;s shared and ask
            you first.
          </li>
          <li className="flex gap-2">
            <Trash2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            Kept until you delete or replace it. Replacing removes the old file
            immediately, and deleting is permanent.
          </li>
        </ul>
      </section>
    </div>
  );
}

async function LoadedResume({
  searchParams,
}: {
  searchParams: PageProps<"/resume">["searchParams"];
}) {
  const [resume, params] = await Promise.all([getMyResume(), searchParams]);

  return (
    <div className="space-y-4">
      {params.error === "open_failed" && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          We couldn&apos;t open your file just now. Please try again.
        </p>
      )}
      <ResumeManager
        resume={
          resume && {
            filename: resume.filename,
            sizeBytes: resume.sizeBytes,
            typeLabel:
              resume.mimeType === RESUME_TYPES.pdf.mimeType
                ? RESUME_TYPES.pdf.label
                : RESUME_TYPES.docx.label,
            uploadedLabel: new Date(resume.uploadedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }
        }
      />
    </div>
  );
}
