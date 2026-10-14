// Which URLs need a signed-in user. Add new private sections here as they're
// built (onboarding, resume, photo, profiles, settings…).
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const AUTH_PAGES = ["/sign-in", "/sign-up"];

export const DEFAULT_SIGNED_IN_PATH = "/dashboard";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => matchesPrefix(pathname, p));
}

export function isAuthPage(pathname: string) {
  return AUTH_PAGES.includes(pathname);
}

// Only allow redirects to our own pages. Without this check, a link like
// /sign-in?next=https://evil.example could send users to another site after
// they sign in (an "open redirect").
export function safeNextPath(next: unknown): string {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return DEFAULT_SIGNED_IN_PATH;
  }
  return next;
}
