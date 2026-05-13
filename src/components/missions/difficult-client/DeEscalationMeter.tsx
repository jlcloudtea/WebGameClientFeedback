'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertOctagon,
  AlertTriangle,
  Minus,
  Smile,
  CheckCircle2,
} from 'lucide-react';

// --- De-escalation stages ---
const STAGES = [
  { key: 'critical', label: 'Critical', icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-500' },
  { key: 'tense', label: 'Tense', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-500' },
  { key: 'neutral', label: 'Neutral', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-500' },
  { key: 'calm', label: 'Calm', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-500' },
] as const;

// --- Stage tips ---
const STAGE_TIPS: Record<string, string> = {
  critical: 'Stay calm. Acknowledge their frustration immediately. Don\'t argue.',
  tense: 'Listen actively. Show empathy. Ask what would help them most.',
  neutral: 'Good progress! Start focusing on the actual problem and solutions.',
  calm: 'Almost there. Confirm understanding and agree on next steps.',
  resolved: 'Excellent work! The client is now receptive to solutions.',
};

function getStage(satisfaction: number): number {
  if (satisfaction < 20) return 0; // Critical
  if (satisfaction < 40) return 1; // Tense
  if (satisfaction < 60) return 2; // Neutral
  if (satisfaction < 80) return 3; // Calm
  return 4; // Resolved
}

interface DeEscalationMeterProps {
  satisfaction: number;
  patience: number;
}

export default function DeEscalationMeter({ satisfaction, patience }: DeEscalationMeterProps) {
  const stageIndex = getStage(satisfaction);
  const currentStage = STAGES[stageIndex];
  const progress = (stageIndex / (STAGES.length - 1)) * 100;
  const tip = STAGE_TIPS[currentStage.key];

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">De-escalation Progress</h3>
          <span className={`text-xs font-bold ${currentStage.color}`}>
            {currentStage.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${currentStage.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          {/* Stage markers */}
          <div className="absolute inset-0 flex justify-between px-0.5">
            {STAGES.map((stage, i) => {
              const StageIcon = stage.icon;
              const isActive = i <= stageIndex;
              return (
                <motion.div
                  key={stage.key}
                  className={`-mt-5 flex items-center justify-center w-5 h-5 rounded-full ${
                    isActive ? stage.bg : 'bg-slate-200'
                  }`}
                  animate={{ scale: i === stageIndex ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <StageIcon className={`h-2.5 w-2.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <motion.div
          key={currentStage.key}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-2.5 text-xs ${
            stageIndex <= 1
              ? 'bg-rose-50 text-rose-700'
              : stageIndex <= 2
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <span className="font-medium">💡 Tip: </span>
          {tip}
        </motion.div>

        {/* Satisfaction & Patience mini bars */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
              <span>Satisfaction</span>
              <span>{satisfaction}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-400"
                animate={{ width: `${satisfaction}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
              <span>Patience</span>
              <span>{patience}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${patience < 30 ? 'bg-rose-400' : patience < 60 ? 'bg-amber-400' : 'bg-teal-400'}`}
                animate={{ width: `${patience}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
