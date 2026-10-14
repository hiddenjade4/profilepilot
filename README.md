# ProfilePilot

An AI-assisted LinkedIn profile builder. Users upload their resume, answer a short career questionnaire, confirm the facts that were extracted, and get a polished, editable profile draft (headline options, About section, experience bullets, skills, education, and projects) to copy into LinkedIn.

**Core rule:** the AI improves how real experience is *presented*. It never invents jobs, titles, dates, degrees, certifications, or metrics. Facts from the user and AI suggestions are stored and displayed separately.

> Status: **Phase 1 of 8** — project setup and landing page. See the roadmap below.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components) + React 19 |
| Language | TypeScript |
| Styling / UI | Tailwind CSS v4, shadcn/ui (Base UI primitives), lucide icons |
| Database / Auth / Files | Supabase (Postgres + Row Level Security, Auth, private Storage) |
| AI | Anthropic API (Claude) via the official `@anthropic-ai/sdk` |
| Validation | Zod |
| Hosting | Vercel |

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Running locally

Requirements: Node.js 20.9+ (developed on Node 24) and npm.

```bash
npm install
cp .env.example .env.local   # fill in values once Phase 2 begins
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Regenerate route types, then run the TypeScript compiler |
| `npm run check` | Lint + typecheck — run before every commit |

## Roadmap

- [x] **Phase 1** — Project setup, landing page, architecture
- [ ] **Phase 2** — Authentication, questionnaire, resume upload
- [ ] **Phase 3** — Resume extraction and fact confirmation
- [ ] **Phase 4** — AI profile generation
- [ ] **Phase 5** — Editable preview, copy and export
- [ ] **Phase 6** — Saved profiles dashboard, privacy controls
- [ ] **Phase 7** — Tests, security review, deployment
- [ ] **Phase 8** — Officially supported LinkedIn integration (if any)

## Disclaimer

ProfilePilot is an independent project and is not affiliated with or endorsed by LinkedIn Corporation.
