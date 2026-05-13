'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  User,
  Bot,
  Info,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import type { ClientEmotion, DialogueChoice, DialogueMessage } from '@/lib/stores/types';

// --- Emotion colors for message bubbles ---
const EMOTION_BUBBLE_COLORS: Record<ClientEmotion, string> = {
  angry: 'bg-rose-50 border-rose-200',
  frustrated: 'bg-orange-50 border-orange-200',
  confused: 'bg-amber-50 border-amber-200',
  neutral: 'bg-slate-50 border-slate-200',
  happy: 'bg-lime-50 border-lime-200',
  relieved: 'bg-teal-50 border-teal-200',
  satisfied: 'bg-emerald-50 border-emerald-200',
};

// --- Crisis / warning detection ---
function isCrisisChoice(choice: DialogueChoice): boolean {
  return choice.empathyScore < 0.2 || choice.professionalismScore < 0.2;
}

function isRiskyChoice(choice: DialogueChoice): boolean {
  return choice.empathyScore < 0.4 || choice.professionalismScore < 0.4;
}

interface BranchingDialogueProps {
  onChoiceSelected: (choice: DialogueChoice) => void;
  onEscalationFailure: () => void;
  clientSatisfaction: number;
  clientPatience: number;
  isComplete?: boolean;
}

export default function BranchingDialogue({
  onChoiceSelected,
  onEscalationFailure,
  clientSatisfaction,
  clientPatience,
  isComplete = false,
}: BranchingDialogueProps) {
  const messages = useDialogueStore((s) => s.messages);
  const choices = useDialogueStore((s) => s.choices);
  const isAiTyping = useDialogueStore((s) => s.isAiTyping);
  const selectChoice = useDialogueStore((s) => s.selectChoice);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAiTyping]);

  const handleSelectChoice = (choice: DialogueChoice) => {
    selectChoice(choice.id);
    onChoiceSelected(choice);

    // Check for escalation failure
    if (choice.empathyScore < 0.1 && clientSatisfaction < 15) {
      onEscalationFailure();
    }
  };

  // Warning states
  const showPatienceWarning = clientPatience < 30;
  const showCrisisWarning = clientPatience < 15;

  return (
    <div className="space-y-3">
      {/* Crisis/patience warnings */}
      <AnimatePresence>
        {showCrisisWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-rose-100 border border-rose-300 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-rose-800">Crisis Alert!</p>
                <p className="text-xs text-rose-700">
                  The client is about to leave. Choose your next words carefully.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        {showPatienceWarning && !showCrisisWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                Client patience is running low. Focus on empathy and understanding.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <Card className="rounded-2xl border-0 shadow-md">
        <div ref={scrollRef} className="h-[calc(100vh-480px)] min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'system' ? (
                  <div className="flex justify-center">
                    <div className="bg-slate-100 rounded-full px-4 py-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                      <Info className="h-3 w-3" />
                      {msg.text}
                    </div>
                  </div>
                ) : msg.role === 'client' ? (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div
                        className={`rounded-2xl rounded-tl-sm border px-3 py-2 text-sm leading-relaxed ${
                          EMOTION_BUBBLE_COLORS[msg.emotion ?? 'neutral']
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.emotion && msg.emotion !== 'neutral' && (
                        <span className="text-[10px] text-slate-400 ml-1 mt-0.5 block">
                          {msg.emotion}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tr-sm bg-amber-50 border border-amber-200 px-3 py-2 text-sm leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI typing indicator */}
          {isAiTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 max-w-[85%]"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Choice buttons */}
      {choices.length > 0 && !isAiTyping && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium">Choose your response:</p>
          <div className="space-y-2">
            <AnimatePresence>
              {choices.map((choice, index) => {
                const isCrisis = isCrisisChoice(choice);
                const isRisky = isRiskyChoice(choice);
                return (
                  <motion.div
                    key={choice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full rounded-xl text-left h-auto py-3 px-4 justify-start text-sm font-normal ${
                        isCrisis
                          ? 'border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                          : isRisky
                            ? 'border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                            : 'border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                      onClick={() => handleSelectChoice(choice)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <span className="shrink-0 mt-0.5">
                          {isCrisis ? (
                            <AlertTriangle className="h-4 w-4 text-rose-400" />
                          ) : isRisky ? (
                            <Zap className="h-4 w-4 text-amber-400" />
                          ) : (
                            <span className="text-slate-400 text-xs font-bold">{index + 1}</span>
                          )}
                        </span>
                        <span className="flex-1 leading-relaxed">{choice.text}</span>
                        {isRisky && !isCrisis && (
                          <Badge variant="secondary" className="text-[9px] bg-amber-100 text-amber-700 shrink-0">
                            Risky
                          </Badge>
                        )}
                        {isCrisis && (
                          <Badge variant="secondary" className="text-[9px] bg-rose-100 text-rose-700 shrink-0">
                            Danger
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Feedback for selected choice */}
      {choices.length === 0 && messages.length > 0 && !isAiTyping && (
        <div className="text-center py-2">
          {isComplete ? (
            <p className="text-sm text-emerald-600 font-semibold">✅ Conversation complete! Click "Complete Mission" to see your results.</p>
          ) : (
            <p className="text-xs text-slate-400">Waiting for client response...</p>
          )}
        </div>
      )}
    </div>
  );
}
