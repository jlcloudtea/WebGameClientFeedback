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
- **Database**: Prisma ORM with SQLite
- **State Management**: Zustand
- **AI**: z-ai-web-dev-sdk (LLM for dialogue generation)
- **Drag & Drop**: @dnd-kit/core
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/ict-support-pro.git
cd ict-support-pro

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env if needed — default uses local SQLite

# Set up the database
bun run db:push

# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./db/custom.db` | SQLite database connection string |

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
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

## License

This project is private and intended for educational use.

## Acknowledgements

Built for vocational IT students practicing customer service and client consultation skills in an interactive, game-based learning environment.
