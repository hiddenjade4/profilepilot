import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  ClipboardCopyIcon,
  FileTextIcon,
  KeyRoundIcon,
  ListChecksIcon,
  LockIcon,
  MessageCircleQuestionIcon,
  PencilLineIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProfilePreviewDemo } from "@/components/marketing/profile-preview-demo";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ListChecksIcon,
    title: "Tell us where you're headed",
    body: "A short questionnaire about the roles you want, your strengths, and how you'd like to come across. Skip anything optional.",
  },
  {
    icon: FileTextIcon,
    title: "Upload your resume and confirm the facts",
    body: "We pull out your jobs, dates, education, and skills, then show them to you. You fix anything we got wrong before any writing starts.",
  },
  {
    icon: SparklesIcon,
    title: "Generate and edit",
    body: "Get several headline options, About drafts, and achievement-focused bullets. Regenerate any single section, adjust the tone, or rewrite it yourself.",
  },
  {
    icon: ClipboardCopyIcon,
    title: "Copy it into LinkedIn",
    body: "Copy one section or everything at once, or export a Markdown file. You stay in control of what goes on your profile.",
  },
];

const honesty: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheckIcon,
    title: "Facts and suggestions stay separate",
    body: "Anything taken from your resume is marked as yours. Skills or keywords the AI suggests are labeled and wait for your confirmation.",
  },
  {
    icon: MessageCircleQuestionIcon,
    title: "It asks instead of assuming",
    body: "If an accomplishment needs a number or a detail, ProfilePilot asks you for it. It won't make up metrics, titles, dates, or degrees.",
  },
  {
    icon: PencilLineIcon,
    title: "You have the final word",
    body: "Every generated section is editable. Nothing is used or shared until you copy it yourself.",
  },
];

const privacy: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: LockIcon,
    title: "Private by default",
    body: "Resumes and photos are kept in private storage that only your account can access.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Clear about AI",
    body: "Your confirmed career details are sent to Anthropic's Claude to write your drafts. We tell you before that happens.",
  },
  {
    icon: Trash2Icon,
    title: "Delete whenever you want",
    body: "Remove your resume, photo, saved profiles, or your whole account from your settings.",
  },
  {
    icon: KeyRoundIcon,
    title: "Never your LinkedIn password",
    body: "ProfilePilot never asks for it and never logs in to LinkedIn as you.",
  },
];

const faqs = [
  {
    q: "Does ProfilePilot post to my LinkedIn profile?",
    a: "No. LinkedIn does not let regular apps edit your profile for you, so ProfilePilot gives you polished text to copy and paste. That keeps you in control of what's published.",
  },
  {
    q: "Will the AI make things up to make me look better?",
    a: "It's built not to. Writing is based only on facts you've confirmed. Where a stronger bullet needs a detail, such as a number, you're asked for it instead of having one invented. Suggested skills are clearly labeled until you confirm them.",
  },
  {
    q: "Which AI does ProfilePilot use?",
    a: "Anthropic's Claude, through Anthropic's API. Only the information needed to write your profile is sent. Your files are not shared with other users.",
  },
  {
    q: "Can I edit what it writes?",
    a: "Yes, every section. You can also regenerate a single section, pick between alternatives, and adjust writing style, length, and tone.",
  },
  {
    q: "What happens to my resume and photo?",
    a: "They're stored privately, used only to build your profile, and can be deleted at any time from your settings. The full retention policy is shown in the app.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_65%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Badge variant="outline" className="h-6 px-2.5">
              <BadgeCheckIcon data-icon="inline-start" className="text-primary" />
              Your real experience, presented at its best
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              A LinkedIn profile you&apos;re proud of, without making anything
              up.
            </h1>
            <p className="max-w-xl text-lg text-pretty text-muted-foreground">
              Upload your resume, answer a few questions about where you&apos;re
              headed, and ProfilePilot drafts your headline, About section, and
              experience. Every word is based on what you actually did, and you
              can edit all of it.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "h-11 px-5 text-base" })}>
                Build my profile
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <Link
                href="/#how-it-works"
                className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5 text-base" })}
              >
                See how it works
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              You review everything before you use it. Nothing is posted for
              you.
            </p>
          </div>
          <ProfilePreviewDemo />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="How it works"
            title="From blank page to finished profile in four steps"
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honesty */}
      <section id="honesty" className="scroll-mt-24 border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Built on honesty"
            title="Better wording, never a different person"
            description="Most AI writing tools will happily pad a profile. ProfilePilot is designed to show your real background as clearly as possible, and to stop and ask when it doesn't know something."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {honesty.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="scroll-mt-24 border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="Privacy"
            title="Your career history is personal. We treat it that way."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {privacy.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <Accordion className="mt-10 rounded-2xl border bg-card px-5">
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="py-4 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">
              Stop staring at an empty About section.
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Start from your resume and finish with a profile that sounds
              like you on a good day.
            </p>
            <Link
              href="/sign-up"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "h-11 px-5 text-base",
              })}
            >
              Build my profile
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-3 text-center">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
