'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { MISSION_TYPES, MISSION_TIMER_SECONDS } from '@/lib/constants';
import type { MissionTypeDef } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Target,
  Zap,
  Play,
  User,
  Building2,
  Briefcase,
} from 'lucide-react';

/** Sample client info per mission type — kept simple for briefing */
const CLIENT_INFO: Record<string, { name: string; role: string; org: string; avatar: string }> = {
  'survey-builder': { name: 'Mrs. Sarah Davis', role: 'IT Coordinator', org: 'Sunshine Primary School', avatar: '👩‍🏫' },
  'customer-interview': { name: 'Mr. Jake Thompson', role: 'Studio Manager', org: 'Coastal Graphics Studio', avatar: '👨‍🎨' },
  'feedback-analysis': { name: 'Ms. Lisa Chen', role: 'Office Manager', org: 'Metro Legal Services', avatar: '👩‍💼' },
  'difficult-client': { name: 'Mr. Raj Patel', role: 'Department Head', org: 'Westfield TAFE College', avatar: '👨‍💻' },
  'service-improvement': { name: 'Ms. Ana Martinez', role: 'Operations Lead', org: 'Greenfield Consulting', avatar: '👩‍🔬' },
};

/** Objectives per mission type */
const OBJECTIVES: Record<string, string[]> = {
  'survey-builder': [
    'Create a survey with at least 6 questions',
    'Use both quantitative and qualitative question types',
    'Write clear, unbiased question text',
    'Add a title and description for the survey',
    'Ensure questions cover key requirement areas',
  ],
  'customer-interview': [
    'Use active listening and empathetic responses',
    'Ask appropriate question types to uncover needs',
    'Maintain client satisfaction above 60%',
    'Discover hidden client requirements',
    'Stay professional throughout the interview',
  ],
  'feedback-analysis': [
    'Categorise all feedback items accurately',
    'Identify sentiment (positive, negative, neutral)',
    'Write analysis notes with actionable insights',
    'Achieve high categorisation accuracy',
  ],
  'difficult-client': [
    'De-escalate client frustration',
    'Maintain professionalism under pressure',
    'Identify root causes of dissatisfaction',
    'Turn a negative experience into a positive one',
  ],
  'service-improvement': [
    'Generate improvement recommendations',
    'Prioritise actions by impact and effort',
    'Create specific, actionable next steps',
    'Align improvements with client feedback',
  ],
};

export default function MissionBriefing() {
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const setMissionPhase = useGameStore((s) => s.setMissionPhase);
  const setMissionTimer = useGameStore((s) => s.setMissionTimer);

  const mission: MissionTypeDef | undefined = MISSION_TYPES.find(
    (m) => m.id === currentMissionType,
  );
  const client = currentMissionType ? CLIENT_INFO[currentMissionType] : null;
  const objectives = currentMissionType ? OBJECTIVES[currentMissionType] ?? [] : [];
  const timerSeconds = currentMissionType ? MISSION_TIMER_SECONDS[currentMissionType] : 0;
  const minutes = Math.floor(timerSeconds / 60);

  const handleBegin = () => {
    setMissionTimer(timerSeconds);
    setMissionPhase('active');
  };

  if (!mission || !client) return null;

  const difficultyColor = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-rose-100 text-rose-700',
  }[mission.difficulty];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Mission title card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-4xl block mb-3">{mission.icon}</span>
                <h1 className="text-2xl sm:text-3xl font-bold">{mission.title}</h1>
                <p className="text-amber-100 mt-2 text-sm sm:text-base leading-relaxed">
                  {mission.description}
                </p>
              </div>
              <Badge className={`${difficultyColor} shrink-0 text-xs font-semibold`}>
                {mission.difficulty}
              </Badge>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>~{minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>{mission.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Target className="h-4 w-4 text-emerald-500" />
                <span>{objectives.length} objectives</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Client info card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Your Client
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl shrink-0">
                {client.avatar}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">{client.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Briefcase className="h-3.5 w-3.5" />
                  {client.role}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Building2 className="h-3.5 w-3.5" />
                  {client.org}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Mission Objectives
            </h2>
            <ul className="space-y-3">
              {objectives.map((obj, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{obj}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Begin Mission button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-center pt-2"
      >
        <Button
          size="lg"
          onClick={handleBegin}
          className="rounded-2xl px-10 py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Play className="h-5 w-5 mr-2" />
          Begin Mission
        </Button>
      </motion.div>
    </div>
  );
}
