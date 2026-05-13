'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { useRoomStore } from '@/lib/stores/room-store';
import GameHeader from '@/components/shared/GameHeader';
import NicknameEntry from '@/components/login/NicknameEntry';
import ModeSelector from '@/components/login/ModeSelector';
import RoomCodeEntry from '@/components/login/RoomCodeEntry';
import GameDashboard from '@/components/game/GameDashboard';
import AchievementPopup from '@/components/game/AchievementPopup';
import MissionBriefing from '@/components/missions/MissionBriefing';
import MissionSummary from '@/components/missions/MissionSummary';
import SurveyBuilder from '@/components/missions/survey/SurveyBuilder';
import InterviewScreen from '@/components/missions/interview/InterviewScreen';
import LobbyRoom from '@/components/lobby/LobbyRoom';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
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
    case 'difficult-client':
      return <InterviewScreen />;
    case 'feedback-analysis':
    case 'service-improvement':
      return <PlaceholderPhase name={`${missionType ?? 'Mission'} (Coming Soon)`} />;
    default:
      return <PlaceholderPhase name="Unknown Mission" />;
  }
}

/** Map AppPhase → React component */
function PhaseContent({ phase }: { phase: AppPhase }) {
  const missionPhase = useGameStore((s) => s.missionPhase);
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const room = useRoomStore((s) => s.room);

  switch (phase) {
    case 'login':
      return <NicknameEntry />;
    case 'lobby':
      // If player has joined a room, show lobby room; otherwise show mode selector
      return room ? <LobbyRoom /> : <ModeSelector />;
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
      return <PlaceholderPhase name="Achievements" />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'leaderboard':
      return <PlaceholderPhase name="Leaderboard" />;
    default:
      return <NicknameEntry />;
  }
}

export default function Home() {
  const phase = useGameStore((s) => s.phase);
  const showAchievement = useGameStore((s) => s.showAchievement);
  const missionPhase = useGameStore((s) => s.missionPhase);
  const room = useRoomStore((s) => s.room);

  // Use mission phase in the key so the component re-mounts on phase changes
  // Also include room state so lobby re-mounts properly
  const animationKey = phase === 'mission-active'
    ? `mission-${missionPhase}`
    : phase === 'lobby' && room
      ? 'lobby-room'
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
