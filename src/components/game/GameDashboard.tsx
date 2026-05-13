'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { MISSION_TYPES, BADGE_DEFINITIONS, getLevelTitle } from '@/lib/constants';
import type { MissionType } from '@/lib/stores/types';
import MissionCard from './MissionCard';
import AchievementPopup from './AchievementPopup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Star,
  Award,
  BarChart3,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function GameDashboard() {
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const completedMissionIds = useGameStore((s) => s.completedMissionIds);
  const missionScores = useGameStore((s) => s.missionScores);
  const earnedBadgeIds = useGameStore((s) => s.earnedBadgeIds);
  const startMission = useGameStore((s) => s.startMission);
  const setPhase = useGameStore((s) => s.setPhase);
  const showAchievement = useGameStore((s) => s.showAchievement);

  const levelTitle = getLevelTitle(level);
  const totalPoints = missionScores.reduce((sum, s) => sum + s.xpEarned, 0);

  const handleStartMission = (missionId: string) => {
    startMission(missionId, missionId as MissionType);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Achievement popup */}
      {showAchievement && <AchievementPopup />}

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Player info card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-center">
                <span className="text-5xl block mb-2">{avatar || '🧑‍💻'}</span>
                <h3 className="text-lg font-bold text-white">{nickname || 'Player'}</h3>
                <p className="text-amber-100 text-sm">{levelTitle}</p>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Level</span>
                  <span className="font-bold text-amber-600">{level}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total XP</span>
                  <span className="font-bold text-orange-600">{xp}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Points</span>
                  <span className="font-bold text-emerald-600">{totalPoints}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Quick Stats
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <Target className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-emerald-700">
                      {completedMissionIds.length}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Missions
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-amber-700">{xp}</p>
                    <p className="text-[10px] text-amber-600 font-medium">XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500" />
                    Badges
                  </h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {earnedBadgeIds.length}/{BADGE_DEFINITIONS.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_DEFINITIONS.slice(0, 10).map((badge) => {
                    const earned = earnedBadgeIds.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                          earned
                            ? 'bg-amber-50 shadow-sm'
                            : 'bg-slate-50 opacity-40'
                        }`}
                        title={badge.title}
                      >
                        {earned ? badge.icon : <Lock className="h-3.5 w-3.5 text-slate-400" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full rounded-xl justify-between text-sm"
              onClick={() => setPhase('achievements')}
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Achievements
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl justify-between text-sm"
              onClick={() => setPhase('leaderboard')}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Leaderboard
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Main content — Mission grid */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-800">
              Choose Your Mission
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Complete missions to earn XP, unlock badges, and level up your consulting skills.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {MISSION_TYPES.map((mission, index) => {
              const isCompleted = completedMissionIds.includes(mission.id);
              const bestScoreEntry = missionScores
                .filter((s) => s.missionId === mission.id)
                .sort((a, b) => b.totalScore - a.totalScore)[0];
              const bestScore = bestScoreEntry
                ? Math.round(bestScoreEntry.totalScore)
                : null;

              // Lock logic: missions are unlocked sequentially
              const missionIndex = index;
              const isLocked =
                missionIndex > 0 &&
                !completedMissionIds.includes(MISSION_TYPES[missionIndex - 1].id) &&
                !isCompleted;

              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isLocked={isLocked}
                  isCompleted={isCompleted}
                  bestScore={bestScore}
                  index={index}
                  onStart={handleStartMission}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
