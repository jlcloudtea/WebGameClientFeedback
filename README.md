# ICT Support Pro — Customer Service Role-Play Simulation

An interactive educational game for vocational IT students (AQF Level 2–3) to learn how to identify and document client requirements through realistic customer service simulations.

## Overview

ICT Support Pro immerses students in role-play scenarios where they practice essential IT consulting skills — from designing surveys and conducting interviews, to handling difficult clients and creating improvement plans. The game uses AI-powered dialogue, drag-and-drop interactions, and a gamified XP/levelling system to make learning engaging and practical.

## Mission Types

| Mission | Difficulty | Time | XP | Description |
|---------|-----------|------|----|-------------|
| 📋 Survey Builder | Beginner | 15 min | 80 | Design professional surveys to gather client requirements with guided question types and placeholder examples |
| 🗣️ Customer Interview | Intermediate | 20 min | 120 | Conduct one-on-one AI-driven interviews, practice active listening, and uncover hidden client needs |
| 📊 Feedback Analysis | Intermediate | 18 min | 100 | Categorise client feedback using drag-and-drop, identify patterns, and write actionable insights |
| 🔥 Difficult Client | Advanced | 25 min | 150 | Handle challenging client interactions with branching dialogue, emotion tracking, and de-escalation strategies |
| 🚀 Service Improvement | Advanced | 22 min | 130 | Review service performance data, generate recommendations, and create prioritised action plans |

## Features

- **AI-Powered Dialogue** — Customer interviews and difficult client scenarios use an LLM backend to generate dynamic, realistic conversations
- **Gamified Progression** — Earn XP, level up through 10 ranks (Trainee → Legend), and collect badges for achievements
- **Drag-and-Drop Feedback Categorisation** — Sort feedback cards into correct categories using intuitive DnD interactions
- **Branching Dialogue System** — Navigate complex client conversations with multiple choice responses that affect outcomes
- **Emotion & Satisfaction Tracking** — Real-time client satisfaction meters and de-escalation progress indicators
- **Survey Design Tools** — Build surveys with 5 question types (star rating, multiple choice, Likert scale, open-ended, yes/no) with placeholder examples
- **Priority Matrix** — Visual tool for ranking improvement recommendations by impact vs. effort
- **Achievements & Badges** — 10 unlockable badges rewarding milestones from "First Steps" to "Completionist"

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Database**: Prisma ORM with PostgreSQL (Vercel Postgres / Neon)
- **State Management**: Zustand (client-side game state with localStorage persistence)
- **AI**: z-ai-web-dev-sdk (LLM for dialogue generation)
- **Drag & Drop**: @dnd-kit/core
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- PostgreSQL database (local, Docker, or cloud)

### Local Development

```bash
# Clone the repository
git clone https://github.com/<your-org>/ict-support-pro.git
cd ict-support-pro

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Create the database and run migrations
bun run db:migrate

# Seed the database with mission templates and badges
bun run db:seed

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Using Docker for PostgreSQL

If you don't have PostgreSQL installed locally, you can use Docker:

```bash
docker run -d \
  --name ict-support-pro-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ict_support_pro \
  -p 5432:5432 \
  postgres:16-alpine
```

Then set your `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ict_support_pro
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

## Deploy to Vercel (Free Plan)

Yes, this project is fully compatible with Vercel's free plan! Here's how to deploy it:

### Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository.

### Step 2: Create a Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign up / log in
2. Go to the **Storage** tab in your Vercel dashboard
3. Click **Create Database** → select **Postgres (Neon)**
4. Choose the **Free** plan (0.5 GB storage, 100 compute hours/month)
5. Give it a name (e.g., `ict-support-pro-db`) and click **Create**
6. Copy the connection string — you'll need it in Step 4

> **Free plan limits**: 0.5 GB storage, 100 compute hours/month — more than enough for this project.

### Step 3: Import Your Project

1. In Vercel dashboard, click **Add New** → **Project**
2. Import your GitHub repository
3. Keep the default Framework Preset (**Next.js**)

### Step 4: Configure Environment Variables

In the project setup screen, add the following environment variable:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Vercel Postgres connection string from Step 2 |

If you connected the Vercel Postgres database to your project, the `DATABASE_URL` may already be set automatically.

### Step 5: Configure Build Settings

Update the **Build Command** to include database migrations:

```
npx prisma migrate deploy && next build
```

Or if using Bun:

```
bunx prisma migrate deploy && next build
```

This ensures your database schema is applied before each deployment.

### Step 6: Deploy

Click **Deploy** and wait for the build to complete. Vercel will:
1. Install dependencies
2. Run Prisma migrations
3. Build the Next.js app
4. Deploy to a `.vercel.app` URL

### Step 7: Seed the Database

After the first deployment, seed the database with initial data:

