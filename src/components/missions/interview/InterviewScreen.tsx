'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { useGameStore } from '@/lib/stores/game-store';
import { scoreDialogueMission, createMissionScore } from '@/lib/scoring';
import { MISSION_TYPES } from '@/lib/constants';
import type { ClientState } from '@/lib/stores/types';
import ChatInterface from './ChatInterface';
import ClientProfile from './ClientProfile';
import InterviewSatisfactionMeter from './SatisfactionMeter';
import NeedTracker from './NeedTracker';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

// Default client for customer-interview
const DEFAULT_CLIENT: ClientState = {
  name: 'Mr. Jake Thompson',
  title: 'Studio Manager',
  organization: 'Coastal Graphics Studio',
  avatar: '👨‍🎨',
  satisfaction: 50,
  patience: 70,
  revealedNeeds: [],
  hiddenNeeds: [
    'Reliable printing infrastructure',
    'Faster network for file transfers',
    'Data backup solution',
    'Staff training on updated software',
    'Remote access capability',
    'Software licence management',
  ],
  emotion: 'neutral',
};

// Default client for difficult-client
const DIFFICULT_CLIENT: ClientState = {
  name: 'Mr. Raj Patel',
  title: 'Department Head',
  organization: 'Westfield TAFE College',
  avatar: '👨‍💻',
  satisfaction: 25,
  patience: 30,
  revealedNeeds: [],
  hiddenNeeds: [
    'Urgent system replacement',
    'Budget constraints',
    'Staff resistance to change',
    'Compliance requirements',
    'Vendor management',
  ],
  emotion: 'angry',
};

export default function InterviewScreen() {
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const currentMissionId = useGameStore((s) => s.currentMissionId);
  const missionTimer = useGameStore((s) => s.missionTimer);
  const completeMission = useGameStore((s) => s.completeMission);
  const setPhase = useGameStore((s) => s.setPhase);
  const initClient = useDialogueStore((s) => s.initClient);
  const client = useDialogueStore((s) => s.client);
  const messages = useDialogueStore((s) => s.messages);
  const resetDialogue = useDialogueStore((s) => s.resetDialogue);

  const [sessionStartTime] = useState(Date.now());
  const [turnCount, setTurnCount] = useState(0);

  const mission = MISSION_TYPES.find((m) => m.id === currentMissionType);

  // Initialize client on mount
  useEffect(() => {
    const clientData = currentMissionType === 'difficult-client'
      ? DIFFICULT_CLIENT
      : DEFAULT_CLIENT;
    initClient(clientData);
    return () => {
      resetDialogue();
    };
  }, [currentMissionType, initClient, resetDialogue]);

  // Track turns
  useEffect(() => {
    const playerMsgs = messages.filter((m) => m.role === 'player').length;
    setTurnCount(playerMsgs);
  }, [messages]);

  const handleComplete = useCallback(() => {
    if (!client) return;

    const empathyScores = messages
      .filter((m) => m.role === 'player' && m.choiceId)
      .map(() => {
        // Approximate from satisfaction changes — in a real app, store scores per choice
        return client.satisfaction / 100;
      });

    const professionalismScores = empathyScores.map((e) =>
      Math.min(1, e + 0.1),
    );

    const totalNeeds = client.revealedNeeds.length + client.hiddenNeeds.length;
    const totalTime = currentMissionType
      ? (mission?.estimatedMinutes ?? 20) * 60
      : 1200;

    const scoreResult = scoreDialogueMission(
      currentMissionType ?? 'customer-interview',
      {
        empathyScores: empathyScores.length > 0 ? empathyScores : [0.5],
        professionalismScores: professionalismScores.length > 0 ? professionalismScores : [0.5],
        clientSatisfaction: client.satisfaction,
        revealedNeedsCount: client.revealedNeeds.length,
        totalNeedsCount: totalNeeds,
        timeRemaining: missionTimer,
        totalTime,
      },
    );

    const missionScore = createMissionScore(
      currentMissionId ?? 'interview',
      currentMissionType ?? 'customer-interview',
      scoreResult,
    );

    completeMission(missionScore);
    resetDialogue();
    setPhase('mission-summary');
  }, [client, messages, currentMissionType, currentMissionId, missionTimer, mission?.estimatedMinutes, completeMission, resetDialogue, setPhase]);

  if (!client) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>{mission?.icon ?? '🗣️'}</span>
            {mission?.title ?? 'Customer Interview'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Use active listening and appropriate questioning to uncover client needs
          </p>
        </div>
      </motion.div>

      {/* Main layout: Chat (left) + Sidebar (right) */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Left: Chat interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChatInterface onComplete={handleComplete} />
        </motion.div>

        {/* Right: Client info + Satisfaction + Needs */}
        <div className="space-y-4">
          <ClientProfile
            missionType={currentMissionType ?? undefined}
            sessionStartTime={sessionStartTime}
            turnCount={turnCount}
          />
          <InterviewSatisfactionMeter />
          <NeedTracker />

          {/* Complete button (fallback if chat doesn't trigger) */}
          {turnCount >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                onClick={handleComplete}
                className="w-full rounded-xl py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 font-bold"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                End Interview & View Results
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
