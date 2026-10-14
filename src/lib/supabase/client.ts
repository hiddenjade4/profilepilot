import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

// Supabase client for Client Components (code that runs in the browser).
// It only ever holds the publishable key; Row Level Security protects data.
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
