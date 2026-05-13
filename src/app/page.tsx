'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import GameHeader from '@/components/shared/GameHeader';
import NicknameEntry from '@/components/login/NicknameEntry';
import GameDashboard from '@/components/game/GameDashboard';
import AchievementPopup from '@/components/game/AchievementPopup';
import MissionBriefing from '@/components/missions/MissionBriefing';
import MissionSummary from '@/components/missions/MissionSummary';
import SurveyBuilder from '@/components/missions/survey/SurveyBuilder';
import InterviewScreen from '@/components/missions/interview/InterviewScreen';
import DifficultClientScreen from '@/components/missions/difficult-client/DifficultClientScreen';
import FeedbackDashboard from '@/components/missions/feedback/FeedbackDashboard';
import ImprovementScreen from '@/components/missions/improvement/ImprovementScreen';
import AchievementsPage from '@/components/game/AchievementsPage';
import LeaderboardPage from '@/components/game/LeaderboardPage';
import type { AppPhase, MissionType, MissionPhase } from '@/lib/stores/types';

/** Placeholder components for phases not yet built — these will be replaced later */
function PlaceholderPhase({ name }: { name: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <span className="text-5xl block">🚧</span>
        <h2 className="text-xl font-bold text-slate-700">{name}</h2>
        <p className="text-sm text-slate-400">This section is under construction.</p>
      </div>
    </div>
  );
}

/** Renders the correct mission component based on mission type and phase */
function MissionContent({ missionType, missionPhase }: { missionType: MissionType | null; missionPhase: MissionPhase }) {
  // Briefing phase — same for all mission types
  if (missionPhase === 'briefing') {
    return <MissionBriefing />;
  }

  // Scoring phase — show summary
  if (missionPhase === 'scoring') {
    return <MissionSummary />;
  }

  // Active phase — mission-specific component
  switch (missionType) {
    case 'survey-builder':
      return <SurveyBuilder />;
    case 'customer-interview':
      return <InterviewScreen />;
    case 'difficult-client':
      return <DifficultClientScreen />;
    case 'feedback-analysis':
      return <FeedbackDashboard />;
    case 'service-improvement':
      return <ImprovementScreen />;
    default:
      return <PlaceholderPhase name="Unknown Mission" />;
  }
}

/** Map AppPhase → React component */
function PhaseContent({ phase }: { phase: AppPhase }) {
  const missionPhase = useGameStore((s) => s.missionPhase);
  const currentMissionType = useGameStore((s) => s.currentMissionType);

  switch (phase) {
    case 'login':
      return <NicknameEntry />;
    case 'lobby':
    case 'dashboard':
      return <GameDashboard />;
    case 'mission-active':
      return (
        <MissionContent
          missionType={currentMissionType}
          missionPhase={missionPhase}
        />
      );
    case 'mission-summary':
      return <MissionSummary />;
    case 'achievements':
      return <AchievementsPage />;
    case 'teacher':
      return <GameDashboard />;
    case 'leaderboard':
      return <LeaderboardPage />;
    default:
      return <NicknameEntry />;
  }
}

export default function Home() {
  const phase = useGameStore((s) => s.phase);
  const showAchievement = useGameStore((s) => s.showAchievement);
  const missionPhase = useGameStore((s) => s.missionPhase);

  const animationKey = phase === 'mission-active'
    ? `mission-${missionPhase}`
    : phase;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <GameHeader />

      {/* Main content area with animated phase transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <PhaseContent phase={phase} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Achievement popup overlay */}
      {showAchievement && <AchievementPopup />}

      {/* Sticky footer */}
      <footer className="mt-auto border-t bg-slate-900 text-slate-400 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-300">
            ICT Support Pro — Customer Service Training Simulator
          </p>
          <p className="text-xs text-slate-500">
            AQF Level 2-3 • Identify &amp; Document Client Requirements
          </p>
        </div>
      </footer>
    </div>
  );
}
