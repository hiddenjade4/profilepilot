import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUpPage() {
  return (
    // The form reads the URL (e.g. ?next=…), which happens per request, so
    // it streams in behind a Suspense boundary.
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
