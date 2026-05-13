'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Star,
  Zap,
  Target,
} from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/stores/types';
import { getLevelTitle } from '@/lib/constants';

// --- Local leaderboard data for solo mode (from localStorage) ---
interface LocalLeaderboardEntry {
  rank: number;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  missionsCompleted: number;
  averageScore: number;
}

export default function LeaderboardPage() {
  const setPhase = useGameStore((s) => s.setPhase);
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const missionScores = useGameStore((s) => s.missionScores);
  const completedMissionIds = useGameStore((s) => s.completedMissionIds);

  const [serverEntries, setServerEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leaderboard from API
  useEffect(() => {
    fetch('/api/scores/leaderboard?XTransformPort=3000')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setServerEntries(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build current player entry
  const avgScore = missionScores.length > 0
    ? Math.round(missionScores.reduce((sum, s) => sum + s.totalScore, 0) / missionScores.length)
    : 0;

  const currentPlayer: LocalLeaderboardEntry = {
    rank: 0,
    nickname: nickname || 'Player',
    avatar: avatar || '🧑‍💻',
    xp,
    level,
    missionsCompleted: completedMissionIds.length,
    averageScore: avgScore,
  };

  // Merge server entries with current player
  const allEntries: LocalLeaderboardEntry[] = [
    ...serverEntries.map((e) => ({
      rank: e.rank,
      nickname: e.nickname,
      avatar: e.avatar,
      xp: e.xp,
      level: e.level,
      missionsCompleted: e.missionsCompleted,
      averageScore: Math.round(e.averageScore),
    })),
    currentPlayer,
  ]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  // Find current player rank
  const myRank = allEntries.find((e) => e.nickname === nickname)?.rank ?? allEntries.length;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-bold text-slate-400 w-5 text-center block">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
    return 'bg-white border-slate-100';
  };

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
            Leaderboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            See how you rank against other consultants
          </p>
        </div>
      </motion.div>

      {/* Your rank card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl">{currentPlayer.avatar}</span>
              </div>
              <div className="flex-1 text-white">
                <p className="text-sm font-medium text-amber-100">Your Rank</p>
                <p className="text-4xl font-bold">#{myRank}</p>
                <p className="text-sm text-amber-100 mt-0.5">
                  {currentPlayer.nickname} · {getLevelTitle(currentPlayer.level)}
                </p>
              </div>
              <div className="text-right text-white">
                <p className="text-2xl font-bold">{currentPlayer.xp}</p>
                <p className="text-xs text-amber-100">Total XP</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Star className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-700">Lv.{currentPlayer.level}</p>
                <p className="text-[10px] text-slate-500">Level</p>
              </div>
              <div>
                <Target className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-700">{currentPlayer.missionsCompleted}</p>
                <p className="text-[10px] text-slate-500">Missions</p>
              </div>
              <div>
                <TrendingUp className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-violet-700">{currentPlayer.averageScore}%</p>
                <p className="text-[10px] text-slate-500">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-emerald-500" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allEntries.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No players yet. Complete a mission to get on the board!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {allEntries.map((entry, index) => {
                  const isMe = entry.nickname === nickname;
                  return (
                    <motion.div
                      key={`${entry.nickname}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.03 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isMe
                          ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                          : getRankBg(entry.rank)
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 shrink-0 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        entry.rank <= 3 ? 'bg-gradient-to-br from-amber-200 to-orange-300' : 'bg-slate-100'
                      }`}>
                        <span className="text-xl">{entry.avatar}</span>
                      </div>

                      {/* Name & level */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {entry.nickname}
                          </p>
                          {isMe && (
                            <Badge className="text-[9px] bg-amber-100 text-amber-700 shrink-0">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {getLevelTitle(entry.level)} · {entry.missionsCompleted} missions · {entry.averageScore}% avg
                        </p>
                      </div>

                      {/* XP */}
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <p className="text-sm font-bold text-amber-700">{entry.xp}</p>
                        </div>
                        <p className="text-[10px] text-slate-400">XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="rounded-2xl border-0 shadow-sm bg-slate-50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-500">
              Leaderboard is updated after each mission. Complete more missions and score higher to climb the ranks!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
