'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ClientEmotion } from '@/lib/stores/types';

// --- Emotion config ---
const EMOTION_CONFIG: Record<ClientEmotion, { emoji: string; label: string; bg: string; ring: string; glow: string }> = {
  angry: { emoji: '😡', label: 'Angry', bg: 'bg-rose-100', ring: 'ring-rose-300', glow: 'shadow-rose-200' },
  frustrated: { emoji: '😤', label: 'Frustrated', bg: 'bg-orange-100', ring: 'ring-orange-300', glow: 'shadow-orange-200' },
  confused: { emoji: '😕', label: 'Confused', bg: 'bg-amber-100', ring: 'ring-amber-300', glow: 'shadow-amber-200' },
  neutral: { emoji: '😐', label: 'Neutral', bg: 'bg-slate-100', ring: 'ring-slate-300', glow: 'shadow-slate-200' },
  happy: { emoji: '😊', label: 'Happy', bg: 'bg-lime-100', ring: 'ring-lime-300', glow: 'shadow-lime-200' },
  relieved: { emoji: '😮‍💨', label: 'Relieved', bg: 'bg-teal-100', ring: 'ring-teal-300', glow: 'shadow-teal-200' },
  satisfied: { emoji: '😊', label: 'Satisfied', bg: 'bg-emerald-100', ring: 'ring-emerald-300', glow: 'shadow-emerald-200' },
};

interface EmotionDisplayProps {
  emotion: ClientEmotion;
  intensity: number; // 0-100
  name: string;
}

export default function EmotionDisplay({ emotion, intensity, name }: EmotionDisplayProps) {
  const config = EMOTION_CONFIG[emotion] ?? EMOTION_CONFIG.neutral;

  // Intensity affects size and animation speed
  const scale = 0.9 + (intensity / 100) * 0.3;
  const pulseSpeed = intensity > 70 ? 0.8 : intensity > 40 ? 1.5 : 3;

  return (
    <div className="text-center space-y-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${config.bg} ring-4 ${config.ring} shadow-lg ${config.glow}`}
        >
          <motion.span
            className="text-5xl"
            style={{ fontSize: `${2.5 * scale}rem` }}
            animate={{
              scale: [1, 1.05 * scale, 1],
            }}
            transition={{
              duration: pulseSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {config.emoji}
          </motion.span>
        </motion.div>
      </AnimatePresence>

      <div>
        <p className="text-sm font-semibold text-slate-700">{name}</p>
        <p className={`text-xs font-medium ${config.ring.replace('ring-', 'text-')}`}>
          {config.label}
        </p>
      </div>

      {/* Intensity bar */}
      <div className="w-full max-w-[120px] mx-auto">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
          <span>Calm</span>
          <span>Intense</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              intensity > 70 ? 'bg-rose-400' : intensity > 40 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${intensity}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
