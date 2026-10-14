"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { AuthError } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  type AuthFormState,
} from "@/lib/validation/auth";

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const typedEmail = String(formData.get("email") ?? "");
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      email: typedEmail,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      // Where the "confirm your email" link sends the user back to.
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { status: "error", message: friendlyAuthError(error), email: typedEmail };
  }

  // Supabase deliberately returns success even if the email is already
  // registered, so nobody can use this form to check who has an account.
  return {
    status: "success",
    message: `We sent a confirmation link to ${parsed.data.email}. Open it on this device to finish creating your account.`,
  };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const typedEmail = String(formData.get("email") ?? "");
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      email: typedEmail,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: friendlyAuthError(error), email: typedEmail };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in?signed_out=1");
}

// Turn Supabase's technical errors into plain language. Unknown errors get a
// generic message so internal details never reach the user.
function friendlyAuthError(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Check them and try again.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link we sent.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too easy to guess. Try a longer one with a mix of words and numbers.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "signup_disabled":
      return "New sign-ups are currently turned off.";
    default:
      console.error("Auth error", { code: error.code, status: error.status });
      return "Something went wrong on our side. Please try again in a moment.";
  }
}
