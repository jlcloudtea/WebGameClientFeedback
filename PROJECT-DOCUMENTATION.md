# Junior IT Consultant Adventure — Project Documentation

> **Save this file!** It contains everything you need to reuse, modify, or redeploy this project in the future.

---

## 1. Project Overview

**Name**: Junior IT Consultant Adventure  
**Type**: Interactive Educational Web Game  
**Target Audience**: Vocational IT students (AQF Level 2-3)  
**Subject**: Identify and Document Client Requirements  
**Framework**: Next.js 16 + React 19 + TypeScript 5  
**Styling**: Tailwind CSS 4 + shadcn/ui  
**State Management**: Zustand (with localStorage persistence)  
**Total Game Code**: ~7,870 lines across 14 files  

---

## 2. Game Features

### 5 Client Scenarios

| # | Scenario ID | Title | Client | Difficulty | Icon |
|---|---|---|---|---|---|
| 1 | `school-laptops` | School Laptop Upgrade | Mrs. Sarah Davis (Principal) | Beginner | 🏫 |
| 2 | `printer-issue` | Print Shop Problems | Mr. Jake Thompson (Business Owner) | Intermediate | 🖨️ |
| 3 | `network-upgrade` | Network Nightmares | Ms. Lisa Chen (Office Manager) | Advanced | 🌐 |
| 4 | `teacher-software` | Software Solutions | Mr. Raj Patel (IT Teacher) | Beginner | 📚 |
| 5 | `remote-worker` | Remote Access Rescue | Ms. Ana Martinez (Ops Director) | Intermediate | 🏠 |

### 7 Game Phases (per scenario)

1. **Scenario Intro** — Meet the client, read their background
2. **Dialogue** — Conversation simulator with 3-4 dialogue nodes, each with 4 response options (open, closed, clarification, probing, poor)
3. **Active Listening** — Drag-and-drop categorization of requirements into categories (budget, technical, policy, etc.)
4. **Questioning** — Multiple-choice mini-game about question types
5. **Guidelines** — Organisational policy compliance challenges
6. **Documentation** — Fill out requirement documentation forms
7. **Recommendation** — Compare 3 solutions, write analysis, recommend the best one

### Scoring System

- **Client Satisfaction** (0-100): Based on dialogue trust level
- **Professionalism** (0-100): Average of guidelines + documentation scores
- **Communication** (0-100): Average of dialogue + questioning scores
- **Requirement Accuracy** (0-100): Average of listening + documentation + recommendation scores

### 10 Badges/Achievements

| Badge | Icon | Requirement |
|---|---|---|
| Active Listener | 👂 | 80%+ on any Listening challenge |
| Investigation Expert | 🔍 | 80%+ on any Questioning challenge |
| Requirements Detective | 📋 | 80%+ on any Documentation challenge |
| Client Communication Master | 💬 | 90%+ client satisfaction |
| Policy Pro | 📜 | 100% on any Guidelines challenge |
| Budget Guardian | 💰 | Choose budget-appropriate solutions in 3 scenarios |
| First Steps | ⭐ | Complete any scenario |
| IT Consultant Graduate | 🎓 | Complete all 5 scenarios |
| Perfect Consultant | 🏆 | 100% on any scenario |
| Quick Thinker | ⚡ | 90%+ communication in any scenario |

---

## 3. Project Structure

```
my-project/
├── src/
│   ├── app/
│   │   ├── api/route.ts          # Placeholder API route (unused by game)
│   │   ├── globals.css           # Global styles + Tailwind
│   │   ├── layout.tsx            # Root layout (fonts, metadata, Toaster)
│   │   └── page.tsx              # Main game page (phase router)
│   │
│   ├── components/
│   │   ├── game/                 # 🎮 GAME-SPECIFIC COMPONENTS
│   │   │   ├── AchievementPopup.tsx    # Badge unlock animation overlay
│   │   │   ├── ActiveListeningGame.tsx # Drag-and-drop categorization
│   │   │   ├── DialogueSystem.tsx      # Conversation simulator
│   │   │   ├── DocumentationSystem.tsx # Requirement form + evaluation
│   │   │   ├── GameDashboard.tsx       # Scenario selection screen
│   │   │   ├── GameHeader.tsx          # Top bar (logo, phase, score, hint)
│   │   │   ├── GuidelinesChallenge.tsx # Policy compliance questions
│   │   │   ├── QuestioningGame.tsx     # Question type mini-game
│   │   │   ├── RecommendationEngine.tsx # Solution comparison + selection
│   │   │   ├── ScenarioIntro.tsx       # Client introduction screen
│   │   │   └── ScenarioSummary.tsx     # End-of-scenario score breakdown
│   │   │
│   │   └── ui/                  # shadcn/ui base components (50+ files)
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts        # Mobile detection hook
│   │   └── use-toast.ts         # Toast notification hook
│   │
│   └── lib/
│       ├── game-data.ts         # 📊 ALL GAME DATA (scenarios, dialogues, etc.)
│       ├── game-store.ts        # 🧠 ZUSTAND STORE (state management)
│       ├── game-types.ts        # 📝 TypeScript type definitions
│       ├── db.ts                # Prisma client (unused by game)
│       └── utils.ts             # Utility functions (cn helper)
│
├── prisma/
│   └── schema.prisma            # Database schema (unused by game)
│
├── public/                      # Static assets
├── package.json                 # Dependencies
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── PROJECT-DOCUMENTATION.md     # ← THIS FILE
```

