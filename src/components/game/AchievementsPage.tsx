'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { BADGE_DEFINITIONS, MISSION_TYPES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Star,
  Target,
  Award,
  Zap,
} from 'lucide-react';

export default function AchievementsPage() {
  const earnedBadgeIds = useGameStore((s) => s.earnedBadgeIds);
  const missionScores = useGameStore((s) => s.missionScores);
  const completedMissionIds = useGameStore((s) => s.completedMissionIds);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const setPhase = useGameStore((s) => s.setPhase);

  const totalBadges = BADGE_DEFINITIONS.length;
  const earnedCount = earnedBadgeIds.length;
  const progressPercent = Math.round((earnedCount / totalBadges) * 100);

  // XP from badges
  const badgeXpEarned = BADGE_DEFINITIONS
    .filter((b) => earnedBadgeIds.includes(b.id))
    .reduce((sum, b) => sum + b.xpBonus, 0);

  // Mission completion stats
  const completedTypes = new Set(missionScores.map((s) => s.missionType));
  const avgScore = missionScores.length > 0
    ? Math.round(missionScores.reduce((sum, s) => sum + s.totalScore, 0) / missionScores.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPhase('dashboard')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Achievements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your badges and milestones
          </p>
        </div>
      </motion.div>

      {/* Progress overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium text-amber-100">Badge Progress</p>
                <p className="text-3xl font-bold">{earnedCount}/{totalBadges}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-amber-100">Badge XP</p>
                <p className="text-2xl font-bold">+{badgeXpEarned}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Progress value={progressPercent} className="flex-1 h-3" />
              <span className="text-sm font-bold text-amber-600">{progressPercent}%</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Level', value: level, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total XP', value: xp, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Missions', value: completedMissionIds.length, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
              <CardContent className={`p-3 ${stat.bg} rounded-xl text-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Badge grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-amber-500" />
              All Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {BADGE_DEFINITIONS.map((badge, index) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.04 }}
                  >
                    <div
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                        isEarned
                          ? 'border-amber-200 bg-amber-50/50 shadow-sm'
                          : 'border-slate-100 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isEarned
                            ? 'bg-gradient-to-br from-amber-300 to-orange-400 shadow-md'
                            : 'bg-slate-200'
                        }`}
                      >
                        {isEarned ? (
                          <span className="text-2xl">{badge.icon}</span>
                        ) : (
                          <Lock className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{badge.title}</h4>
                          {isEarned && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="secondary"
                            className={`text-[9px] ${
                              isEarned
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {badge.condition}
                          </Badge>
                          <span className="text-[10px] text-amber-600 font-semibold">
                            +{badge.xpBonus} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mission completion tracker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-500" />
              Mission Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MISSION_TYPES.map((mission) => {
                const isCompleted = completedMissionIds.includes(mission.id);
                const bestScore = missionScores
                  .filter((s) => s.missionId === mission.id)
                  .sort((a, b) => b.totalScore - a.totalScore)[0];
                return (
                  <div
                    key={mission.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isCompleted ? 'bg-emerald-50' : 'bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{mission.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{mission.title}</p>
                      <p className="text-xs text-slate-500">{mission.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                          <p className="text-xs font-bold text-emerald-600 mt-0.5">
                            {bestScore ? Math.round(bestScore.totalScore) : 0}%
                          </p>
                        </>
                      ) : (
                        <Lock className="h-5 w-5 text-slate-300 mx-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
