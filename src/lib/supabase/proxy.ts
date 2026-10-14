import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import { isAuthPage, isProtectedPath } from "@/lib/auth/routes";

// Runs before every page request (see src/proxy.ts). It:
// 1. Refreshes the user's login session if it is about to expire.
// 2. Sends signed-out visitors away from private pages, and signed-in users
//    away from the sign-in/sign-up pages.
// This is a convenience redirect only. Every private page and server action
// still checks the user itself (see src/lib/auth/session.ts).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Cache-Control headers stop CDNs from caching one user's session.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not add code between createServerClient and getClaims(): getClaims()
  // is what triggers the refresh. It also verifies the token's signature,
  // unlike getSession(), which must not be trusted on the server.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  if (!signedIn && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return redirectWithCookies(url, response);
  }

  if (signedIn && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

// A redirect is a new response, so carry over any refreshed session cookies
// and cache headers; otherwise the user would be signed out by accident.
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) redirect.headers.set(header, value);
  }
  return redirect;
}
