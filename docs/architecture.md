# Architecture

## The short version (interview answer)

ProfilePilot is a Next.js app. The **browser** only renders UI and holds no secrets. All trusted work — checking who the user is, validating input, extracting resume text, calling Claude, and enforcing rate limits — happens on the **Next.js server** (server actions and route handlers). **Supabase** provides Postgres, authentication, and private file storage. Postgres **Row Level Security** policies guarantee a user can only read and write their own rows, even if application code has a bug. **Claude** is called only from the server, and its output is validated against Zod schemas before anything is saved.

```
Browser ──► Next.js server (Vercel) ──► Supabase (Postgres + Auth + Storage)
                               └──────► Anthropic API (Claude)
```

## Request flow: generating a profile (planned, Phase 4)

1. User clicks **Generate** → a server action runs on the server.
2. The server reads the session cookie and asks Supabase who the user is. No user → rejected.
3. The server checks the user's AI rate limit (a counter table in Postgres).
4. It loads the user's **confirmed** resume facts and questionnaire answers (RLS limits this to their rows).
5. It sends only those facts to Claude with instructions not to invent anything, and asks for structured JSON output.
6. The response is validated with Zod. Invalid output → safe error, nothing saved.
7. Sections are saved to `profile_sections`, each tagged with its source (user fact vs. AI suggestion).

## Key decisions

| Decision | Why |
|---|---|
| Hosted Supabase project for development (no local Docker stack) | Fewer moving parts for a solo developer; same platform as production. |
| Extraction → user confirmation → generation (two AI steps) | The user verifies facts before any writing happens, which is how we prevent invented experience. |
| Structured outputs + Zod validation | The UI can rely on a known shape (e.g. exactly 3+ headlines) and bad responses are caught instead of displayed. |
| Rate limits stored in Postgres | Avoids adding a separate service (e.g. Redis) and its account/cost. |
| Copy/export as the primary LinkedIn workflow | LinkedIn does not offer general apps an API to edit a member's profile. Any official integration is added in Phase 8 as a separate module (`src/lib/linkedin`). |
| Cache Components enabled (Next.js default) | Pages are static by default and per-user data is explicitly dynamic, which is the model Next.js is moving to. |
| Model name in an env var (`ANTHROPIC_MODEL`) | Lets us switch models for cost or quality without code changes. |

## Folder layout

```
src/app/(marketing)/   Public pages: landing, and placeholder sign-in/sign-up (until Phase 2)
src/app/(auth)/        Sign-in / sign-up (Phase 2)
src/app/(app)/         Signed-in pages: onboarding, resume, photo, generate, profiles, dashboard, settings
src/app/api/           Route handlers: uploads, export, auth callback
src/components/ui/     shadcn/ui primitives
src/components/        Feature components (marketing/, brand/, …)
src/lib/supabase/      Browser and server Supabase clients
src/lib/ai/            Claude client, prompts, output schemas
src/lib/resume/        PDF/DOCX text extraction
src/lib/validation/    Zod schemas shared by forms and server code
src/lib/linkedin/      Isolated LinkedIn integration (Phase 8)
supabase/migrations/   SQL schema + RLS policies, version-controlled
tests/                 Unit, integration, and end-to-end tests
```

Route groups in parentheses, like `(marketing)`, organize files without changing URLs.
