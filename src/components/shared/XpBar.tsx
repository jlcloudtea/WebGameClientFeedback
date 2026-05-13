'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { XP_PER_LEVEL, getLevelTitle } from '@/lib/constants';

export default function XpBar() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);

  const xpInCurrentLevel = xp % XP_PER_LEVEL;
  const progressPercent = Math.min((xpInCurrentLevel / XP_PER_LEVEL) * 100, 100);
  const levelTitle = getLevelTitle(level);

  return (
    <div className="flex items-center gap-2">
      {/* Level badge */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-xs shadow-sm">
        {level}
      </div>

      {/* XP progress */}
      <div className="flex flex-col gap-0.5 min-w-[80px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-amber-700 leading-none">
            {levelTitle}
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            {xpInCurrentLevel}/{XP_PER_LEVEL}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
