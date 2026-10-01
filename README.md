# bestim-landing

The public website for Bestim: **https://bestim-eg.com** (Arabic first, English second). It explains the app, links to the stores, and hosts the pages the stores require: privacy, terms, support, and "delete my account".

Before changing anything, read `../CLAUDE.md`, `../docs/BRAND.md` and `../assets/brand/`.

## Run it
```bash
npm install
npm run dev      # http://localhost:3000 (opens the Arabic page)
npm run check    # Arabic and English text files must have the same entries
npm run lint
npm run build    # every page is built ahead of time, in both languages
```

## Where things are
| What | Where |
|---|---|
| All the home page text | `src/dictionaries/ar.json` and `en.json` (keep both in step: `npm run check`) |
| Privacy, terms, support, delete-account text | `src/content/legal.ts` (**draft: needs founder/legal review**) |
| Site address, store links, Connect link, support email | `src/lib/site.ts` |
| Home page sections, top to bottom | `src/app/[lang]/page.tsx` → `src/components/sections/` |
| Brand colors, corner sizes, fonts | `src/app/globals.css` (copied from `../assets/brand/tokens.json`) |
| Phone screenshots (real captures from the iPhone 16 simulator) | `src/screens/ar/` and `src/screens/en/` |
| Logos | `public/brand/` |
| Phone frame (real iPhone 16 Pro, Natural Titanium: Apple's product bezel via github.com/jonnyjackson26/device-frames-media) | `public/device/iphone-16-pro.png`, used by `src/components/Phone.tsx` |

## Common changes
- **The app is live in a store:** put its link in `appStoreUrl` / `playStoreUrl` in `src/lib/site.ts`. The "Coming soon" label goes away and the button becomes a link.
- **Replace a phone screenshot:** drop a PNG with the same name into `src/screens/ar/` and `src/screens/en/` (a full iPhone screenshot). Demo data for the captures: `bestim-app/supabase/seeds/demo_landing.sql`.
- **Change wording:** edit both dictionary files, then `npm run check`.

## How it is built
Next.js 16 (App Router) + TypeScript + Tailwind v4, hosted on Vercel. Pages are static (pre-built for `/ar` and `/en`; `/` redirects to `/ar`). Layout uses start/end classes so Arabic (right-to-left) mirrors automatically. The only animation library is `motion`, used in small client components (`src/components/Motion.tsx`, `sections/HowItWorks.tsx`); everything else renders on the server. No component library, no database, no analytics yet.

Next.js changes between major versions: read `AGENTS.md` before writing code.

## Still to do
- The official Bestim Connect logo file (the Connect section draws it with CSS for now).
- Social share image, structured data, Lighthouse pass.
- Vercel project + `bestim-eg.com` DNS.
