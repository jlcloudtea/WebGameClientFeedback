'use client';

import { useGameStore } from '@/lib/stores/game-store';
import { useRoomStore } from '@/lib/stores/room-store';
import { MISSION_TYPES } from '@/lib/constants';
import XpBar from './XpBar';
import { Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const phaseLabels: Record<string, string> = {
  login: 'Welcome',
  lobby: 'Lobby',
  dashboard: 'Dashboard',
  'mission-active': 'Mission',
  'mission-summary': 'Summary',
  achievements: 'Achievements',
  teacher: 'Teacher Mode',
  leaderboard: 'Leaderboard',
};

export default function GameHeader() {
  const phase = useGameStore((s) => s.phase);
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const setPhase = useGameStore((s) => s.setPhase);
  const roomId = useRoomStore((s) => s.room?.id);

  const currentMission = currentMissionType
    ? MISSION_TYPES.find((m) => m.id === currentMissionType)
    : null;

  const handleHome = () => {
    if (phase === 'mission-active') {
      setPhase('dashboard');
    } else if (phase !== 'login') {
      setPhase('dashboard');
    }
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left — Logo + Home */}
        <div className="flex items-center gap-3 min-w-0">
          {phase !== 'login' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHome}
              className="shrink-0 text-slate-300 hover:text-white hover:bg-slate-700 h-8 w-8"
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">🛠️</span>
            <span className="font-bold text-white text-sm sm:text-base truncate">
              ICT Support Pro
            </span>
          </div>
        </div>

        {/* Center — Phase / Mission name */}
        <div className="hidden sm:flex items-center justify-center flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-300 truncate">
            {currentMission ? currentMission.title : phaseLabels[phase] ?? phase}
          </span>
          {roomId && phase !== 'login' && (
            <Badge variant="outline" className="ml-2 text-[10px] border-amber-500/50 text-amber-400 shrink-0">
              <Users className="h-3 w-3 mr-1" />
              {roomId}
            </Badge>
          )}
        </div>

        {/* Right — XP + Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <XpBar />
          {avatar && nickname && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{avatar}</span>
              <span className="text-xs font-medium text-slate-300 hidden md:inline max-w-[80px] truncate">
                {nickname}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
