'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { BADGE_DEFINITIONS, MISSION_TYPES } from '@/lib/constants';
import type { MissionScore } from '@/lib/stores/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Target,
  MessageCircle,
  Shield,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: { key: keyof MissionScore; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'empathy', label: 'Empathy', icon: <MessageCircle className="h-4 w-4" />, color: 'text-amber-600' },
  { key: 'professionalism', label: 'Professionalism', icon: <Shield className="h-4 w-4" />, color: 'text-emerald-600' },
  { key: 'accuracy', label: 'Accuracy', icon: <Target className="h-4 w-4" />, color: 'text-orange-600' },
  { key: 'communication', label: 'Communication', icon: <MessageCircle className="h-4 w-4" />, color: 'text-rose-600' },
  { key: 'timeBonus', label: 'Time Bonus', icon: <Clock className="h-4 w-4" />, color: 'text-violet-600' },
];

function getScoreGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A+', color: 'text-emerald-500' };
  if (score >= 80) return { grade: 'A', color: 'text-emerald-500' };
  if (score >= 70) return { grade: 'B', color: 'text-amber-500' };
  if (score >= 60) return { grade: 'C', color: 'text-orange-500' };
  if (score >= 50) return { grade: 'D', color: 'text-orange-500' };
  return { grade: 'F', color: 'text-red-500' };
}

function getProgressColor(score: number): string {
  if (score >= 80) return '[&>div]:bg-emerald-500';
  if (score >= 60) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-orange-500';
}

export default function MissionSummary() {
  const missionScores = useGameStore((s) => s.missionScores);
  const currentMissionId = useGameStore((s) => s.currentMissionId);
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const earnedBadgeIds = useGameStore((s) => s.earnedBadgeIds);
  const setPhase = useGameStore((s) => s.setPhase);
  const startMission = useGameStore((s) => s.startMission);
  const resetMissionState = useGameStore((s) => s.resetMissionState);

  const latestScore = [...missionScores]
    .reverse()
    .find((s) => s.missionId === currentMissionId);
  const mission = MISSION_TYPES.find((m) => m.id === currentMissionType);

  if (!latestScore) return null;

  const { grade, color: gradeColor } = getScoreGrade(latestScore.totalScore);

  // Check for relevant badges earned recently
  const relevantBadges = BADGE_DEFINITIONS.filter((b) =>
    earnedBadgeIds.includes(b.id),
  ).slice(-3);

  const handleContinue = () => {
    resetMissionState();
    setPhase('dashboard');
  };

  const handleRetry = () => {
    if (currentMissionId && currentMissionType) {
      startMission(currentMissionId, currentMissionType);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
      >
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 text-white text-center">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-amber-200" />
            <h1 className="text-2xl font-bold">Mission Complete!</h1>
            {mission && (
              <p className="text-amber-100 text-sm mt-1">{mission.title}</p>
            )}
          </div>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'backOut' }}
              className={`text-7xl font-black ${gradeColor} mb-2`}
            >
              {grade}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-4xl font-bold text-slate-800">
                {latestScore.totalScore}
                <span className="text-lg text-slate-400">/100</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">Total Score</p>
            </motion.div>

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-5 py-2.5 rounded-full"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-bold text-lg">+{latestScore.xpEarned} XP</span>
              <span className="text-amber-500 text-sm">earned!</span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Score Breakdown
            </h2>
            {CATEGORIES.map((cat, i) => {
              const val = latestScore[cat.key] as number;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-1.5 font-medium ${cat.color}`}>
                      {cat.icon}
                      {cat.label}
                    </span>
                    <span className="font-bold text-slate-700">{val}</span>
                  </div>
                  <Progress value={val} className={`h-2 ${getProgressColor(val)}`} />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Client satisfaction */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              Client Satisfaction
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress
                  value={latestScore.empathy}
                  className={`h-3 ${getProgressColor(latestScore.empathy)}`}
                />
              </div>
              <span className="font-bold text-lg text-slate-700">{latestScore.empathy}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {latestScore.empathy >= 80
                ? 'The client was very satisfied with your approach!'
                : latestScore.empathy >= 60
                  ? 'The client felt heard, but there is room for improvement.'
                  : 'The client felt their needs were not fully addressed.'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges earned */}
      {relevantBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-amber-500" />
                Badges Earned
              </h2>
              <div className="flex flex-wrap gap-3">
                {relevantBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                  >
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1.5 text-sm gap-1.5">
                      <span>{badge.icon}</span>
                      {badge.title}
                      <span className="text-amber-500 text-xs">+{badge.xpBonus} XP</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
      >
        <Button
          size="lg"
          onClick={handleContinue}
          className="rounded-2xl px-8 py-5 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          Continue to Dashboard
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleRetry}
          className="rounded-2xl px-8 py-5 font-bold border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Retry Mission
        </Button>
      </motion.div>
    </div>
  );
}
