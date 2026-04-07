# Oak Me Up Clone

`oakmeup.lt` one-page clone built with Next.js App Router, TypeScript, Tailwind CSS and Framer Motion.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Framer Motion
- React Hook Form + Zod
- ESLint + Prettier

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production checks

```bash
npm run lint
npm run build
```

## Project structure

- `src/app` - app entry points and global styles
- `src/components/layout` - `Header`, `Footer`
- `src/components/sections` - page sections (hero, features, process, testimonials, pricing, faq, contact)
- `src/components/ui` - reusable UI primitives
- `src/lib/validations` - form validation schemas

## Current TODO

- Match all section micro-spacing and exact typography values 1:1 with Framer tokens.
- Rebuild advanced scroll/marquee animations to perfectly mirror original timing.
- Add full visual regression checks against `oakmeup.lt` breakpoints (`1440`, `1024`, `768`, `390`).
