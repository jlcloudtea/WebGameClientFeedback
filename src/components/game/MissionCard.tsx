'use client';

import { motion } from 'framer-motion';
import type { MissionTypeDef } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, CheckCircle2, Star } from 'lucide-react';

interface MissionCardProps {
  mission: MissionTypeDef;
  isLocked: boolean;
  isCompleted: boolean;
  bestScore: number | null;
  index: number;
  onStart: (missionId: string) => void;
}

const difficultyStyles: Record<string, { bg: string; text: string; border: string }> = {
  beginner: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  intermediate: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  advanced: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const gradientBorders: Record<string, string> = {
  'survey-builder': 'from-emerald-300 via-emerald-400 to-teal-400',
  'customer-interview': 'from-amber-300 via-amber-400 to-orange-400',
  'feedback-analysis': 'from-violet-300 via-violet-400 to-purple-400',
  'difficult-client': 'from-rose-300 via-rose-400 to-red-400',
  'service-improvement': 'from-sky-300 via-sky-400 to-blue-400',
};

export default function MissionCard({
  mission,
  isLocked,
  isCompleted,
  bestScore,
  index,
  onStart,
}: MissionCardProps) {
  const diff = difficultyStyles[mission.difficulty];
  const gradientBorder = gradientBorders[mission.id] ?? 'from-slate-300 to-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={!isLocked ? { scale: 1.03, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={() => !isLocked && onStart(mission.id)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-shadow ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-xl'
      }`}
    >
      {/* Gradient border top */}
      <div className={`h-1.5 bg-gradient-to-r ${gradientBorder}`} />

      <div className="bg-white p-6 space-y-4 border border-slate-100 border-t-0 rounded-b-2xl">
        {/* Top row: Icon + difficulty */}
        <div className="flex items-start justify-between">
          <span className="text-4xl">{mission.icon}</span>
          <Badge
            variant="outline"
            className={`${diff.bg} ${diff.text} ${diff.border} text-[10px] font-semibold`}
          >
            {difficultyLabels[mission.difficulty]}
          </Badge>
        </div>

        {/* Title + description */}
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            {mission.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{mission.estimatedMinutes} min</span>
          <span className="mx-1">•</span>
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span>{mission.xpReward} XP</span>
        </div>

        {/* Completed status */}
        {isCompleted && bestScore !== null && (
          <div className="flex items-center gap-2 pt-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600">
              Best: {bestScore}%
            </span>
          </div>
        )}

        {/* Lock overlay */}
        {isLocked && (
          <div className="flex items-center gap-2 pt-1 text-slate-400">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-medium">
              Complete previous mission
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
