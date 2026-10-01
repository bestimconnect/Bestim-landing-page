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
- No price or plan mentions anywhere (founder decision, 2026-10-02). No invented testimonials.
- Run `npm run check && npm run lint && npm run build` before calling a task done.
