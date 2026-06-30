# PocketSense

PocketSense is a student money management app for Bangladesh, built with Next.js and Supabase.

## Features

- Track daily expenses and monthly income in one place
- See a daily spending limit and month-to-date budget progress
- Set savings goals, emergency reserve amounts, and budget preferences
- Add and manage group expenses with squad-based bill splitting
- View reports, charts, category breakdowns, and spending insights
- Stay motivated with challenges, streaks, badges, and XP
- Get SOS warnings and survival-mode guidance when balance is low
- Use the app in both Bangla and English
- Install the app as a PWA for a more app-like experience

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Zustand
- SWR

## Requirements

- Node.js 18+
- npm
- Supabase project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example`

3. Add your environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run analyze
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
```

## Project Structure

```text
app/          routes and API handlers
components/   reusable UI and feature components
contexts/     app contexts
data/         static data
lib/          utilities, hooks, auth, Supabase logic
public/       static assets and PWA files
store/        Zustand stores
types/        shared TypeScript types
```

## Supabase

Main integration files:

- [lib/supabase/client.ts](/abs/path/D:/pocketsense-bd/lib/supabase/client.ts)
- [lib/supabase/server.ts](/abs/path/D:/pocketsense-bd/lib/supabase/server.ts)
- [types/database.types.ts](/abs/path/D:/pocketsense-bd/types/database.types.ts)
- [middleware.ts](/abs/path/D:/pocketsense-bd/middleware.ts)


## Testing

- Jest and React Testing Library
- Playwright

