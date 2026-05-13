'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';

export default function TimerDisplay() {
  const missionTimer = useGameStore((s) => s.missionTimer);
  const missionTimerActive = useGameStore((s) => s.missionTimerActive);
  const setMissionTimer = useGameStore((s) => s.setMissionTimer);
  const setMissionTimerActive = useGameStore((s) => s.setMissionTimerActive);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (missionTimerActive && missionTimer > 0) {
      intervalRef.current = setInterval(() => {
        const current = useGameStore.getState().missionTimer;
        if (current <= 1) {
          setMissionTimer(0);
          setMissionTimerActive(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setMissionTimer(current - 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [missionTimerActive, missionTimer, setMissionTimer, setMissionTimerActive]);

  if (!missionTimerActive && missionTimer === 0) return null;

  const minutes = Math.floor(missionTimer / 60);
  const seconds = missionTimer % 60;
  const isUrgent = missionTimer <= 30;

  // Circular progress (use 600s as max for the circle visual)
  const maxSeconds = 600;
  const progress = Math.min(missionTimer / maxSeconds, 1);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={isUrgent ? '#ef4444' : '#f59e0b'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <AnimatePresence mode="wait">
          <motion.span
            key={missionTimer}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-lg font-mono font-bold ${
              isUrgent ? 'text-red-500' : 'text-slate-700'
            }`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
        {/* Pulse ring when urgent */}
        {isUrgent && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>
      <span className={`text-[10px] font-medium ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
        {isUrgent ? 'Hurry!' : 'Time Left'}
      </span>
    </div>
  );
}
