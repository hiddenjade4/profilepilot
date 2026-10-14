import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyResume } from "@/lib/resume/data";
import { createClient } from "@/lib/supabase/server";

// Opens the signed-in user's own resume. The bucket is private, so we ask
// Supabase for a link that works for 60 seconds and send the browser there.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", request.url));

  const resume = await getMyResume();
  if (!resume) return NextResponse.redirect(new URL("/resume", request.url));

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.storagePath, 60);

  if (error || !data) {
    console.error("Creating resume link failed", { name: error?.name });
    return NextResponse.redirect(new URL("/resume?error=open_failed", request.url));
  }

  const response = NextResponse.redirect(data.signedUrl);
  // Never let a browser or proxy cache this short-lived private link.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
