import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

// The one place server code asks "who is signed in?". getClaims() verifies
// the login token's signature, so the result can be trusted.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Checking a login compares the token's expiry with the current time, so
  // it must run fresh for every request — never be prerendered or cached.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  return {
    id: data.claims.sub,
    email: typeof data.claims.email === "string" ? data.claims.email : "",
  };
}

// Use at the top of every private page and server action.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
