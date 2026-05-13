'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  BarChart3,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/stores/game-store';
import TeacherLogin from './TeacherLogin';
import RoomManager from './RoomManager';
import StudentProgress from './StudentProgress';
import ClassAnalytics from './ClassAnalytics';
import type { MissionType } from '@/lib/stores/types';

// ---- Types for dashboard data ----

interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  totalMissionsCompleted: number;
  completionRate: number;
  averageScore: number;
}

interface ManagedRoom {
  id: string;
  code: string;
  name: string;
  missionType: MissionType;
  status: string;
  playerCount: number;
  maxPlayers: number;
  currentMission?: string;
}

interface StudentData {
  id: string;
  nickname: string;
  avatar: string;
  missionsCompleted: number;
  totalScore: number;
  lastActive: string;
}

interface StudentScore {
  playerId: string;
  nickname: string;
  missionType: string;
  score: number;
}

export default function TeacherDashboard() {
  const setPhase = useGameStore((s) => s.setPhase);
  const [teacher, setTeacher] = useState<{ id: string; nickname: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<ManagedRoom[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [scores, setScores] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    if (!teacher) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/teacher/dashboard?teacherId=${teacher.id}&XTransformPort=3001`,
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setStats(data.stats);

      // Transform rooms
      const mappedRooms: ManagedRoom[] = (data.rooms || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        code: (r.code as string) || '------',
        name: (r.name as string) || 'Unnamed Room',
        missionType: 'survey-builder' as MissionType,
        status: (r.status as string) || 'LOBBY',
        playerCount: (r.playerCount as number) || 0,
        maxPlayers: 4,
        currentMission: Array.isArray(r.missions) && r.missions.length > 0
          ? (r.missions as Array<Record<string, string>>)[0].title
          : undefined,
      }));
      setRooms(mappedRooms);

      // Transform students from rooms
      const studentMap = new Map<string, StudentData>();
      const allScores: StudentScore[] = [];

      for (const room of data.rooms || []) {
        const roomData = room as Record<string, unknown>;
        const playerList = (roomData.players || []) as Array<Record<string, unknown>>;
        const missionList = (roomData.missions || []) as Array<Record<string, unknown>>;

        for (const p of playerList) {
          const pData = p as Record<string, unknown>;
          const playerInfo = (pData.player || {}) as Record<string, unknown>;
          const pId = (playerInfo.id || pData.playerId || '') as string;
          if (!pId || studentMap.has(pId)) continue;

          studentMap.set(pId, {
            id: pId,
            nickname: (playerInfo.nickname || 'Unknown') as string,
            avatar: (playerInfo.avatar || 'default') as string,
            missionsCompleted: 0,
            totalScore: 0,
            lastActive: (playerInfo.updatedAt || new Date().toISOString()) as string,
          });
        }

        for (const m of missionList) {
          const mData = m as Record<string, unknown>;
          const scoreList = (mData.scores || []) as Array<Record<string, unknown>>;
          for (const s of scoreList) {
            const sData = s as Record<string, unknown>;
            const sPlayerId = (sData.playerId || '') as string;
            const sPoints = (sData.points || 0) as number;
            const student = studentMap.get(sPlayerId);
            if (student) {
              student.missionsCompleted += 1;
              student.totalScore += sPoints;
            }
            allScores.push({
              playerId: sPlayerId,
              nickname: student?.nickname ?? 'Unknown',
              missionType: (mData.type || 'survey-builder') as string,
              score: sPoints,
            });
          }
        }
      }

      setStudents(Array.from(studentMap.values()));
      setScores(allScores);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [teacher]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle login
  const handleLogin = (t: { id: string; nickname: string }) => {
    setTeacher(t);
  };

  // Handle logout
  const handleLogout = () => {
    setTeacher(null);
    setStats(null);
    setRooms([]);
    setStudents([]);
    setScores([]);
  };

  // Create room handler
  const handleCreateRoom = (data: { name: string; missionType: MissionType; maxPlayers: number }) => {
    // For now, create a local room entry
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRooms((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        code,
        name: data.name,
        missionType: data.missionType,
        status: 'LOBBY',
        playerCount: 0,
        maxPlayers: data.maxPlayers,
      },
    ]);
  };

  // Delete room handler
  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  // Not logged in → show login
  if (!teacher) {
    return <TeacherLogin onLogin={handleLogin} />;
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome, {teacher.nickname}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-rose-500"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhase('login')}
            >
              Back to Game
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-1.5">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase">
                    Total Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-600">
                    {stats?.totalRooms ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase">
                    Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats?.totalStudents ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-violet-600">
                    {stats?.completionRate ?? 0}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-slate-500 uppercase">
                    Avg Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-rose-600">
                    {stats?.averageScore ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rooms
                      .filter((r) => r.status === 'ACTIVE' || r.status === 'LOBBY')
                      .slice(0, 5)
                      .map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium">{room.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {room.playerCount}/{room.maxPlayers}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                room.status === 'ACTIVE'
                                  ? 'border-emerald-400 text-emerald-600'
                                  : 'border-amber-400 text-amber-600'
                              }
                            >
                              {room.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {rooms.filter((r) => r.status === 'ACTIVE' || r.status === 'LOBBY').length === 0 && (
                      <p className="text-sm text-slate-400">No active rooms</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students
                      .sort((a, b) => b.totalScore - a.totalScore)
                      .slice(0, 5)
                      .map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}{' '}
                            {s.nickname}
                          </span>
                          <span className="text-amber-600 font-semibold">
                            {s.totalScore} pts
                          </span>
                        </div>
                      ))}
                    {students.length === 0 && (
                      <p className="text-sm text-slate-400">No students yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rooms tab */}
          <TabsContent value="rooms">
            <RoomManager
              rooms={rooms}
              onCreateRoom={handleCreateRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          </TabsContent>

          {/* Students tab */}
          <TabsContent value="students">
            <StudentProgress students={students} />
          </TabsContent>

          {/* Analytics tab */}
          <TabsContent value="analytics">
            <ClassAnalytics
              scores={scores}
              totalStudents={stats?.totalStudents ?? 0}
              completionRate={stats?.completionRate ?? 0}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
