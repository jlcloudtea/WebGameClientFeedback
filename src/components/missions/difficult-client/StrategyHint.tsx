'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Lightbulb,
  ChevronDown,
  Heart,
  Shield,
  HelpCircle,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

// --- Strategy hints data ---
const STRATEGIES = [
  {
    id: 'acknowledge',
    title: 'Acknowledge Feelings',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    description: 'Show the client you hear and understand their frustration. Use phrases like "I understand this is frustrating" or "I can see why this is upsetting."',
    examples: [
      '"I completely understand your frustration."',
      '"That sounds really difficult, and I\'m sorry."',
      '"I can see this has been a stressful experience."',
    ],
  },
  {
    id: 'dont-personal',
    title: "Don't Take It Personally",
    icon: Shield,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    description: 'Remember the client is upset about the situation, not about you personally. Stay professional and don\'t get defensive.',
    examples: [
      'Stay calm even if the client raises their voice.',
      'Avoid saying "That\'s not my fault" or getting defensive.',
      'Focus on the problem, not the blame.',
    ],
  },
  {
    id: 'clarify',
    title: 'Ask Clarifying Questions',
    icon: HelpCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    description: 'Ask open-ended questions to better understand the issue. This shows you care and helps defuse tension.',
    examples: [
      '"Can you help me understand exactly what happened?"',
      '"What would the ideal outcome look like for you?"',
      '"Is there anything else I should know about this issue?"',
    ],
  },
  {
    id: 'solutions',
    title: 'Offer Solutions, Not Excuses',
    icon: Wrench,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    description: 'Focus on what you CAN do, not what you can\'t. Provide concrete next steps and options.',
    examples: [
      '"Here\'s what I can do right now to help..."',
      '"I have two options that might work for you."',
      '"Let me get this resolved for you today."',
    ],
  },
];

interface StrategyHintProps {
  hintsUsed: number;
  onUseHint: () => void;
}

export default function StrategyHint({ hintsUsed, onUseHint }: StrategyHintProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <Collapsible open={isOpen} onOpenChange={(open) => { setIsOpen(open); }}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full rounded-2xl justify-between p-4 h-auto hover:bg-amber-50/50"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">Strategy Hints</span>
              {hintsUsed > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-rose-100 text-rose-700">
                  -{hintsUsed * 5} pts
                </Badge>
              )}
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </motion.div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="mb-3 flex items-center gap-2 bg-amber-50 rounded-lg p-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Each hint view costs <strong>-5 points</strong>. Use wisely!
              </p>
            </div>

            <div className="space-y-3">
              {STRATEGIES.map((strategy, index) => {
                const Icon = strategy.icon;
                return (
                  <motion.div
                    key={strategy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${strategy.bg} rounded-xl p-3`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`h-4 w-4 ${strategy.color}`} />
                      <span className={`text-sm font-semibold ${strategy.color}`}>
                        {strategy.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {strategy.description}
                    </p>
                    <div className="space-y-1">
                      {strategy.examples.map((ex, i) => (
                        <p key={i} className="text-xs text-slate-500 italic pl-3 border-l-2 border-slate-200">
                          {ex}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 rounded-xl text-xs"
              onClick={() => {
                onUseHint();
              }}
            >
              <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              I Read the Hints (-5 pts)
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
