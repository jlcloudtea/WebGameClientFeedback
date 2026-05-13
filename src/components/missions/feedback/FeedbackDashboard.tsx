'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useFeedbackStore } from '@/lib/stores/feedback-store';
import { useGameStore } from '@/lib/stores/game-store';
import FeedbackCard, { CORRECT_CATEGORIES } from './FeedbackCard';
import CategoryBucket, { CATEGORY_DEFINITIONS } from './CategoryBucket';
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
    text: 'The technician used too much jargon and I couldn\'t understand the explanation of the network issue.',
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
    text: 'Email updates about ticket progress are inconsistent. Sometimes I get notified, sometimes I don\'t.',
    source: 'Survey Response #7',
    sentiment: 'neutral',
    priority: 'medium',
  },
  {
    id: 'fb-12',
    text: 'The technician didn\'t seem familiar with our cloud backup system and had to escalate twice.',
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

type ViewMode = 'categorize' | 'analysis' | 'scoring';

export default function FeedbackDashboard() {
  const items = useFeedbackStore((s) => s.items);
  const categories = useFeedbackStore((s) => s.categories);
  const categorized = useFeedbackStore((s) => s.categorized);
  const analysisNotes = useFeedbackStore((s) => s.analysisNotes);
  const setItems = useFeedbackStore((s) => s.setItems);
  const setCategories = useFeedbackStore((s) => s.setCategories);
  const categorizeItem = useFeedbackStore((s) => s.categorizeItem);
  const setAnalysisNotes = useFeedbackStore((s) => s.setAnalysisNotes);
  const resetFeedback = useFeedbackStore((s) => s.resetFeedback);
  const completeMission = useGameStore((s) => s.completeMission);
  const setMissionPhase = useGameStore((s) => s.setMissionPhase);

  const [view, setView] = useState<ViewMode>('categorize');
  const [activeItem, setActiveItem] = useState<FeedbackItem | null>(null);

  // Load feedback items on mount
  useEffect(() => {
    setItems(SCENARIO_FEEDBACK_ITEMS);
    setCategories(CATEGORY_DEFINITIONS.map((c) => c.name));
  }, [setItems, setCategories]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = event.active.data.current?.item as FeedbackItem | undefined;
    if (item) setActiveItem(item);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over) return;

      const itemId = active.id as string;
      const category = over.data.current?.category as string | undefined;
      // Also handle if dropped directly on the bucket id
      const bucketId = over.id as string;
      const targetCategory = category ?? (bucketId.startsWith('bucket-') ? bucketId.replace('bucket-', '') : null);

      if (targetCategory && !categorized[itemId]) {
        categorizeItem(itemId, targetCategory);
      }
    },
    [categorizeItem, categorized],
  );

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
                  Drag each feedback item from the left panel into the correct category bucket on the right.
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid lg:grid-cols-[340px_1fr] gap-4">
          {/* Left: Uncategorized items */}
          <div>
            <Card className="rounded-2xl border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-amber-500" />
                    Uncategorised Feedback
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {uncategorizedItems.length} left
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-320px)] max-h-[600px]">
                  <div className="space-y-2 pr-2">
                    {uncategorizedItems.map((item) => (
                      <FeedbackCard key={item.id} item={item} />
                    ))}
                    {uncategorizedItems.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-emerald-600 font-medium">
                          All items categorised!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Category buckets */}
          <div>
            <div className="grid sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <CategoryBucket
                  key={category}
                  category={category}
                  items={itemsByCategory[category] ?? []}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="w-[300px]">
              <FeedbackCard item={activeItem} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
