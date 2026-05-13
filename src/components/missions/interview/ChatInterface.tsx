'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import type { ClientEmotion, DialogueChoice } from '@/lib/stores/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const EMOTION_EMOJI: Record<ClientEmotion, string> = {
  neutral: '😐',
  happy: '😊',
  frustrated: '😤',
  confused: '😕',
  angry: '😡',
  relieved: '😮‍💨',
  satisfied: '😌',
};

// --- Fallback scenario data (used when AI is not available) ---

interface ScenarioTurn {
  clientMessage: string;
  clientEmotion: ClientEmotion;
  choices: DialogueChoice[];
  satisfactionDelta: number;
  revealedNeed?: string;
}

const FALLBACK_SCENARIO: ScenarioTurn[] = [
  {
    clientMessage: "Hi, thanks for meeting with me. I'm having some issues with our office setup and I'm not sure where to start.",
    clientEmotion: 'neutral',
    satisfactionDelta: 0,
    choices: [
      { id: 'c1a', text: "I'm here to help! Can you tell me a bit about what's going on?", empathyScore: 0.9, professionalismScore: 0.8, feedback: 'Great opener — warm and inviting.' },
      { id: 'c1b', text: "What exactly is the problem? I need specifics.", empathyScore: 0.3, professionalismScore: 0.6, feedback: 'A bit too direct — try warming up first.' },
      { id: 'c1c', text: "Let's skip the small talk. What do you need fixed?", empathyScore: 0.1, professionalismScore: 0.4, feedback: 'This comes across as dismissive.' },
      { id: 'c1d', text: "I understand it can be frustrating. What issues are you experiencing?", empathyScore: 0.8, professionalismScore: 0.9, feedback: 'Good — acknowledging feelings builds rapport.' },
    ],
  },
  {
    clientMessage: "Well, our printers keep jamming and it's really slowing down our workflow. We're a design studio, so printing is critical for us.",
    clientEmotion: 'frustrated',
    satisfactionDelta: 5,
    revealedNeed: 'Reliable printing infrastructure',
    choices: [
      { id: 'c2a', text: "That sounds really disruptive for a design studio. How often are the jams happening?", empathyScore: 0.9, professionalismScore: 0.9, feedback: 'Excellent — empathy + specific follow-up.' },
      { id: 'c2b', text: "Have you tried cleaning the rollers? That usually fixes it.", empathyScore: 0.3, professionalismScore: 0.5, feedback: 'Jumping to solutions too fast — gather more info first.' },
      { id: 'c2c', text: "I see. What models are the printers? I can look into it.", empathyScore: 0.5, professionalismScore: 0.7, feedback: 'Decent, but could show more empathy first.' },
      { id: 'c2d', text: "Printing issues are common. What else is bothering you?", empathyScore: 0.4, professionalismScore: 0.6, feedback: 'Minimising the problem reduces trust.' },
    ],
  },
  {
    clientMessage: "Almost daily now. And honestly, it's not just the printers. Our network has been really slow too, especially when we're uploading large design files to clients.",
    clientEmotion: 'frustrated',
    satisfactionDelta: 5,
    revealedNeed: 'Faster network for file transfers',
    choices: [
      { id: 'c3a', text: "So you're dealing with both printing and network issues — that must be really impacting your deadlines. Can you tell me more about the network?", empathyScore: 0.9, professionalismScore: 0.8, feedback: 'Great summarising and prioritising.' },
      { id: 'c3b', text: "Network slowness could be many things. What's your current setup?", empathyScore: 0.5, professionalismScore: 0.8, feedback: 'Technical but lacks empathy for the impact.' },
      { id: 'c3c', text: "That's a lot to deal with. Are your staff able to work around these issues?", empathyScore: 0.7, professionalismScore: 0.7, feedback: 'Good empathy, but could dig deeper technically.' },
      { id: 'c3d', text: "We should look at upgrading your entire infrastructure then.", empathyScore: 0.4, professionalismScore: 0.4, feedback: 'Premature recommendation — need more information.' },
    ],
  },
  {
    clientMessage: "Yes, we've been using USB drives to transfer files between computers as a workaround, but that's not sustainable. Oh, and I almost forgot — we also need some kind of backup solution. We lost a project folder last month.",
    clientEmotion: 'confused',
    satisfactionDelta: 10,
    revealedNeed: 'Data backup solution',
    choices: [
      { id: 'c4a', text: "Losing project files must have been really stressful. A good backup system is essential. Let me make sure I note that. Is there anything else you're concerned about?", empathyScore: 0.9, professionalismScore: 0.9, feedback: 'Excellent — acknowledging impact + confirming + checking for more.' },
      { id: 'c4b', text: "We can set up cloud backups for you. What's your budget?", empathyScore: 0.4, professionalismScore: 0.6, feedback: 'Jumping to solutions — missing the emotional impact.' },
      { id: 'c4c', text: "USB workarounds are common but risky. A backup solution should be top priority.", empathyScore: 0.5, professionalismScore: 0.7, feedback: 'Good technical point, but could show more empathy.' },
      { id: 'c4d', text: "That's quite a list! Printing, network, and now backups. How are your staff coping with all this?", empathyScore: 0.8, professionalismScore: 0.8, feedback: 'Good summarising and empathy for the team.' },
    ],
  },
  {
    clientMessage: "The staff are getting pretty frustrated too. Some of the junior designers are struggling with the outdated software we have. I think we need a training session or something, but I'm not sure what would help most.",
    clientEmotion: 'neutral',
    satisfactionDelta: 5,
    revealedNeed: 'Staff training on updated software',
    choices: [
      { id: 'c5a', text: "It sounds like there are both technical and training needs here. I want to make sure I capture everything — printing, network, backups, and training. Is that the full picture?", empathyScore: 0.9, professionalismScore: 0.9, feedback: 'Great summarising and checking completeness.' },
      { id: 'c5b', text: "Software training is something we can arrange. What applications are they using?", empathyScore: 0.5, professionalismScore: 0.7, feedback: 'Good technical follow-up, but acknowledge the frustration first.' },
      { id: 'c5c', text: "That's understandable. New software can be overwhelming. What specific programs do they need help with?", empathyScore: 0.8, professionalismScore: 0.8, feedback: 'Good balance of empathy and technical detail.' },
      { id: 'c5d', text: "We should probably upgrade the software first, then train them on the new versions.", empathyScore: 0.4, professionalismScore: 0.5, feedback: 'Still jumping ahead — you need the full picture first.' },
    ],
  },
  {
    clientMessage: "I think that covers the main things. To be honest, I feel a bit better just talking through it all. When can we expect some recommendations?",
    clientEmotion: 'relieved',
    satisfactionDelta: 10,
    choices: [
      { id: 'c6a', text: "I'm glad this was helpful! I'll prepare a comprehensive recommendation covering all the areas we discussed. You should have it within a few days. Is there anything else you'd like to add?", empathyScore: 0.9, professionalismScore: 0.9, feedback: 'Perfect closing — positive, professional, and thorough.' },
      { id: 'c6b', text: "Great, I'll get back to you with some options. Thanks for your time.", empathyScore: 0.6, professionalismScore: 0.7, feedback: 'Adequate but could be more reassuring.' },
      { id: 'c6c', text: "No problem. We'll address the most urgent issues first and go from there.", empathyScore: 0.7, professionalismScore: 0.8, feedback: 'Good prioritisation signal, but could be warmer.' },
    ],
  },
];

