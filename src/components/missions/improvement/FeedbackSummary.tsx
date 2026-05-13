'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageSquare,
} from 'lucide-react';
import type { FeedbackItem } from '@/lib/stores/types';

// --- Default feedback data (auto-generated from scenario) ---
const DEFAULT_FEEDBACK: FeedbackItem[] = [
  { id: 'fb-1', text: 'The support team was very friendly and helpful when I called about my email setup issue.', source: 'Survey Response #12', sentiment: 'positive', priority: 'low', category: 'Service Quality' },
  { id: 'fb-2', text: 'It took 3 days to get a response to my urgent ticket about the server being down. Unacceptable.', source: 'Interview #3', sentiment: 'negative', priority: 'high', category: 'Response Time' },
  { id: 'fb-3', text: 'The technician used too much jargon and I couldn\'t understand the explanation of the network issue.', source: 'Survey Response #8', sentiment: 'negative', priority: 'medium', category: 'Communication' },
  { id: 'fb-4', text: 'Staff resolved my printer configuration problem quickly and showed me how to prevent it happening again.', source: 'AI-generated', sentiment: 'positive', priority: 'low', category: 'Technical Competence' },
  { id: 'fb-5', text: 'The hourly rate for on-site support is much higher than competitors. We need better pricing options.', source: 'Interview #5', sentiment: 'negative', priority: 'high', category: 'Pricing' },
  { id: 'fb-6', text: 'The online help portal is not screen-reader compatible. Our visually impaired staff cannot use it.', source: 'Survey Response #15', sentiment: 'negative', priority: 'high', category: 'Accessibility' },
  { id: 'fb-7', text: 'System uptime has been excellent this quarter. Only one minor outage in the past 3 months.', source: 'AI-generated', sentiment: 'positive', priority: 'low', category: 'Reliability' },
  { id: 'fb-8', text: 'New staff need more training on the ticketing system. Too many tickets are misrouted.', source: 'Interview #2', sentiment: 'negative', priority: 'medium', category: 'Training Needs' },
  { id: 'fb-9', text: 'I appreciate how the support team follows up after resolving issues to check everything is working.', source: 'Survey Response #20', sentiment: 'positive', priority: 'low', category: 'Service Quality' },
  { id: 'fb-10', text: 'Average response time for priority tickets has increased from 2 hours to 8 hours over the last month.', source: 'AI-generated', sentiment: 'negative', priority: 'high', category: 'Response Time' },
  { id: 'fb-11', text: 'Email updates about ticket progress are inconsistent. Sometimes I get notified, sometimes I don\'t.', source: 'Survey Response #7', sentiment: 'neutral', priority: 'medium', category: 'Communication' },
  { id: 'fb-12', text: 'The technician didn\'t seem familiar with our cloud backup system and had to escalate twice.', source: 'Interview #6', sentiment: 'negative', priority: 'medium', category: 'Technical Competence' },
  { id: 'fb-13', text: 'The basic support package is good value, but premium tier pricing seems disproportionate to the added features.', source: 'Survey Response #18', sentiment: 'neutral', priority: 'medium', category: 'Pricing' },
  { id: 'fb-14', text: 'Remote support options are limited. We need better phone and video call support for off-site staff.', source: 'Interview #4', sentiment: 'negative', priority: 'high', category: 'Accessibility' },
  { id: 'fb-15', text: 'The VPN connection drops regularly during peak hours, disrupting our entire remote workforce.', source: 'Survey Response #3', sentiment: 'negative', priority: 'high', category: 'Reliability' },
  { id: 'fb-16', text: 'Could we have workshops on cybersecurity best practices? Our team needs to stay updated.', source: 'AI-generated', sentiment: 'neutral', priority: 'medium', category: 'Training Needs' },
];

interface FeedbackSummaryProps {
  items?: FeedbackItem[];
}

export default function FeedbackSummary({ items = DEFAULT_FEEDBACK }: FeedbackSummaryProps) {
  // Statistics
  const stats = useMemo(() => {
    const positive = items.filter((i) => i.sentiment === 'positive').length;
    const negative = items.filter((i) => i.sentiment === 'negative').length;
    const neutral = items.filter((i) => i.sentiment === 'neutral').length;
    const total = items.length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const item of items) {
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] ?? 0) + 1;
      }
    }

    // Most common issues (negative items by category)
    const negativeByCategory: Record<string, number> = {};
    for (const item of items.filter((i) => i.sentiment === 'negative')) {
      if (item.category) {
        negativeByCategory[item.category] = (negativeByCategory[item.category] ?? 0) + 1;
      }
    }

    return {
      positive,
      negative,
      neutral,
      total,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
      neutralPercent: total > 0 ? Math.round((neutral / total) * 100) : 0,
      categoryCounts,
      negativeByCategory,
    };
  }, [items]);

  // Chart data
  const sentimentChartData = useMemo(
    () => [
      { name: 'Positive', count: stats.positive, fill: '#10b981' },
      { name: 'Negative', count: stats.negative, fill: '#ef4444' },
      { name: 'Neutral', count: stats.neutral, fill: '#f59e0b' },
    ],
    [stats],
  );

  const categoryChartData = useMemo(
    () =>
      Object.entries(stats.categoryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    [stats.categoryCounts],
  );

  // Key themes
  const topIssues = useMemo(
    () =>
      Object.entries(stats.negativeByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    [stats.negativeByCategory],
  );

  const CATEGORY_COLORS = [
    '#f59e0b', '#f97316', '#10b981', '#ef4444',
    '#22c55e', '#14b8a6', '#f43f5e', '#8b5cf6',
  ];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
            <CardContent className="p-3 bg-emerald-50 rounded-xl">
              <ThumbsUp className="h-4 w-4 text-emerald-500 mb-1" />
              <p className="text-xl font-bold text-emerald-700">{stats.positivePercent}%</p>
              <p className="text-[10px] text-emerald-600">Positive</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
            <CardContent className="p-3 bg-rose-50 rounded-xl">
              <ThumbsDown className="h-4 w-4 text-rose-500 mb-1" />
              <p className="text-xl font-bold text-rose-700">{stats.negativePercent}%</p>
              <p className="text-[10px] text-rose-600">Negative</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
            <CardContent className="p-3 bg-amber-50 rounded-xl">
              <Minus className="h-4 w-4 text-amber-500 mb-1" />
              <p className="text-xl font-bold text-amber-700">{stats.neutralPercent}%</p>
              <p className="text-[10px] text-amber-600">Neutral</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="rounded-xl border-0 shadow-sm py-0 gap-0">
            <CardContent className="p-3 bg-slate-50 rounded-xl">
              <MessageSquare className="h-4 w-4 text-slate-500 mb-1" />
              <p className="text-xl font-bold text-slate-700">{stats.total}</p>
              <p className="text-[10px] text-slate-600">Total Items</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sentiment chart */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category chart */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              Issues by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key themes */}
      {topIssues.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              Top Issues (Negative Feedback)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topIssues.map(([category, count], index) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 w-32 shrink-0">{category}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-rose-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.total) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {count} item{count > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
