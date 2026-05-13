# Task 3-a: Database Developer — Prisma Schema & Seed Data

## Task
Build the Prisma schema and seed data for the ICT Support Pro game.

## Work Completed

### Schema (`prisma/schema.prisma`)
- Replaced default User/Post models with 16 game-specific models
- All models use SQLite provider with `@id @default(cuid())` for IDs
- JSON fields stored as `String` type for SQLite compatibility
- Relations with `onDelete: Cascade` for dependent records
- Unique constraints: `RoomPlayer(roomId+playerId)`, `Badge(slug)`, `Room.code`

### Models Created
1. **Player** — id, nickname, avatar, xp, level, timestamps
2. **Teacher** — id, nickname, passcode, timestamps
3. **Room** — id, code, name, mode, status, maxPlayers, currentMissionId, timerSeconds, timestamps, completedAt
4. **RoomPlayer** — id, roomId, playerId, role, gameRole, isReady, joinedAt
5. **TeacherSession** — id, teacherId, isActive, startedAt, endedAt
6. **MissionTemplate** — id, type, title, description, difficulty, scenarioData, scoringRubric, estimatedMin, createdAt
7. **RoomMission** — id, roomId, missionTemplateId, order, status, startedAt, completedAt
8. **Score** — id, playerId, roomMissionId, points, breakdown, clientSatisfaction, timeTakenSec, completedAt
9. **Badge** — id, slug, name, description, icon, requirement, category, xpReward
10. **PlayerBadge** — id, playerId, badgeId, earnedAt
11. **Survey** — id, roomMissionId, playerId, title, description, createdAt
12. **SurveyQuestion** — id, surveyId, order, type, text, options, required, createdAt
13. **SurveyResponse** — id, surveyId, playerId, answers, submittedAt
14. **DialogueLog** — id, playerId, roomMissionId, nodeId, selectedOptionId, aiGenerated, timestamp
15. **FeedbackAnalysis** — id, playerId, roomMissionId, responseId, category, sentiment, isCorrect, createdAt
16. **ImprovementPlan** — id, playerId, roomMissionId, recommendations, actionItems, overallScore, createdAt

### Seed Data (`prisma/seed.ts`)
- **5 MissionTemplates** with rich scenarioData:
  - SURVEY_BUILDER: Greenfield Medical Centre post-installation survey
  - CUSTOMER_INTERVIEW: Mrs. Sarah Chen frustrated teacher persona
  - FEEDBACK_ANALYSIS: LibraryPro 3.0 feedback with 12 items to categorise
  - DIFFICULT_CLIENT: Mr. David Hargrove escalating executive
  - SERVICE_IMPROVEMENT: School IT Help Desk improvement plan
- **10 Badges** across 4 categories:
  - PROGRESSION: first-steps (50xp), team-player (75xp)
  - SKILL: sharp-listener (100xp), question-master (100xp), cool-under-pressure (150xp), survey-architect (100xp), data-detective (120xp), improvement-champion (150xp)
  - ACHIEVEMENT: five-star-service (200xp)
  - MASTERY: ict-professional (300xp)

## Verification
- `bun run db:push` — schema applied successfully
- `bun run prisma/seed.ts` — all 15 records created (5 templates + 10 badges)