---

## 4. Key Files to Modify

### To add a new client scenario:
→ Edit **`src/lib/game-data.ts`** — copy an existing scenario object and modify it

### To change game logic/scoring:
→ Edit **`src/lib/game-store.ts`** — contains all state management and score calculations

### To add new types:
→ Edit **`src/lib/game-types.ts`** — all TypeScript interfaces defined here

### To change a specific game phase UI:
→ Edit the corresponding component in **`src/components/game/`**

### To change the overall layout:
→ Edit **`src/app/page.tsx`** (game phase router) or **`src/app/layout.tsx`** (root layout)

---

## 5. How to Run Locally

### Prerequisites
- **Node.js** >= 18.x OR **Bun** >= 1.x
- **npm** or **bun** package manager

### Steps
```bash
# 1. Install dependencies
npm install
# or: bun install

# 2. Start development server
npm run dev
# or: bun run dev

# 3. Open in browser
# http://localhost:3000
```

### Other commands
```bash
npm run lint       # Check code quality
npm run build      # Production build
npm run start      # Start production server (after build)
```

---

## 6. How to Deploy (Free Options)

### Option A: Vercel (Recommended — Zero Changes)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Import your repo → Deploy
4. Get a permanent URL like `your-game.vercel.app`

### Option B: Cloudflare Pages (Free, Global CDN)
1. Change `next.config.ts`: set `output: "export"` and `images: { unoptimized: true }`
2. Delete `src/app/api/route.ts` (not needed)
3. Push to GitHub
4. Go to [Cloudflare Pages](https://dash.cloudflare.com) → Connect repo → Deploy

### Option C: VPS / Docker
```bash
# Build standalone output (change next.config.ts back to output: "standalone")
npm run build
NODE_ENV=production node .next/standalone/server.js
```

---

## 7. How to Add a New Scenario

Here's a template — copy this and fill in your content in `src/lib/game-data.ts`:

```typescript
const newScenario: Scenario = {
  id: 'unique-scenario-id',
  title: 'Scenario Title',
  subtitle: 'Short subtitle',
  description: 'Longer description for the dashboard card',
  difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  icon: '💻', // emoji
  color: 'amber', // tailwind color name
  client: {
    id: 'client-id',
    name: 'Client Name',
    role: 'Job Title',
    organization: 'Company Name',
    avatar: '👨‍💼', // emoji avatar
    personality: 'Description of personality for AI/hints',
    emotionalState: 'neutral', // 'happy' | 'frustrated' | 'confused' | 'worried' | 'neutral' | 'excited'
    budget: '$10,000',
    hiddenRequirements: [
      'Requirement the student must discover',
      'Another hidden requirement',
    ],
  },
  dialogue: [
    {
      id: 'd1',
      speaker: 'client',
      text: 'What the client says...',
      emotion: 'neutral',
      isIntro: true,
      options: [
        {
          id: 'd1-a',
          text: 'Your response text (open question)',
          type: 'open', // 'open' | 'closed' | 'clarification' | 'probing' | 'strategic' | 'poor'
          score: 10,    // -5 to 10
          clientResponse: 'Client replies...',
          clientEmotion: 'happy',
          unlocksInfo: 'Information revealed (optional)',
          feedback: 'Educational feedback shown to student',
          isCorrect: true,
        },
        // Add 3-4 options per dialogue node
      ],
    },
    // Add 3-4 dialogue nodes per scenario
  ],
  listeningItems: [
    { id: 'li1', text: 'Fact the student should identify', category: 'technical', isImportant: true },
    { id: 'li2', text: 'Distractor item', category: 'technical', isImportant: false },
    // Categories: 'budget' | 'timeline' | 'technical' | 'policy' | 'support' | 'compatibility' | 'training'
  ],
  questionChallenges: [
    {
      id: 'qc1',
      situation: 'A scenario description...',
      options: [
        { id: 'qc1-a', text: 'Option A', type: 'open', isBest: true, feedback: 'Why this is best' },
        { id: 'qc1-b', text: 'Option B', type: 'closed', isBest: false, feedback: 'Why this is not best' },
        // Add 4 options per challenge
      ],
      correctAnswer: 'qc1-a',
    },
    // Add 3-4 question challenges
  ],
  guidelines: [
    {
      id: 'g1',
      title: 'Policy Challenge Title',
      description: 'The situation the student faces...',
      policy: 'The organisational policy text...',
      options: [
        { id: 'g1-a', text: 'Option that violates policy', followsGuidelines: false, feedback: 'Why this violates policy', score: 0 },
        { id: 'g1-b', text: 'Option that follows policy best', followsGuidelines: true, feedback: 'Why this is correct', score: 10 },
        // Add 4 options per guideline
      ],
      correctAnswer: 'g1-b',
    },
    // Add 1-3 guideline challenges
  ],
  documentationFields: [
    { id: 'doc1', label: 'Field Name', placeholder: 'What to enter', required: true, category: 'technical', correctValues: ['keyword1', 'keyword2'] },
    // Add 6-8 documentation fields
  ],
  solutions: [
    {
      id: 'sol1',
      name: 'Budget Option',
      description: 'Basic solution description',
      cost: '$5,000',
      advantages: ['Pro 1', 'Pro 2'],
      disadvantages: ['Con 1', 'Con 2'],
      suitability: 2,          // 1-5 rating
      supportLevel: 'basic',   // 'basic' | 'standard' | 'premium'
      meetsRequirements: false,
      meetsBudget: true,
      followsPolicy: true,
    },
    {
      id: 'sol2',
      name: 'Best Option',
      description: 'Ideal solution that meets all requirements',
      cost: '$9,000',
      advantages: ['Pro 1', 'Pro 2', 'Pro 3'],
      disadvantages: ['Con 1'],
      suitability: 5,
      supportLevel: 'standard',
      meetsRequirements: true,
      meetsBudget: true,
      followsPolicy: true,
    },
    {
      id: 'sol3',
      name: 'Premium Option',
      description: 'Over-specified expensive solution',
      cost: '$20,000',
      advantages: ['Pro 1', 'Pro 2', 'Pro 3', 'Pro 4'],
      disadvantages: ['Over budget', 'Over-specified'],
      suitability: 3,
      supportLevel: 'premium',
      meetsRequirements: true,
      meetsBudget: false,
      followsPolicy: true,
    },
  ],
  learningObjectives: [
    'Objective 1',
    'Objective 2',
  ],
  keyConcepts: [
    'Concept 1',
    'Concept 2',
  ],
};

// Don't forget to add it to the ALL_SCENARIOS array:
export const ALL_SCENARIOS: Scenario[] = [
  schoolLaptopsScenario,
  printerScenario,
  networkScenario,
  teacherSoftwareScenario,
  remoteWorkerScenario,
  newScenario,  // ← Add here
];
```

---

## 8. Dependencies (What You Need)

### Runtime Dependencies (Key Ones)
| Package | Version | Purpose |
|---|---|---|
| `next` | ^16.1.1 | Framework |
| `react` | ^19.0.0 | UI library |
| `zustand` | ^5.0.6 | State management + localStorage persistence |
| `framer-motion` | ^12.23.2 | Animations (dialogue, phase transitions, achievements) |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop (active listening game) |
| `lucide-react` | ^0.525.0 | Icons |
| `tailwind-merge` | ^3.3.1 | Tailwind class merging |
| `sonner` | ^2.0.6 | Toast notifications |

### Full list is in `package.json` — run `npm install` to install all.

---

## 9. Known Issues & Fixes Applied

| Date | Issue | Fix |
|---|---|---|
| Bug fix | Organisational Guidelines phase broke for scenarios with only 1 guideline (4 of 5 scenarios) | Removed premature `currentGuidelineIndex++` from `answerGuideline()` in game-store.ts; added separate `nextGuideline()` action called only when user clicks "Next" |
| Config | `output: "standalone"` in next.config.ts was for Docker/VPS | Removed for Vercel compatibility (Vercel handles output automatically) |

---

## 10. Browser Compatibility

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

**Requires**: JavaScript enabled, LocalStorage enabled (for game saves)  
**Works on**: Desktop, tablet, and mobile (fully responsive)

---

## 11. File Sizes (Approximate)

| Item | Size |
|---|---|
| Source code (`src/`) | ~200 KB |
| Full project (with node_modules) | ~1.5 GB |
| Production build (`.next/`) | ~271 MB |
| Standalone build (`.next/standalone/`) | ~75 MB |
| Zip archive (no node_modules/.next) | ~14 MB |

---

*Generated on: March 2025*  
*Project built with Z.ai Code Assistant*
