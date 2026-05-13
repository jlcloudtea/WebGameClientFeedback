# Task 4-a: Login Screen, Game Dashboard, Shared Components, Main Page

**Agent**: Frontend Developer
**Task ID**: 4-a
**Date**: 2025-03-05

## Task Description
Build the Login screen, Game Dashboard, Shared Components, and the main page.tsx for the "ICT Support Pro" educational role-play simulation game.

## Files Created

### Shared Components (`/home/z/my-project/src/components/shared/`)

1. **AnimatedTransition.tsx** — Reusable AnimatePresence wrapper with fade + slide animation, configurable direction (up/down/left/right) and duration
2. **XpBar.tsx** — Visual XP progress bar with gradient fill (amber→orange→rose), level badge (circular gradient), level title, and XP numbers (current/needed)
3. **GameHeader.tsx** — Sticky header with:
   - Logo area (🛠️ ICT Support Pro) + Home button
   - Center: current phase/mission name + room code badge (multiplayer)
   - Right: XpBar + avatar + nickname
   - Dark gradient background (slate-900→800→900)
4. **ClientSatisfactionMeter.tsx** — Semi-circular SVG gauge:
   - 0-100 range with animated arc transitions
   - Color-coded: red (0-30), amber (31-60), green (61-100)
   - SVG gradient definitions, numeric center value, text label
5. **TimerDisplay.tsx** — Circular countdown timer:
   - SVG progress circle, auto-decrementing via useEffect interval
   - Urgent mode (< 30s): red color + pulsing ring animation
   - AnimatePresence for smooth digit transitions

### Login Components (`/home/z/my-project/src/components/login/`)

6. **NicknameEntry.tsx** — Full login screen:
   - Gradient top banner (amber→orange→rose) with title + subtitle
   - Nickname input field with Enter key support
   - 8-option emoji avatar grid from AVATAR_OPTIONS constant
   - "Start Learning" (solo → dashboard) and "Join Classroom" (multiplayer → lobby) buttons
   - Teacher login link at bottom
   - Pre-fills nickname if persisted in store
7. **ModeSelector.tsx** — Mode selection:
   - Two large animated cards (Solo + Multiplayer) with spring hover effects
   - Gradient card headers, descriptive text, action buttons
   - Back button to return to login
8. **RoomCodeEntry.tsx** — Room code entry:
   - 6-character input with uppercase normalization
   - Visual code preview boxes (6 individual squares)
   - Simulated room join with loading state
   - Error handling and character count

### Game Components (`/home/z/my-project/src/components/game/`)

9. **MissionCard.tsx** — Individual mission card:
   - Gradient top border (unique per mission type)
   - Large emoji icon, title, description (2-line clamp)
   - Difficulty badge (emerald/amber/rose for beginner/intermediate/advanced)
   - Time estimate + XP reward display
   - Best score display if completed
   - Lock overlay for locked missions
   - Hover scale animation
10. **GameDashboard.tsx** — Main dashboard:
    - Sidebar: player info card (avatar, nickname, level, XP), quick stats grid, badges summary (earned/locked), achievements/leaderboard buttons
    - Main area: mission grid (2 col mobile, 3 desktop) with sequential unlock logic
    - AchievementPopup rendered when showAchievement is true
11. **AchievementPopup.tsx** — Badge earned celebration:
    - Fixed overlay with backdrop blur
    - 20 confetti particles with random colors and trajectories
    - Spring-animated badge icon with pulse glow
    - Badge title, description, XP reward
    - "Awesome!" dismiss button that awards XP

### Main Page

12. **page.tsx** — Phase-based router:
    - Switches content based on `useGameStore(s => s.phase)`
    - AnimatePresence + motion.div for page transitions
    - Layout: GameHeader (top) → PhaseContent (main) → Footer (bottom, mt-auto)
    - PlaceholderPhase for unbuilt routes (mission-active, mission-summary, achievements, teacher, leaderboard)
    - Footer: "ICT Support Pro — Customer Service Training Simulator • AQF Level 2-3"

## Design Decisions
- Color scheme: amber/orange/emerald primary — NO blue/indigo per guidelines
- All cards use rounded-2xl with generous padding (p-6, p-8)
- Gradient backgrounds on key elements (header, login card, player card)
- Mobile-first responsive: sm/md/lg/xl breakpoints
- Sequential mission unlock: mission N+1 requires completing mission N
- AchievementPopup renders at both page-level and dashboard-level for flexibility
- RoomCodeEntry simulates room join (real socket integration to be added later)
- Timer uses useGameStore directly (not props) for real-time countdown

## Lint Status
✅ `bun run lint` passes with zero errors

## Dev Server Status
✅ App returns HTTP 200 at localhost:3000
