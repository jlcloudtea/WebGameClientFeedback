# ICT Support Pro — Project Documentation

> **Save this file!** It contains everything you need to reuse, modify, or redeploy this project.

---

## 1. Project Overview

**Name**: ICT Support Pro — Customer Service Training Simulator  
**Type**: Interactive Educational Role-Play Simulation Game  
**Target Audience**: Vocational ICT students (AQF Level 2-3)  
**Subject**: Customer Service, Evaluation Tools & Client Feedback Collection  
**Framework**: Next.js 16 + React 19 + TypeScript 5  
**Styling**: Tailwind CSS 4 + shadcn/ui  
**State Management**: Zustand (6 independent stores with localStorage persistence)  
**Database**: Prisma ORM + SQLite  
**Real-time**: Socket.io mini-service (port 3001)  
**AI**: z-ai-web-dev-sdk (server-side only, via API routes)  
**Total Custom Code**: ~12,500 lines across 78 files  

---

## 2. Game Features

### Two Play Modes

| Mode | Description |
|---|---|
| **Solo Mode** | Single player with AI-controlled clients, coworkers, and managers |
| **Multiplayer Mode** | 2-6 players join by room code, collaborate on missions in real-time |

### 5 Mission Types

| # | Mission | Type | Description |
|---|---|---|---|
| 1 | Survey Builder | `survey-builder` | Create customer feedback surveys with quantitative/qualitative questions |
| 2 | Customer Interview | `customer-interview` | Interview AI clients, ask open-ended questions, discover hidden needs |
| 3 | Feedback Analysis | `feedback-analysis` | Categorise survey responses, identify trends, analyze sentiment |
| 4 | Difficult Client | `difficult-client` | De-escalate angry/frustrated clients with professional communication |
| 5 | Service Improvement | `service-improvement` | Create improvement plans based on collected feedback |

### Scoring System

- **Points** per mission based on rubric evaluation
- **XP** earned, leading to level-ups (200 XP per level)
- **10 Achievement Badges** with XP rewards
- **Leaderboard** (global and room-scoped)
- **Client Satisfaction Meter** (0-100) in interview/difficult client missions

### Badges

| Badge | Icon | Requirement | XP |
|---|---|---|---|
| First Steps | ⭐ | Complete your first mission | 50 |
| Survey Master | 📋 | Score 80%+ on Survey Builder | 100 |
| Interview Pro | 🎤 | Score 80%+ on Customer Interview | 100 |
| Data Detective | 🔍 | Score 80%+ on Feedback Analysis | 100 |
| De-escalation Expert | 🕊️ | Score 80%+ on Difficult Client | 150 |
| Improvement Champion | 🚀 | Score 80%+ on Service Improvement | 150 |
| Team Player | 🤝 | Complete a multiplayer session | 75 |
| Perfectionist | 💎 | Score 100% on any mission | 200 |
| All-Rounder | 🏆 | Complete all 5 missions | 300 |
| Feedback Guru | 📊 | Complete 3 feedback analysis missions | 125 |

---

## 3. Project Structure

```
src/
├── app/
│   ├── page.tsx                       # SINGLE ROUTE - phase switcher
│   ├── layout.tsx                     # Root layout
│   ├── globals.css                    # Global styles
│   └── api/                           # Backend API routes
│       ├── auth/login/                # Player login
│       ├── missions/                  # Mission templates
│       ├── scores/                    # Score submission + leaderboard
│       ├── surveys/                   # Survey save + evaluate
│       ├── dialogue/                  # AI dialogue generation
│       ├── feedback/analyze/          # AI sentiment analysis
│       ├── improvement/               # Improvement plan saving
│       └── teacher/                   # Teacher login + dashboard
│
├── components/
│   ├── login/                         # Login screens
│   │   ├── NicknameEntry.tsx          # Main login with avatar picker
│   │   ├── ModeSelector.tsx           # Solo vs Multiplayer
│   │   └── RoomCodeEntry.tsx          # Room code input
│   ├── lobby/                         # Multiplayer lobby
│   │   ├── LobbyRoom.tsx              # Waiting room
│   │   ├── PlayerCard.tsx             # Player display
│   │   └── RoomChat.tsx               # Lobby chat
│   ├── game/                          # Core game UI
│   │   ├── GameDashboard.tsx          # Mission selection
│   │   ├── MissionCard.tsx            # Mission card in grid
│   │   └── AchievementPopup.tsx       # Badge unlock overlay
│   ├── missions/                      # Mission components
│   │   ├── MissionBriefing.tsx        # Mission intro
│   │   ├── MissionSummary.tsx         # Score breakdown
│   │   ├── survey/                    # 6 files: SurveyBuilder, Canvas, Palette, etc.
│   │   ├── interview/                 # 5 files: InterviewScreen, Chat, etc.
│   │   ├── feedback/                  # 5 files: FeedbackDashboard, CategoryBucket, etc.
│   │   ├── difficult-client/          # 5 files: DifficultClientScreen, etc.
│   │   └── improvement/               # 5 files: ImprovementScreen, etc.
│   ├── shared/                        # Shared components
│   │   ├── GameHeader.tsx, XpBar.tsx, TimerDisplay.tsx, etc.
│   ├── teacher/                       # Teacher dashboard
│   │   ├── TeacherDashboard.tsx, RoomManager, StudentProgress, etc.
│   └── ui/                            # 57 shadcn/ui components
│
├── hooks/
│   ├── use-socket.ts                  # Socket.io connection hook
│   ├── use-mobile.ts, use-toast.ts    # Utility hooks
│
├── lib/
│   ├── stores/                        # 7 Zustand stores
│   │   ├── game-store.ts              # Main game state (persist)
│   │   ├── survey-store.ts            # Survey builder state
│   │   ├── dialogue-store.ts          # Dialogue/interview state
│   │   ├── feedback-store.ts          # Feedback analysis state
│   │   ├── improvement-store.ts       # Service improvement state
│   │   ├── room-store.ts             # Multiplayer room state
│   │   └── types.ts                   # All type definitions
│   ├── constants.ts                   # Game constants, mission defs, badges
│   ├── scoring.ts                     # Scoring rubric functions
│   ├── ai-prompts.ts                  # AI system prompts
│   ├── db.ts                          # Prisma client
│   └── utils.ts                       # Utility functions
│
├── mini-services/
│   └── socket-server/                 # Socket.io mini-service (port 3001)
│       ├── index.ts                   # Server entry point
│       └── package.json               # Independent bun project
│
└── prisma/
    ├── schema.prisma                  # 16 database models
    └── seed.ts                        # 5 mission templates + 10 badges
```

