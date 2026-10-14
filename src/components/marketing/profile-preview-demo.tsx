import { CircleHelpIcon, FileCheckIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// A static illustration for the landing page. All data is fictional and the
// card is labelled as an example so it is never mistaken for a real profile.
export function ProfilePreviewDemo() {
  return (
    <figure className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-linear-to-br from-primary/15 via-primary/5 to-transparent blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5">
        <div className="h-16 bg-linear-to-r from-primary/80 to-primary/40" />
        <div className="space-y-5 px-5 pb-5">
          <div className="-mt-8 flex items-end gap-3">
            <div className="flex size-16 items-center justify-center rounded-full border-4 border-card bg-muted text-lg font-semibold text-muted-foreground">
              JR
            </div>
            <Badge variant="outline" className="mb-1">
              Example · fictional user
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="font-semibold">Jordan Rivera</p>
            <p className="text-sm leading-snug">
              IT Support Specialist | Windows & Microsoft 365 | Turning tech
              problems into calm, clear fixes
            </p>
            <p className="text-xs text-muted-foreground">
              Headline option 1 of 3
            </p>
          </div>

          <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Help Desk Technician</p>
              <Badge variant="secondary">
                <FileCheckIcon data-icon="inline-start" />
                From your resume
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Northside Community College · 2023 – Present
            </p>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              <li>
                Resolve hardware, account, and network issues for students and
                faculty across three campus buildings.
              </li>
              <li>
                Wrote step-by-step guides for password resets and Wi-Fi setup
                used at the front desk.
              </li>
            </ul>
          </div>

          <div className="flex gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
            <CircleHelpIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <div className="space-y-1 text-sm">
              <p className="font-medium">We need a detail from you</p>
              <p className="text-muted-foreground">
                About how many support tickets did you handle per week? We
                won&apos;t guess a number.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">Active Directory</Badge>
            <Badge variant="secondary">Microsoft 365</Badge>
            <Badge variant="outline">
              <SparklesIcon data-icon="inline-start" />
              Suggested: ITIL — confirm?
            </Badge>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        An example of a generated profile for a fictional person. It shows
        which content came from the resume and a question asking the user for a
        missing detail.
      </figcaption>
    </figure>
  );
}
