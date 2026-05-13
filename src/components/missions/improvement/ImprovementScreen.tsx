'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Rocket,
  BarChart3,
  Lightbulb,
  ListChecks,
  Target,
  Send,
  Home,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useImprovementStore } from '@/lib/stores/improvement-store';
import { useGameStore } from '@/lib/stores/game-store';
import { scoreServiceImprovement, createMissionScore } from '@/lib/scoring';
import FeedbackSummary from './FeedbackSummary';
import RecommendationForm from './RecommendationForm';
import ActionItemForm from './ActionItemForm';
import PriorityMatrix from './PriorityMatrix';

type ViewMode = 'plan' | 'scoring';

export default function ImprovementScreen() {
  const [view, setView] = useState<ViewMode>('plan');

  const recommendations = useImprovementStore((s) => s.recommendations);
  const actionItems = useImprovementStore((s) => s.actionItems);
  const resetImprovement = useImprovementStore((s) => s.resetImprovement);
  const completeMission = useGameStore((s) => s.completeMission);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetMissionState = useGameStore((s) => s.resetMissionState);

  const handleSubmitPlan = useCallback(() => {
    setView('scoring');

    const approvedCount = recommendations.filter((r) => r.approved).length;
    const highImpactCount = recommendations.filter((r) => r.impact === 'high').length;
    const lowEffortHighImpactCount = recommendations.filter(
      (r) => r.impact === 'high' && (r.effort === 'low' || r.effort === 'medium'),
    ).length;

    const score = scoreServiceImprovement({
      recommendationsCount: recommendations.length,
      approvedCount,
      actionItemsCount: actionItems.length,
      highImpactCount,
      lowEffortHighImpactCount,
      totalFeedbackItems: 16, // from the scenario
      timeRemaining: 800,
      totalTime: 1320,
    });

    const missionScore = createMissionScore('service-improvement', 'service-improvement', score);
    completeMission(missionScore);
  }, [recommendations, actionItems, completeMission]);

  const handleReset = useCallback(() => {
    resetImprovement();
    setView('plan');
  }, [resetImprovement]);

  const canSubmit = recommendations.length >= 2 && actionItems.length >= 1;

  // --- SCORING VIEW ---
  if (view === 'scoring') {
    const approvedCount = recommendations.filter((r) => r.approved).length;
    const highImpactCount = recommendations.filter((r) => r.impact === 'high').length;
    const lowEffortHighImpactCount = recommendations.filter(
      (r) => r.impact === 'high' && (r.effort === 'low' || r.effort === 'medium'),
    ).length;

    const score = scoreServiceImprovement({
      recommendationsCount: recommendations.length,
      approvedCount,
      actionItemsCount: actionItems.length,
      highImpactCount,
      lowEffortHighImpactCount,
      totalFeedbackItems: 16,
      timeRemaining: 800,
      totalTime: 1320,
    });

    const totalScore = Math.min(100, Math.max(0, score.totalScore));
    const xpEarned = score.xpEarned;

    const getEmoji = () => {
      if (totalScore >= 90) return '🏆';
      if (totalScore >= 75) return '🌟';
      if (totalScore >= 60) return '👍';
      if (totalScore >= 40) return '📝';
      return '💪';
    };

    const getLabel = () => {
      if (totalScore >= 90) return 'Outstanding Plan!';
      if (totalScore >= 75) return 'Great Work!';
      if (totalScore >= 60) return 'Good Effort!';
      if (totalScore >= 40) return 'Keep Improving!';
      return 'Room for Growth';
    };

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-6xl block mb-3">{getEmoji()}</span>
          <h2 className="text-3xl font-bold text-slate-800">{getLabel()}</h2>
          <p className="text-slate-500 mt-1">Service Improvement Mission Complete</p>
        </motion.div>

        <div className="flex justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <motion.circle
                cx="60" cy="60" r="50" fill="none"
                stroke={totalScore >= 70 ? '#10b981' : totalScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - totalScore / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{totalScore}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 px-4 py-1.5 text-sm">
            +{xpEarned} XP Earned
          </Badge>
        </div>

        {/* Stats */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{recommendations.length}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">Recommendations</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Approved</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{actionItems.length}</p>
                <p className="text-xs text-orange-600 font-medium mt-1">Action Items</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rose-700">{lowEffortHighImpactCount}</p>
                <p className="text-xs text-rose-600 font-medium mt-1">Quick Wins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleReset} className="rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => { setPhase('dashboard'); resetMissionState(); }}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // --- PLAN VIEW ---
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Mission header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-r from-emerald-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-6 w-6 text-emerald-500" />
              <div>
                <h2 className="font-bold text-slate-800">Service Improvement Plan</h2>
                <p className="text-sm text-slate-600">
                  Review feedback, create recommendations, and build an action plan to improve service quality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>{recommendations.length} recommendations</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ListChecks className="h-4 w-4 text-emerald-500" />
          <span>{actionItems.length} action items</span>
        </div>
        <span className="text-slate-300">•</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Trophy className="h-4 w-4 text-violet-500" />
          <span>{recommendations.filter((r) => r.approved).length} approved</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="feedback" className="rounded-lg">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Feedback Summary
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="rounded-lg">
            <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="actions" className="rounded-lg">
            <ListChecks className="h-3.5 w-3.5 mr-1.5" />
            Action Items
          </TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-lg">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Priority Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          <FeedbackSummary />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationForm />
        </TabsContent>

        <TabsContent value="actions">
          <ActionItemForm />
        </TabsContent>

        <TabsContent value="matrix">
          <PriorityMatrix />
        </TabsContent>
      </Tabs>

      {/* Submit section */}
      <Separator />
      <div className="flex items-center justify-between pb-4">
        <Button variant="outline" onClick={handleReset} className="rounded-xl">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Plan
        </Button>
        <div className="flex items-center gap-3">
          {!canSubmit && (
            <p className="text-xs text-slate-400">
              Add at least 2 recommendations and 1 action item to submit
            </p>
          )}
          <Button
            disabled={!canSubmit}
            onClick={handleSubmitPlan}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
