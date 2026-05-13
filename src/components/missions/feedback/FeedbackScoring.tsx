'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Target,
  MessageSquare,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Home,
  RotateCcw,
  Star,
} from 'lucide-react';
import { scoreFeedbackAnalysis, createMissionScore } from '@/lib/scoring';
import type { FeedbackItem } from '@/lib/stores/types';

interface FeedbackScoringProps {
  items: FeedbackItem[];
  categorized: Record<string, string>;
  correctCategories: Record<string, string>;
  analysisNotes: string;
  onReset: () => void;
  onDashboard: () => void;
}

function ScoreBar({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600">
          {icon}
          {label}
        </span>
        <span className={`font-bold ${value >= 70 ? 'text-emerald-600' : value >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function FeedbackScoring({
  items,
  categorized,
  correctCategories,
  analysisNotes,
  onReset,
  onDashboard,
}: FeedbackScoringProps) {
  const scoreResult = scoreFeedbackAnalysis({
    items,
    categorized,
    correctCategories,
    analysisNotes,
    timeRemaining: 600,
    totalTime: 1080,
  });

  const totalScore = Math.min(100, Math.max(0, scoreResult.totalScore));
  const xpEarned = scoreResult.xpEarned;

  // Compute accuracy details
  let correctCount = 0;
  let incorrectCount = 0;
  const mistakes: { item: string; playerCategory: string; correctCategory: string }[] = [];

  for (const itemId of Object.keys(categorized)) {
    if (categorized[itemId] === correctCategories[itemId]) {
      correctCount++;
    } else {
      incorrectCount++;
      const item = items.find((i) => i.id === itemId);
      mistakes.push({
        item: item?.text ?? itemId,
        playerCategory: categorized[itemId],
        correctCategory: correctCategories[itemId] ?? 'Unknown',
      });
    }
  }

  const coveragePercent = items.length > 0 ? Math.round((Object.keys(categorized).length / items.length) * 100) : 0;
  const accuracyPercent = Object.keys(categorized).length > 0 ? Math.round((correctCount / Object.keys(categorized).length) * 100) : 0;

  const getGradeEmoji = () => {
    if (totalScore >= 90) return '🏆';
    if (totalScore >= 75) return '🌟';
    if (totalScore >= 60) return '👍';
    if (totalScore >= 40) return '📝';
    return '💪';
  };

  const getGradeLabel = () => {
    if (totalScore >= 90) return 'Outstanding';
    if (totalScore >= 75) return 'Great Job';
    if (totalScore >= 60) return 'Good Effort';
    if (totalScore >= 40) return 'Keep Practising';
    return 'Room for Growth';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-center"
      >
        <span className="text-6xl block mb-3">{getGradeEmoji()}</span>
        <h2 className="text-3xl font-bold text-slate-800">{getGradeLabel()}</h2>
        <p className="text-slate-500 mt-1">Feedback Analysis Mission Complete</p>
      </motion.div>

      {/* Score circle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={totalScore >= 70 ? '#10b981' : totalScore >= 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - totalScore / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">{totalScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
      </motion.div>

      {/* XP earned */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 px-4 py-1.5 text-sm">
          <Star className="h-3.5 w-3.5 mr-1.5" />
          +{xpEarned} XP Earned
        </Badge>
      </motion.div>

      {/* Score breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-amber-500" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreBar
              label="Accuracy"
              value={scoreResult.accuracy}
              icon={<Target className="h-4 w-4 text-amber-500" />}
              color="bg-amber-400"
            />
            <ScoreBar
              label="Coverage"
              value={scoreResult.empathy}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              color="bg-emerald-400"
            />
            <ScoreBar
              label="Analysis Quality"
              value={scoreResult.communication}
              icon={<MessageSquare className="h-4 w-4 text-violet-500" />}
              color="bg-violet-400"
            />
            <ScoreBar
              label="Professionalism"
              value={scoreResult.professionalism}
              icon={<Award className="h-4 w-4 text-orange-500" />}
              color="bg-orange-400"
            />
            <ScoreBar
              label="Time Bonus"
              value={scoreResult.timeBonus}
              icon={<Clock className="h-4 w-4 text-teal-500" />}
              color="bg-teal-400"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Accuracy details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-500" />
              Accuracy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 rounded-xl p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700">{correctCount}</p>
                <p className="text-[10px] text-emerald-600">Correct</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <XCircle className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-rose-700">{incorrectCount}</p>
                <p className="text-[10px] text-rose-600">Incorrect</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <Target className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-700">{accuracyPercent}%</p>
                <p className="text-[10px] text-amber-600">Accuracy</p>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-slate-600">Mistakes:</p>
                <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                  {mistakes.map((m, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-2.5 text-xs">
                      <p className="text-slate-700 line-clamp-1">&ldquo;{m.item}&rdquo;</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-rose-600">Your choice: {m.playerCategory}</span>
                        <span className="text-slate-400">&rarr;</span>
                        <span className="text-emerald-600">Correct: {m.correctCategory}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <Separator />
      <div className="flex items-center justify-between pb-4">
        <Button variant="outline" onClick={onReset} className="rounded-xl">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={onDashboard}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
