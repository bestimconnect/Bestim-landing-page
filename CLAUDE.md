@AGENTS.md

Read `../CLAUDE.md` first (shared briefing), then `README.md` here (where things are, how to run). Brand: `../docs/BRAND.md`, `../assets/`.

## Conventions
- Every string lives in `src/dictionaries/{ar,en}.json` (Arabic written first). `npm run check` must pass.
- RTL-first: use logical classes (`ms-`, `pe-`, `start-`, `end-`, `text-start`), never `left`/`right`/`ml`/`pr`.
- No letter-spacing (`tracking-*`) on text: it breaks Arabic joining.
- No see-through text colours (`text-muted/55`): joined Arabic letters overlap and show dark blotches. Use a solid colour plus `opacity-55` on the element.
- Server Components by default. `"use client"` only for motion (`components/Motion.tsx`, `sections/HowItWorks.tsx`) and `LangSwitch`.
- Above-the-fold content animates with CSS (`animate-rise`), not `Reveal`, so it shows before JavaScript loads.
- Links, domain, store URLs: `src/lib/site.ts` only.
- `/dashboard` is the private admin dashboard (own root layout, code in `src/dashboard/`, strings in `src/dictionaries/dashboard.{ar,en}.json`, gate in `src/proxy.ts`). It may use client JS where needed and its own `d-*` colour tokens (light only). Everything it reads goes through admin-only database functions; never put a service key in this project, with one founder-approved exception (2026-11-13): `src/dashboard/user-actions.ts` reads `SUPABASE_SERVICE_ROLE_KEY` from the server environment (Vercel / `.env.local`, never in git) to create, suspend and delete login accounts, only after `requireAdmin()` and a role check, and logs each use with `admin_log()`.
- Plan cards (`#plans`) are allowed since 2026-11-03 (founder, Q121) and read the `plans` table, so the dashboard controls them. A paid plan with no price says "Coming soon". No other price mentions. No invented testimonials.
- Run `npm run check && npm run lint && npm run build` before calling a task done.
