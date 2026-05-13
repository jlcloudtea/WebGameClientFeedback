'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Send,
  RotateCcw,
  GripVertical,
  Tag,
} from 'lucide-react';
import { useFeedbackStore } from '@/lib/stores/feedback-store';
import { useGameStore } from '@/lib/stores/game-store';
import { CORRECT_CATEGORIES } from './FeedbackCard';
import { CATEGORY_DEFINITIONS } from './CategoryBucket';
import AnalysisChart from './AnalysisChart';
import FeedbackScoring from './FeedbackScoring';
import type { FeedbackItem } from '@/lib/stores/types';
import { scoreFeedbackAnalysis, createMissionScore } from '@/lib/scoring';

// --- Pre-defined feedback data for the mission ---
const SCENARIO_FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: 'fb-1',
    text: 'The support team was very friendly and helpful when I called about my email setup issue.',
    source: 'Survey Response #12',
    sentiment: 'positive',
    priority: 'low',
  },
  {
    id: 'fb-2',
    text: 'It took 3 days to get a response to my urgent ticket about the server being down. Unacceptable.',
    source: 'Interview #3',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-3',
    text: "The technician used too much jargon and I couldn't understand the explanation of the network issue.",
    source: 'Survey Response #8',
    sentiment: 'negative',
    priority: 'medium',
  },
  {
    id: 'fb-4',
    text: 'Staff resolved my printer configuration problem quickly and showed me how to prevent it happening again.',
    source: 'AI-generated',
    sentiment: 'positive',
    priority: 'low',
  },
  {
    id: 'fb-5',
    text: 'The hourly rate for on-site support is much higher than competitors. We need better pricing options.',
    source: 'Interview #5',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-6',
    text: 'The online help portal is not screen-reader compatible. Our visually impaired staff cannot use it.',
    source: 'Survey Response #15',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-7',
    text: 'System uptime has been excellent this quarter. Only one minor outage in the past 3 months.',
    source: 'AI-generated',
    sentiment: 'positive',
    priority: 'low',
  },
  {
    id: 'fb-8',
    text: 'New staff need more training on the ticketing system. Too many tickets are misrouted.',
    source: 'Interview #2',
    sentiment: 'negative',
    priority: 'medium',
  },
  {
    id: 'fb-9',
    text: 'I appreciate how the support team follows up after resolving issues to check everything is working.',
    source: 'Survey Response #20',
    sentiment: 'positive',
    priority: 'low',
  },
  {
    id: 'fb-10',
    text: 'Average response time for priority tickets has increased from 2 hours to 8 hours over the last month.',
    source: 'AI-generated',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-11',
    text: "Email updates about ticket progress are inconsistent. Sometimes I get notified, sometimes I don't.",
    source: 'Survey Response #7',
    sentiment: 'neutral',
    priority: 'medium',
  },
  {
    id: 'fb-12',
    text: "The technician didn't seem familiar with our cloud backup system and had to escalate twice.",
    source: 'Interview #6',
    sentiment: 'negative',
    priority: 'medium',
  },
  {
    id: 'fb-13',
    text: 'The basic support package is good value, but premium tier pricing seems disproportionate to the added features.',
    source: 'Survey Response #18',
    sentiment: 'neutral',
    priority: 'medium',
  },
  {
    id: 'fb-14',
    text: 'Remote support options are limited. We need better phone and video call support for off-site staff.',
    source: 'Interview #4',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-15',
    text: 'The VPN connection drops regularly during peak hours, disrupting our entire remote workforce.',
    source: 'Survey Response #3',
    sentiment: 'negative',
    priority: 'high',
  },
  {
    id: 'fb-16',
    text: 'Could we have workshops on cybersecurity best practices? Our team needs to stay updated.',
    source: 'AI-generated',
    sentiment: 'neutral',
    priority: 'medium',
  },
];

// --- Sentiment config ---
const SENTIMENT_CONFIG = {
  positive: { color: 'bg-emerald-400', label: 'Positive', textColor: 'text-emerald-700' },
  negative: { color: 'bg-rose-400', label: 'Negative', textColor: 'text-rose-700' },
  neutral: { color: 'bg-amber-400', label: 'Neutral', textColor: 'text-amber-700' },
} as const;

const SOURCE_COLORS: Record<string, string> = {
  survey: 'bg-sky-100 text-sky-700',
  interview: 'bg-violet-100 text-violet-700',
  'ai-generated': 'bg-orange-100 text-orange-700',
};