interface ChatInterfaceProps {
  onComplete?: () => void;
}

export default function ChatInterface({ onComplete }: ChatInterfaceProps) {
  const messages = useDialogueStore((s) => s.messages);
  const choices = useDialogueStore((s) => s.choices);
  const isAiTyping = useDialogueStore((s) => s.isAiTyping);
  const client = useDialogueStore((s) => s.client);
  const addClientMessage = useDialogueStore((s) => s.addClientMessage);
  const addPlayerMessage = useDialogueStore((s) => s.addPlayerMessage);
  const addSystemMessage = useDialogueStore((s) => s.addSystemMessage);
  const setChoices = useDialogueStore((s) => s.setChoices);
  const updateClientSatisfaction = useDialogueStore((s) => s.updateClientSatisfaction);
  const updateClientEmotion = useDialogueStore((s) => s.updateClientEmotion);
  const revealNeed = useDialogueStore((s) => s.revealNeed);
  const setAiTyping = useDialogueStore((s) => s.setAiTyping);

  const [currentTurn, setCurrentTurn] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // --- startTurn callback (defined BEFORE the effect that uses it) ---
  const startTurn = useCallback((turnIndex: number) => {
    if (turnIndex >= FALLBACK_SCENARIO.length) {
      setInterviewDone(true);
      addSystemMessage('The interview has concluded. Great job!');
      setChoices([]);
      return;
    }

    const turn = FALLBACK_SCENARIO[turnIndex];
    if (!turn) return;

    setIsProcessing(true);
    setAiTyping(true);

    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
      addClientMessage(turn.clientMessage, turn.clientEmotion);
      updateClientEmotion(turn.clientEmotion);
      updateClientSatisfaction(turn.satisfactionDelta);
      if (turn.revealedNeed) {
        revealNeed(turn.revealedNeed);
      }
      setAiTyping(false);
      setChoices(turn.choices);
      setIsProcessing(false);
    }, delay);
  }, [addClientMessage, addSystemMessage, revealNeed, setAiTyping, setChoices, updateClientEmotion, updateClientSatisfaction]);

  // Initialize first turn on mount (deferred to avoid synchronous setState in effect)
  useEffect(() => {
    if (!hasStarted.current && currentTurn === 0 && !isProcessing) {
      hasStarted.current = true;
      const timer = setTimeout(() => startTurn(0), 0);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, isProcessing, startTurn]);

  // Auto-scroll to bottom — scroll the chat container, not the page
  useEffect(() => {
    // Use a small delay to let React finish rendering
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, isAiTyping]);

  // --- handleChoice callback ---
  const handleChoice = useCallback((choice: DialogueChoice) => {
    // Prevent page scroll by scrolling the chat container after choice
    addPlayerMessage(choice.text, choice.id);
    setChoices([]);

    const satisfactionDelta = Math.round(choice.empathyScore * 15 - 5);
    updateClientSatisfaction(satisfactionDelta);

    if (choice.feedback) {
      addSystemMessage(`💡 ${choice.feedback}`);
    }

    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);

    setIsProcessing(true);

    // Keep scroll at bottom after choice selection
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      startTurn(nextTurn);
    }, 500);
  }, [addPlayerMessage, addSystemMessage, currentTurn, setChoices, startTurn, updateClientSatisfaction]);

  const playerMessageCount = messages.filter((m) => m.role === 'player').length;

  return (
    <Card className="rounded-2xl border-0 shadow-lg flex flex-col h-[600px]">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">
            {client?.avatar ?? '👤'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {client?.name ?? 'Client'}
            </p>
            <p className="text-[10px] text-slate-400">Active conversation</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Turn {playerMessageCount + 1}/{FALLBACK_SCENARIO.length}
        </Badge>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'player' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {msg.role === 'client' && (
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs shrink-0 mt-1">
                    {client?.avatar ?? '👤'}
                  </div>
                  <div>
                    <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                    {msg.emotion && (
                      <span className="text-xs mt-0.5 ml-1">
                        {EMOTION_EMOJI[msg.emotion]}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {msg.role === 'player' && (
                <div className="max-w-[80%]">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              )}

              {msg.role === 'system' && (
                <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium max-w-[90%] text-center">
                  {msg.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs shrink-0">
              {client?.avatar ?? '👤'}
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Choices area */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        {interviewDone ? (
          <div className="text-center">
            <p className="text-sm text-emerald-600 font-semibold mb-2">
              Interview Complete! 🎉
            </p>
            <Button
              size="sm"
              onClick={onComplete}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600"
            >
              View Results
            </Button>
          </div>
        ) : choices.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">
              Choose your response:
            </p>
            <div className="grid gap-2">
              {choices.map((choice, i) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  disabled={isProcessing}
                  className="w-full text-left p-3 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-150 text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-relaxed">{choice.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for response...
              </>
            ) : (
              'Waiting for the conversation to start...'
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
