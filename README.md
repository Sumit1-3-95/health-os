# Health OS

Personal daily health tracker — Next.js + Supabase + Vercel.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
The `.env.local` file is already configured with your Supabase credentials.
**Do not commit this file to GitHub** (it's in .gitignore).

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 4. Deploy to Vercel

#### One-time setup:
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

#### Every update:
```bash
git add .
git commit -m "your message"
git push
```
Vercel auto-deploys on every push.

## Project structure

```
health-os/
├── app/
│   ├── api/
│   │   ├── daily-log/route.ts    # GET/POST daily log
│   │   └── task-events/route.ts  # POST task events
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main app
├── components/
│   ├── Header.tsx
│   ├── BottomNav.tsx
│   ├── ScoreCard.tsx
│   ├── GroupCard.tsx
│   ├── MedCard.tsx
│   ├── PastPills.tsx
│   └── StatsPage.tsx
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── tasks.ts                  # All task definitions + helpers
└── public/
    └── manifest.json             # PWA manifest
```

## Supabase tables

- `daily_log` — one row per day (score, weight, completed tasks)
- `task_events` — one row per checkbox tap (full event log)

## Adding / changing tasks

Edit `lib/tasks.ts` — the `TASKS` array.
Each task has: id, label, icon, time, category, points, days, group info.
