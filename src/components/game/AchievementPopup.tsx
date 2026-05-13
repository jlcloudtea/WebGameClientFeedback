'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { BADGE_DEFINITIONS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function AchievementPopup() {
  const latestBadgeId = useGameStore((s) => s.latestBadgeId);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);
  const earnBadge = useGameStore((s) => s.earnBadge);
  const addXp = useGameStore((s) => s.addXp);

  const badge = latestBadgeId
    ? BADGE_DEFINITIONS.find((b) => b.id === latestBadgeId)
    : null;

  if (!badge) return null;

  const handleDismiss = () => {
    addXp(badge.xpBonus);
    dismissAchievement();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti-style particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-5%',
            backgroundColor: ['#fbbf24', '#f97316', '#ef4444', '#22c55e', '#8b5cf6', '#06b6d4'][
              i % 6
            ],
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: 0,
            rotate: Math.random() * 720 - 360,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-transparent to-orange-100/50 pointer-events-none" />

        {/* Badge icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, delay: 0.4 }}
          className="relative"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-lg pulse-glow">
            <span className="text-5xl">{badge.icon}</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-slate-800">Badge Earned!</h3>
          <p className="text-amber-600 font-semibold text-lg">{badge.title}</p>
          <p className="text-sm text-slate-500 mt-1">{badge.description}</p>
        </motion.div>

        {/* XP reward */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-bold"
        >
          <Sparkles className="h-4 w-4" />
          +{badge.xpBonus} XP
        </motion.div>

        {/* Dismiss button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={handleDismiss}
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg mt-2"
          >
            🎉 Awesome!
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
