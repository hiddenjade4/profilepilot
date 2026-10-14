import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CheckCircle2Icon,
  FileTextIcon,
  ImageIcon,
  ListChecksIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard" };

// Steps that aren't built yet are shown as plain text with a "Coming soon"
// badge — not as buttons — so nothing looks clickable that doesn't work.
const upcoming: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ListChecksIcon,
    title: "Career questionnaire",
    body: "Tell us the roles you want and how you'd like to come across.",
  },
  {
    icon: FileTextIcon,
    title: "Upload your resume",
    body: "PDF or DOCX. You'll confirm every extracted fact.",
  },
  {
    icon: ImageIcon,
    title: "Add a headshot",
    body: "Optional. Preview and crop before saving.",
  },
  {
    icon: SparklesIcon,
    title: "Generate your profile",
    body: "Headlines, About drafts, and experience bullets to edit.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="h-16 w-72 animate-pulse rounded-lg bg-muted" />}>
        <Greeting />
      </Suspense>

      <section aria-labelledby="next-steps" className="space-y-4">
        <h2 id="next-steps" className="text-lg font-semibold">
          Your next steps
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2">
          {upcoming.map((step) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border bg-card p-5 shadow-xs"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <step.icon className="size-5" aria-hidden />
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{step.title}</h3>
                  <Badge variant="outline">Coming soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

async function Greeting() {
  const user = await requireUser();
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-sm text-primary">
        <CheckCircle2Icon className="size-4" aria-hidden />
        You&apos;re signed in
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome to ProfilePilot
      </h1>
      <p className="text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user.email}</span>
      </p>
    </div>
  );
}