```bash
# Option A: Using Vercel CLI
npx vercel env pull .env.local   # Pull production env vars
bunx prisma db seed              # Seed using the local env

# Option B: Using the Vercel dashboard
# Go to your project → Settings → Environment Variables
# Copy the DATABASE_URL, then run locally:
DATABASE_URL="your-production-url" bunx prisma db seed
```

### Step 8: Visit Your App

Your app is now live at `https://your-project.vercel.app`! 🎉

### Updating Your Deployment

Every time you push to the `main` branch, Vercel will automatically:
1. Run `prisma migrate deploy` (applies any new migrations)
2. Build and deploy the updated app

For schema changes, create a migration first:
```bash
bun run db:migrate    # Creates and applies the migration locally
git add prisma/migrations
git commit -m "Add new migration"
git push              # Triggers Vercel deployment
```

### Alternative: Deploy Without a Database

Since the core game logic runs entirely client-side (using Zustand + localStorage), you can also deploy the app without a database. The game will work perfectly for solo play — only the cross-device leaderboard feature requires a database.

To deploy without a database, simply skip Steps 2, 5, 7 and set a placeholder `DATABASE_URL` — the app will gracefully handle any database errors.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main app entry & routing
│   ├── layout.tsx                # Root layout with theme support
│   ├── globals.css               # Global styles & Tailwind
│   └── api/                      # API routes
│       ├── dialogue/route.ts     # AI dialogue endpoint
│       ├── feedback/analyze/     # Feedback analysis endpoint
│       ├── improvement/          # Service improvement endpoint
│       ├── surveys/              # Survey CRUD & evaluation
│       └── scores/               # Score & leaderboard endpoints
├── components/
│   ├── game/                     # Game dashboard, mission cards, achievements, leaderboard
│   ├── login/                    # Nickname entry & avatar selection
│   ├── missions/
│   │   ├── survey/               # Survey Builder components
│   │   ├── interview/            # Customer Interview (chat, client profile, needs tracker)
│   │   ├── feedback/             # Feedback Analysis (DnD cards, category buckets, scoring)
│   │   ├── difficult-client/     # Difficult Client (branching dialogue, emotion display)
│   │   └── improvement/          # Service Improvement (priority matrix, recommendations)
│   ├── shared/                   # Game header, XP bar, timer, animations
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
├── lib/
│   ├── stores/                   # Zustand state stores
│   ├── constants.ts              # Game constants (XP, missions, badges, avatars)
│   ├── scoring.ts                # Scoring algorithms
│   ├── db.ts                     # Prisma client instance
│   └── utils.ts                  # Utility functions
└── ...
```

## Game Flow

1. **Enter Nickname** — Choose a name and an IT-role avatar
2. **Mission Hub** — Browse available missions, see XP progress and level
3. **Select Mission** — Read the briefing and begin
4. **Complete Mission** — Interact with the scenario (build, chat, categorise, or plan)
5. **View Results** — See your score, XP earned, and badge unlocks
6. **Level Up** — Progress through ranks and try harder missions

## Level Progression

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Trainee | 0 |
| 2 | Junior Consultant | 200 |
| 3 | Consultant | 400 |
| 4 | Senior Consultant | 600 |
| 5 | Lead Consultant | 800 |
| 6 | Principal Consultant | 1000 |
| 7 | Expert | 1200 |
| 8 | Master | 1400 |
| 9 | Champion | 1600 |
| 10 | Legend | 1800 |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint checks |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Create and run database migration |
| `bun run db:migrate:deploy` | Apply pending migrations (for production) |
| `bun run db:reset` | Reset database |
| `bun run db:seed` | Seed database with initial data |

## Vercel Free Plan Limits

| Resource | Free Plan Limit | This Project's Usage |
|----------|----------------|---------------------|
| Bandwidth | 100 GB/month | < 1 GB (lightweight app) |
| Serverless Function Executions | Unlimited | ✅ |
| Serverless Function Duration | 10 sec (default) | ✅ (API routes are fast) |
| Vercel Postgres Storage | 0.5 GB | < 10 MB |
| Vercel Postgres Compute | 100 hours/month | ~5-10 hours for classroom use |
| Deployments | 100/day | ✅ |

## Troubleshooting

### Build errors on Vercel
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Make sure the build command includes `prisma migrate deploy`

### Database connection errors
- Verify your `DATABASE_URL` includes `?sslmode=require` for Neon/Vercel Postgres
- Check that the database is active in your Vercel Storage dashboard

### Leaderboard not showing data
- Run `bun run db:seed` to populate the database
- The leaderboard works from localStorage even without a database

## License

This project is private and intended for educational use.

## Acknowledgements

Built for vocational IT students practicing customer service and client consultation skills in an interactive, game-based learning environment.