type ViewMode = 'categorize' | 'analysis' | 'scoring';

export default function FeedbackDashboard() {
  const items = useFeedbackStore((s) => s.items);
  const categories = useFeedbackStore((s) => s.categories);
  const categorized = useFeedbackStore((s) => s.categorized);
  const analysisNotes = useFeedbackStore((s) => s.analysisNotes);
  const setItems = useFeedbackStore((s) => s.setItems);
  const setCategories = useFeedbackStore((s) => s.setCategories);
  const categorizeItem = useFeedbackStore((s) => s.categorizeItem);
  const uncategorizeItem = useFeedbackStore((s) => s.uncategorizeItem);
  const setAnalysisNotes = useFeedbackStore((s) => s.setAnalysisNotes);
  const resetFeedback = useFeedbackStore((s) => s.resetFeedback);
  const completeMission = useGameStore((s) => s.completeMission);
  const setMissionPhase = useGameStore((s) => s.setMissionPhase);

  const [view, setView] = useState<ViewMode>('categorize');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Load feedback items on mount
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setItems(SCENARIO_FEEDBACK_ITEMS);
      setCategories(CATEGORY_DEFINITIONS.map((c) => c.name));
    }
  }, [setItems, setCategories]);

  // Compute categorized/uncategorized items
  const uncategorizedItems = items.filter((item) => !categorized[item.id]);
  const allCategorized = items.length > 0 && uncategorizedItems.length === 0;

  // Group categorized items by category
  const itemsByCategory: Record<string, FeedbackItem[]> = {};
  for (const cat of categories) {
    itemsByCategory[cat] = [];
  }
  for (const item of items) {
    const cat = categorized[item.id];
    if (cat && itemsByCategory[cat]) {
      itemsByCategory[cat].push(item);
    }
  }

  const handleAssignCategory = useCallback(
    (itemId: string, category: string) => {
      if (category === '__none__') {
        uncategorizeItem(itemId);
      } else {
        categorizeItem(itemId, category);
      }
      setSelectedItemId(null);
    },
    [categorizeItem, uncategorizeItem],
  );

  const handleSubmitAnalysis = () => {
    setView('analysis');
  };

  const handleSubmitPlan = () => {
    setView('scoring');
    const score = scoreFeedbackAnalysis({
      items,
      categorized,
      correctCategories: CORRECT_CATEGORIES,
      analysisNotes,
      timeRemaining: 600,
      totalTime: 1080,
    });
    const missionScore = createMissionScore('feedback-analysis', 'feedback-analysis', score);
    completeMission(missionScore);
  };

  const handleReset = () => {
    resetFeedback();
    setView('categorize');
  };

  // --- SCORING VIEW ---
  if (view === 'scoring') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <FeedbackScoring
          items={items}
          categorized={categorized}
          correctCategories={CORRECT_CATEGORIES}
          analysisNotes={analysisNotes}
          onReset={handleReset}
          onDashboard={() => {
            setMissionPhase('scoring');
            useGameStore.getState().setPhase('dashboard');
            useGameStore.getState().resetMissionState();
          }}
        />
      </div>
    );
  }

  // --- ANALYSIS VIEW ---
  if (view === 'analysis') {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-500" />
            Analysis Results
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review your categorisation and add insights before submitting
          </p>
        </motion.div>

        <AnalysisChart
          items={items}
          categorized={categorized}
          correctCategories={CORRECT_CATEGORIES}
        />

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Analysis Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              placeholder="Write your key insights about the feedback patterns you've identified. What are the main themes? What actions would you recommend?"
              className="min-h-[120px] rounded-xl"
            />
            <p className="text-xs text-slate-400 mt-2">
              Detailed analysis notes improve your communication score. Aim for at least 150 characters.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setView('categorize')}
            className="rounded-xl"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Back to Categorise
          </Button>
          <Button
            onClick={handleSubmitPlan}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Plan
          </Button>
        </div>
      </div>
    );
  }

  // --- CATEGORIZE VIEW (default) ---
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ClipboardList className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-slate-800">Feedback Analysis Mission</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Read each feedback item and assign it to the correct category using the dropdown.
                  Click on any card to see the full text. All items must be categorised before you can submit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${items.length > 0 ? (Object.keys(categorized).length / items.length) * 100 : 0}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {Object.keys(categorized).length}/{items.length}
        </Badge>
      </div>

      {/* Two-column layout: Feedback items + Category buckets */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        {/* Left: Feedback items to categorize */}
        <div>
          <Card className="rounded-2xl border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Feedback Items
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {uncategorizedItems.length} uncategorised
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-340px)] max-h-[600px]">
                <div className="space-y-2 pr-2">
                  <AnimatePresence>
                    {items.map((item) => {
                      const sentiment = SENTIMENT_CONFIG[item.sentiment];
                      const sourceKey = item.source.toLowerCase().includes('survey')
                        ? 'survey'
                        : item.source.toLowerCase().includes('interview')
                          ? 'interview'
                          : 'ai-generated';
                      const sourceColor = SOURCE_COLORS[sourceKey] ?? 'bg-slate-100 text-slate-700';
                      const assignedCategory = categorized[item.id];
                      const isSelected = selectedItemId === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            className={`rounded-lg border shadow-sm transition-all py-0 gap-0 cursor-pointer ${
                              isSelected
                                ? 'border-amber-400 ring-2 ring-amber-200'
                                : assignedCategory
                                  ? 'border-emerald-200 bg-emerald-50/30'
                                  : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${sentiment.color}`} />
                                    <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${sourceColor}`}>
                                      {item.source}
                                    </Badge>
                                    {item.priority && (
                                      <Badge
                                        variant="secondary"
                                        className={`text-[9px] px-1.5 py-0 ${
                                          item.priority === 'high'
                                            ? 'bg-rose-100 text-rose-700'
                                            : item.priority === 'medium'
                                              ? 'bg-amber-100 text-amber-700'
                                              : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                      >
                                        {item.priority}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-xs text-slate-700 leading-relaxed ${!isSelected ? 'line-clamp-2' : ''}`}>
                                    {item.text}
                                  </p>
                                </div>
                              </div>

                              {/* Category assignment */}
                              <div className="flex items-center gap-2 pl-6">
                                <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <Select
                                  value={assignedCategory ?? '__none__'}
                                  onValueChange={(value) => handleAssignCategory(item.id, value)}
                                >
                                  <SelectTrigger className={`h-7 text-xs rounded-lg ${
                                    assignedCategory
                                      ? 'border-emerald-300 bg-emerald-50'
                                      : 'border-slate-200'
                                  }`}>
                                    <SelectValue placeholder="Assign category..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__" className="text-xs text-slate-400">
                                      — No category —
                                    </SelectItem>
                                    {categories.map((cat) => {
                                      const def = CATEGORY_DEFINITIONS.find((c) => c.name === cat);
                                      return (
                                        <SelectItem key={cat} value={cat} className="text-xs">
                                          {def?.icon ?? '📁'} {cat}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {items.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400">Loading feedback items...</p>
                    </div>
                  )}

                  {allCategorized && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-emerald-600 font-medium">
                        All items categorised! Review and submit below.
                      </p>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right: Category buckets */}
        <div>
          <div className="space-y-3">
            {categories.map((category) => {
              const def = CATEGORY_DEFINITIONS.find((c) => c.name === category);
              const icon = def?.icon ?? '📁';
              const gradient = def?.color ?? 'from-slate-400 to-slate-500';
              const categoryItems = itemsByCategory[category] ?? [];

              return (
                <motion.div key={category} layout>
                  <Card className="rounded-xl border-2 border-slate-200 shadow-sm py-0 gap-0 hover:shadow-md transition-shadow">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${gradient} rounded-t-[10px] px-4 py-2.5`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <CardTitle className="text-sm font-bold text-white">{category}</CardTitle>
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-xs hover:bg-white/30">
                          {categoryItems.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Items */}
                    <CardContent className="p-3">
                      {categoryItems.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center">
                          <p className="text-xs text-slate-400">No items assigned yet</p>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-32">
                          <div className="space-y-1.5">
                            <AnimatePresence>
                              {categoryItems.map((item) => {
                                const sentiment = SENTIMENT_CONFIG[item.sentiment];
                                return (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-start gap-1.5 bg-slate-50 rounded-md p-2 group"
                                  >
                                    <span
                                      className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${sentiment.color}`}
                                    />
                                    <p className="text-[11px] text-slate-600 leading-snug flex-1 line-clamp-2">
                                      {item.text}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        uncategorizeItem(item.id);
                                      }}
                                    >
                                      <span className="text-xs text-slate-400 hover:text-rose-500">×</span>
                                    </Button>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <Separator />
      <div className="flex items-center justify-between pb-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="rounded-xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
        <Button
          disabled={!allCategorized}
          onClick={handleSubmitAnalysis}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-50"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Review Analysis
        </Button>
      </div>
    </div>
  );
}
