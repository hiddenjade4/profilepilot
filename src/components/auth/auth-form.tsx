"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  MailCheckIcon,
} from "lucide-react";
import { signIn, signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialAuthFormState } from "@/lib/validation/auth";

type Mode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to continue building your profile.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New to ProfilePilot?",
    switchLink: "Create an account",
    switchHref: "/sign-up",
    passwordHint: undefined,
    autoComplete: "current-password",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Free to start. You'll confirm your email before signing in.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/sign-in",
    passwordHint: "At least 8 characters.",
    autoComplete: "new-password",
  },
} as const;

// Messages that arrive via the URL, e.g. after signing out.
const notices: Record<string, { tone: "info" | "error"; text: string }> = {
  signed_out: { tone: "info", text: "You've been signed out." },
  confirmation_failed: {
    tone: "error",
    text: "That confirmation link didn't work. It may have expired or been opened in a different browser. Try signing in, or sign up again to get a new link.",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const t = copy[mode];
  const [state, formAction, pending] = useActionState(
    mode === "sign-in" ? signIn : signUp,
    initialAuthFormState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const notice = searchParams.has("signed_out")
    ? notices.signed_out
    : notices[searchParams.get("error") ?? ""];

  if (state.status === "success") {
    return (
      <div className="space-y-4 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheckIcon className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground">{state.message}</p>
        <p className="text-sm text-muted-foreground">
          Don&apos;t see it after a few minutes? Check your spam folder.
        </p>
      </div>
    );
  }

  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {notice && !state.message && (
        <Alert tone={notice.tone}>{notice.text}</Alert>
      )}
      {state.status === "error" && state.message && (
        <Alert tone="error">{state.message}</Alert>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        {mode === "sign-in" && <input type="hidden" name="next" value={next} />}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className="h-10"
          />
          {emailError && (
            <p id="email-error" className="text-sm text-destructive">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={t.autoComplete}
              required
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError
                  ? "password-error"
                  : t.passwordHint
                    ? "password-hint"
                    : undefined
              }
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {passwordError ? (
            <p id="password-error" className="text-sm text-destructive">
              {passwordError}
            </p>
          ) : (
            t.passwordHint && (
              <p id="password-hint" className="text-sm text-muted-foreground">
                {t.passwordHint}
              </p>
            )
          )}
        </div>

        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" aria-hidden />}
          {pending ? t.pending : t.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.switchText}{" "}
        <Link
          href={t.switchHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t.switchLink}
        </Link>
      </p>
    </div>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "info" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          : "rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground"
      }
    >
      {tone === "error" && (
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <p>{children}</p>
    </div>
  );
}
