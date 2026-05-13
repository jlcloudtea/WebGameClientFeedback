'use client';

import { useMemo } from 'react';
import { Download, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { MISSION_TYPES } from '@/lib/constants';

interface StudentScore {
  playerId: string;
  nickname: string;
  missionType: string;
  score: number;
}

interface ClassAnalyticsProps {
  scores: StudentScore[];
  totalStudents: number;
  completionRate: number;
}

const COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function ClassAnalytics({
  scores,
  totalStudents,
  completionRate,
}: ClassAnalyticsProps) {
  // Average score by mission type
  const avgByMission = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const s of scores) {
      if (!map[s.missionType]) map[s.missionType] = { total: 0, count: 0 };
      map[s.missionType].total += s.score;
      map[s.missionType].count += 1;
    }
    return Object.entries(map).map(([type, { total, count }]) => {
      const def = MISSION_TYPES.find((m) => m.id === type);
      return {
        name: def?.title ?? type,
        avgScore: count > 0 ? Math.round(total / count) : 0,
        count,
      };
    });
  }, [scores]);

  // Completion data for pie chart
  const completionData = useMemo(() => {
    const completed = scores.length;
    const remaining = Math.max(0, totalStudents * MISSION_TYPES.length - completed);
    return [
      { name: 'Completed', value: completed },
      { name: 'Remaining', value: remaining },
    ];
  }, [scores, totalStudents]);

  // Common suggestions based on scores
  const suggestions = useMemo(() => {
    const lowMissions = avgByMission.filter((m) => m.avgScore < 60);
    const tips: string[] = [];

    if (lowMissions.length > 0) {
      tips.push(
        `Students struggle with: ${lowMissions.map((m) => m.name).join(', ')}. Consider providing additional practice material.`,
      );
    }

    if (completionRate < 50) {
      tips.push('Completion rate is below 50%. Review mission difficulty and time allocation.');
    }

    const highScores = avgByMission.filter((m) => m.avgScore >= 80);
    if (highScores.length > 0) {
      tips.push(
        `Strong performance in: ${highScores.map((m) => m.name).join(', ')}. Consider advancing these topics.`,
      );
    }

    if (tips.length === 0) {
      tips.push('All students are performing well! Keep up the great work.');
    }

    return tips;
  }, [avgByMission, completionRate]);

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ scores, avgByMission, completionRate, totalStudents }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Class Analytics</h3>
        <Button variant="outline" size="sm" onClick={exportData}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {scores.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No score data available yet.</p>
        </div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bar chart: Average scores by mission */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Average Scores by Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={avgByMission}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                      {avgByMission.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie chart: Completion rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-emerald-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                💡 Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-amber-500 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
