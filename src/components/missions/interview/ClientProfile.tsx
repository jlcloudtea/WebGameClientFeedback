'use client';

import { motion } from 'framer-motion';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import type { ClientEmotion } from '@/lib/stores/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Building2, Briefcase, Clock, MessageSquare } from 'lucide-react';

const EMOTION_LABELS: Record<ClientEmotion, { label: string; color: string; emoji: string }> = {
  neutral: { label: 'Neutral', color: 'bg-slate-100 text-slate-600', emoji: '😐' },
  happy: { label: 'Happy', color: 'bg-emerald-100 text-emerald-700', emoji: '😊' },
  frustrated: { label: 'Frustrated', color: 'bg-orange-100 text-orange-700', emoji: '😤' },
  confused: { label: 'Confused', color: 'bg-amber-100 text-amber-700', emoji: '😕' },
  angry: { label: 'Angry', color: 'bg-red-100 text-red-700', emoji: '😡' },
  relieved: { label: 'Relieved', color: 'bg-teal-100 text-teal-700', emoji: '😮‍💨' },
  satisfied: { label: 'Satisfied', color: 'bg-emerald-100 text-emerald-700', emoji: '😌' },
};

/** Personality hints — subtle clues, not revealing hidden needs */
const PERSONALITY_HINTS: Record<string, string> = {
  'customer-interview': 'Tends to focus on immediate problems. May not mention longer-term concerns unless asked.',
  'difficult-client': 'Currently stressed. Needs calm, structured responses. Avoid jargon.',
};

interface ClientProfileProps {
  missionType?: string;
  sessionStartTime?: number;
  turnCount?: number;
}

export default function ClientProfile({ missionType, sessionStartTime, turnCount = 0 }: ClientProfileProps) {
  const client = useDialogueStore((s) => s.client);

  if (!client) return null;

  const emotionInfo = EMOTION_LABELS[client.emotion] ?? EMOTION_LABELS.neutral;
  const personalityHint = missionType ? PERSONALITY_HINTS[missionType] : null;
  const elapsedMinutes = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime) / 60000)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl shrink-0">
              {client.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg truncate">{client.name}</h3>
              <p className="text-amber-100 text-sm truncate">{client.title}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{client.organization}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Briefcase className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{client.title}</span>
          </div>

          <Separator />

          {/* Current emotion */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Mood</span>
            <Badge className={`${emotionInfo.color} text-xs gap-1`}>
              <span>{emotionInfo.emoji}</span>
              {emotionInfo.label}
            </Badge>
          </div>

          {/* Session stats */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {turnCount} turns
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {elapsedMinutes}m elapsed
            </span>
          </div>

          {/* Personality hint */}
          {personalityHint && (
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
              <p className="font-semibold mb-0.5">💡 Hint</p>
              <p className="leading-relaxed">{personalityHint}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
