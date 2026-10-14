"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CloudCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { saveQuestionnaire } from "@/app/(app)/onboarding/actions";
import { MultiChoice, SingleChoice, TagInput } from "@/components/questionnaire/inputs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  isAnswered,
  visibleQuestions,
  type Question,
} from "@/lib/questionnaire/questions";
import type { Answers } from "@/lib/questionnaire/schema";

type SaveState = "idle" | "saving" | "saved" | "error";

export function QuestionnaireWizard({
  initialAnswers,
  initialStep,
}: {
  initialAnswers: Answers;
  initialStep: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [index, setIndex] = useState(() => {
    const i = visibleQuestions(initialAnswers).findIndex((q) => q.id === initialStep);
    return Math.max(i, 0);
  });
  const [showRequired, setShowRequired] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  const visible = visibleQuestions(answers);
  const safeIndex = Math.min(index, visible.length - 1);
  const question = visible[safeIndex];
  const isLast = safeIndex === visible.length - 1;
  const answered = isAnswered(answers, question.id);
  const progress = Math.round((safeIndex / visible.length) * 100);

  // On each new question, put focus where it's most useful: the text box for
  // typing questions, otherwise the heading (so screen readers announce it).
  const kind = question.kind;
  useEffect(() => {
    const typing = kind === "text" || kind === "textarea" || kind === "tags";
    if (firstRender.current) {
      firstRender.current = false;
      if (!typing) return;
    }
    const field = formRef.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]):not(.sr-only), textarea",
    );
    if (typing && field) field.focus();
    else headingRef.current?.focus();
  }, [safeIndex, kind]);

  function setAnswer(value: Answers[keyof Answers]) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setShowRequired(false);
  }

  function goNext() {
    if (!question.optional && !answered) {
      setShowRequired(true);
      return;
    }

    const nextStep = isLast ? question.id : visible[safeIndex + 1].id;
    setSaveState("saving");
    startTransition(async () => {
      const result = await saveQuestionnaire({
        answers,
        currentStep: nextStep,
        complete: isLast,
      });
      if (!result.ok) {
        setSaveState("error");
        toast.error(result.message);
        return;
      }
      setSaveState("saved");
      if (isLast) {
        toast.success("Questionnaire complete. Nice work!");
        router.push("/dashboard");
      } else {
        setIndex(safeIndex + 1);
      }
    });
  }

  function goBack() {
    setShowRequired(false);
    setIndex(Math.max(safeIndex - 1, 0));
  }

  const headingId = `q-${question.id}`;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {safeIndex + 1} of {visible.length}
          </span>
          <SaveIndicator state={saveState} />
        </div>
        <div
          role="progressbar"
          aria-label="Questionnaire progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
        className="space-y-8 rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1
              id={headingId}
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-semibold tracking-tight outline-none sm:text-2xl"
            >
              {question.title}
            </h1>
          </div>
          {question.description && (
            <p className="text-muted-foreground">{question.description}</p>
          )}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {question.optional ? "Optional" : "Required"}
          </p>
        </div>

        <QuestionInput
          key={question.id}
          question={question}
          answers={answers}
          onChange={setAnswer}
          labelledBy={headingId}
          invalid={showRequired}
        />

        {showRequired && (
          <p role="alert" className="text-sm text-destructive">
            Please answer this question to continue.
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={goBack}
            disabled={safeIndex === 0 || pending}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back
          </Button>
          <Button type="submit" size="lg" className="h-10 px-4" disabled={pending}>
            {pending && <Loader2Icon className="animate-spin" aria-hidden />}
            {isLast
              ? "Finish"
              : question.optional && !answered
                ? "Skip"
                : "Next"}
            {!pending &&
              (isLast ? (
                <CheckIcon data-icon="inline-end" />
              ) : (
                <ArrowRightIcon data-icon="inline-end" />
              ))}
          </Button>
        </div>
      </form>
    </div>
  );
}

function QuestionInput({
  question,
  answers,
  onChange,
  labelledBy,
  invalid,
}: {
  question: Question;
  answers: Answers;
  onChange: (value: Answers[keyof Answers]) => void;
  labelledBy: string;
  invalid: boolean;
}) {
  const value = answers[question.id];

  switch (question.kind) {
    case "text":
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          aria-labelledby={labelledBy}
          aria-invalid={invalid}
          className="h-11 text-base"
        />
      );
    case "textarea": {
      const text = typeof value === "string" ? value : "";
      return (
        <div className="space-y-1.5">
          <Textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            aria-labelledby={labelledBy}
            aria-invalid={invalid}
            className="min-h-32 text-base"
          />
          <p className="text-right text-xs text-muted-foreground">
            {text.length} / {question.maxLength}
          </p>
        </div>
      );
    }
    case "single":
      return (
        <SingleChoice
          name={question.id}
          options={question.options}
          value={typeof value === "string" ? value : undefined}
          onChange={onChange}
          labelledBy={labelledBy}
        />
      );
    case "multi":
      return (
        <MultiChoice
          options={question.options}
          value={Array.isArray(value) ? value : []}
          onChange={(v) => onChange(v as Answers[keyof Answers])}
          labelledBy={labelledBy}
        />
      );
    case "tags":
      return (
        <TagInput
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={question.placeholder}
          maxItems={question.maxItems}
          maxItemLength={question.maxItemLength}
          labelledBy={labelledBy}
          invalid={invalid}
        />
      );
  }
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5" aria-live="polite">
        <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1.5" aria-live="polite">
        <CloudCheckIcon className="size-3.5" aria-hidden />
        Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-destructive" aria-live="polite">
        Not saved
      </span>
    );
  }
  return <span aria-live="polite" />;
}
