<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

## Vercel + Supabase PostgreSQL

### Environment Variables (set in Vercel Dashboard)
- `DATABASE_URL` — Supabase pooler URL (port 6543, `?pgbouncer=true`):
  `postgresql://postgres.lkaeytfhqtwfmjhgfnva:Carlpogi%401029@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL` — Supabase direct connection (port 5432, for CLI only):
  `postgresql://postgres.lkaeytfhqtwfmjhgfnva:Carlpogi%401029@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres`

### Build
- `postinstall` script auto-runs `prisma generate` after `npm install`
- `vercel.json` also runs `prisma generate` in build command (safe double-call)
- Next.js 16.2.7, Node.js runtime (not Edge)

### Seed
```bash
npx tsx prisma/seed.ts
```
Creates: instructor@arelms.com, student@arelms.com, 8 VR courses.

### Database
- Prisma v7.8.0 with `@prisma/adapter-pg` + `pg`
- `lib/prisma.ts` uses `DATABASE_URL` with `DIRECT_URL` fallback
- `prisma.config.ts` sets `datasource.url` to `DIRECT_URL` (for CLI migration commands)
- Default engine type "client" (Prisma v7) works with `@prisma/adapter-pg`

### Commands
- `npm run dev` — local dev with hot reload
- `npm run build` — production build
- `npx prisma db push` — sync schema (uses DIRECT_URL per prisma.config.ts)
- `npx tsx prisma/seed.ts` — seed users and courses