---

## 4. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npx prisma db push
npx prisma db seed   # or: bun run prisma/seed.ts

# 3. Start the Next.js dev server
npm run dev           # http://localhost:3000

# 4. (Optional) Start the Socket.io server for multiplayer
cd mini-services/socket-server
npm install
npm run dev           # ws://localhost:3001
```

---

## 5. How to Deploy

### Vercel (Recommended - Free)
1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Deploy — auto-detects Next.js
4. **Note**: Socket.io mini-service needs separate hosting (Render/Railway free tier, or teacher's machine)

### Cloudflare Pages
1. Change `next.config.ts`: set `output: "export"` and `images: { unoptimized: true }`
2. Push to GitHub → Connect on Cloudflare Pages
3. Socket.io requires separate hosting

---

## 6. How to Add a New Mission

1. Add mission type to `src/lib/stores/types.ts` (MissionType union)
2. Add mission definition to `src/lib/constants.ts` (MISSION_TYPES array)
3. Create scenario data in `prisma/seed.ts` or database
4. Create a scoring function in `src/lib/scoring.ts`
5. Create mission components in `src/components/missions/your-mission/`
6. Wire into `src/app/page.tsx` phase switcher

---

## 7. Key Files to Modify

| Task | File |
|---|---|
| Add new scenarios | `prisma/seed.ts` → MissionTemplate.scenarioData |
| Change scoring logic | `src/lib/scoring.ts` |
| Change game constants | `src/lib/constants.ts` |
| Modify AI prompts | `src/lib/ai-prompts.ts` |
| Add new badges | `src/lib/constants.ts` BADGE_DEFINITIONS |
| Change state management | `src/lib/stores/*.ts` |
| Modify multiplayer events | `mini-services/socket-server/index.ts` |

---

## 8. Database Schema (16 Models)

| Model | Purpose |
|---|---|
| Player | Student profiles with XP/level |
| Teacher | Teacher accounts with passcode |
| Room | Game rooms with codes |
| RoomPlayer | Player-room junction with roles |
| TeacherSession | Active teacher sessions |
| MissionTemplate | Reusable mission definitions |
| RoomMission | Mission instances per room |
| Score | Per-mission scoring |
| Badge / PlayerBadge | Achievement system |
| Survey / SurveyQuestion / SurveyResponse | Survey builder data |
| DialogueLog | Conversation tracking |
| FeedbackAnalysis | Feedback categorization |
| ImprovementPlan | Service improvement records |

---

## 9. API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Login/create player |
| `/api/missions` | GET | List all missions |
| `/api/missions/[id]` | GET | Get mission details |
| `/api/scores` | POST | Submit score + update XP |
| `/api/scores/leaderboard` | GET | Top 20 players |
| `/api/surveys` | POST | Save survey |
| `/api/surveys/evaluate` | POST | Evaluate survey quality |
| `/api/dialogue` | POST | AI customer dialogue |
| `/api/feedback/analyze` | POST | AI sentiment analysis |
| `/api/improvement` | POST | Save improvement plan |
| `/api/teacher` | POST | Teacher login |
| `/api/teacher/dashboard` | GET | Class analytics data |

---

## 10. Socket.io Events

### Client → Server
`room:create`, `room:join`, `room:leave`, `room:ready`, `room:chat`, `mission:start`, `mission:progress`, `mission:complete`

### Server → Client
`room:created`, `room:updated`, `room:player-joined`, `room:player-left`, `room:chat`, `mission:started`, `mission:timer-tick`, `mission:player-completed`, `leaderboard:update`, `error`

---

*Generated: May 2025 — Built with Z.ai Code Assistant*
