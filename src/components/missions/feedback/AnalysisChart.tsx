'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import type { FeedbackItem } from '@/lib/stores/types';

interface AnalysisChartProps {
  items: FeedbackItem[];
  categorized: Record<string, string>;
  correctCategories: Record<string, string>;
}

const CATEGORY_COLORS = [
  '#f59e0b', '#f97316', '#10b981', '#ef4444',
  '#22c55e', '#14b8a6', '#f43f5e', '#8b5cf6',
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#f59e0b',
};

/**
 * Wrapper that forces ResponsiveContainer to recalculate dimensions
 * after mount. Fixes the "blank chart until resize" bug.
 */
function ChartWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const initializedRef = useRef<boolean | null>(null);

  // Initialize once using the null-check pattern approved by React lint rules
  if (initializedRef.current === null) {
    initializedRef.current = true;
    // Schedule the resize event for after mount
    queueMicrotask(() => {
      setMounted(true);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  return (
    <div className="h-[250px] w-full">
      {mounted ? children : <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>}
    </div>
  );
}

export default function AnalysisChart({ items, categorized, correctCategories }: AnalysisChartProps) {
  // Category distribution chart data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const itemId of Object.keys(categorized)) {
      const cat = categorized[itemId];
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [categorized]);

  // Sentiment distribution
  const sentimentData = useMemo(() => {
    const counts: Record<string, number> = { positive: 0, negative: 0, neutral: 0 };
    for (const item of items) {
      counts[item.sentiment] = (counts[item.sentiment] ?? 0) + 1;
    }
    return [
      { name: 'Positive', count: counts.positive, fill: SENTIMENT_COLORS.positive },
      { name: 'Negative', count: counts.negative, fill: SENTIMENT_COLORS.negative },
      { name: 'Neutral', count: counts.neutral, fill: SENTIMENT_COLORS.neutral },
    ];
  }, [items]);

  // Accuracy comparison
  const accuracyData = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    const categories = new Set<string>();

    for (const itemId of Object.keys(categorized)) {
      categories.add(categorized[itemId]);
      if (correctCategories[itemId] === categorized[itemId]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const total = Object.keys(categorized).length;
    const uncategorized = items.length - total;

    return {
      correct,
      incorrect,
      uncategorized,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      categoriesUsed: categories.size,
    };
  }, [categorized, correctCategories, items.length]);

  // Per-category accuracy
  const categoryAccuracyData = useMemo(() => {
    const byCategory: Record<string, { correct: number; incorrect: number }> = {};

    for (const itemId of Object.keys(categorized)) {
      const playerCat = categorized[itemId];
      const correctCat = correctCategories[itemId];
      if (!byCategory[playerCat]) byCategory[playerCat] = { correct: 0, incorrect: 0 };
      if (playerCat === correctCat) {
        byCategory[playerCat].correct++;
      } else {
        byCategory[playerCat].incorrect++;
      }
    }

    return Object.entries(byCategory).map(([name, data]) => ({
      name,
      Correct: data.correct,
      Incorrect: data.incorrect,
    }));
  }, [categorized, correctCategories]);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Accuracy',
            value: `${accuracyData.accuracy}%`,
            icon: <TrendingUp className="h-4 w-4" />,
            color: accuracyData.accuracy >= 70 ? 'text-emerald-600' : accuracyData.accuracy >= 40 ? 'text-amber-600' : 'text-rose-600',
            bg: accuracyData.accuracy >= 70 ? 'bg-emerald-50' : accuracyData.accuracy >= 40 ? 'bg-amber-50' : 'bg-rose-50',
          },
          {
            label: 'Categorised',
            value: `${accuracyData.total}/${items.length}`,
            icon: <BarChart3 className="h-4 w-4" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Correct',
            value: accuracyData.correct,
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Incorrect',
            value: accuracyData.incorrect,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
              <CardContent className={`p-3 ${stat.bg} rounded-xl`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Category distribution */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </CardContent>
        </Card>

        {/* Sentiment distribution */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </CardContent>
        </Card>
      </div>

      {/* Correct vs Incorrect per category */}
      {categoryAccuracyData.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Accuracy by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAccuracyData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Correct" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey="Incorrect" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
