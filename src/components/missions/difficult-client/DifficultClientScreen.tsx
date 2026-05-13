'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flame,
  Home,
  RotateCcw,
  Shield,
  Trophy,
} from 'lucide-react';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { useGameStore } from '@/lib/stores/game-store';
import type { ClientEmotion, ClientState, DialogueChoice } from '@/lib/stores/types';
import { scoreDialogueMission, createMissionScore } from '@/lib/scoring';
import EmotionDisplay from './EmotionDisplay';
import DeEscalationMeter from './DeEscalationMeter';
import BranchingDialogue from './BranchingDialogue';
import StrategyHint from './StrategyHint';

// --- Difficult client scenario data ---
const DIFFICULT_CLIENT: ClientState = {
  name: 'Mr. Derek Collins',
  title: 'Operations Manager',
  organization: 'Pacific Freight Logistics',
  avatar: '🤬',
  satisfaction: 10,
  patience: 15,
  revealedNeeds: [],
  hiddenNeeds: [
    'Network stability guarantee',
    'Dedicated support line',
    'Compensation for downtime',
    'Migration plan to new system',
  ],
  emotion: 'angry' as ClientEmotion,
};

// --- Branching dialogue scenario ---
interface ScenarioNode {
  id: string;
  clientMessage: string;
  emotion: ClientEmotion;
  satisfactionDelta: number;
  patienceDelta: number;
  revealedNeed?: string;
  choices: DialogueChoice[];
}

const SCENARIO_NODES: ScenarioNode[] = [
  {
    id: 'node-1',
    clientMessage:
      'This is the THIRD time this month your system has gone down during our peak shipping hours! Do you have ANY idea how much money we\'re losing? I want to speak to someone who can actually fix this!',
    emotion: 'angry',
    satisfactionDelta: 0,
    patienceDelta: 0,
    choices: [
      {
        id: 'c1-a',
        text: 'I completely understand your frustration, Mr. Collins. System downtime during peak hours is unacceptable, and I want to help resolve this right away.',
        empathyScore: 0.9,
        professionalismScore: 0.85,
        feedback: 'Great start! You acknowledged his feelings and showed urgency.',
        nextMessageId: 'node-2',
      },
      {
        id: 'c1-b',
        text: 'I\'m sorry to hear that. Let me check what might be causing the issue.',
        empathyScore: 0.5,
        professionalismScore: 0.6,
        feedback: 'Decent response, but you missed acknowledging the full impact. He needs to feel heard first.',
        nextMessageId: 'node-2b',
      },
      {
        id: 'c1-c',
        text: 'Our systems have been running at 99.5% uptime, which is actually quite good for the industry.',
        empathyScore: 0.1,
        professionalismScore: 0.3,
        feedback: 'Defensive! Never justify problems when a client is this upset. This will escalate the situation.',
        nextMessageId: 'node-2c',
      },
      {
        id: 'c1-d',
        text: 'Look, I don\'t make the rules. Let me transfer you to technical support.',
        empathyScore: 0.05,
        professionalismScore: 0.1,
        feedback: 'Dangerous! Dismissing and deflecting will make the client much angrier. This could end badly.',
        nextMessageId: 'node-2c',
      },
    ],
  },
  {
    id: 'node-2',
    clientMessage:
      'Finally, someone who actually listens! Look, I\'ve been dealing with this for weeks. Every time it rains, the VPN drops. We can\'t process shipments, drivers are sitting idle, and customers are complaining. I need a REAL solution, not another "we\'re looking into it."',
    emotion: 'frustrated',
    satisfactionDelta: 15,
    patienceDelta: 20,
    revealedNeed: 'Network stability guarantee',
    choices: [
      {
        id: 'c2-a',
        text: 'I can see this has been going on for weeks and it\'s affecting your entire operation. The VPN dropping in rain suggests a hardware issue at a connection point. Can I ask — when did this start, and has anyone surveyed the physical infrastructure?',
        empathyScore: 0.85,
        professionalismScore: 0.9,
        feedback: 'Excellent! You showed empathy AND asked a diagnostic question that shows technical competence.',
        nextMessageId: 'node-3',
      },
      {
        id: 'c2-b',
        text: 'I\'ll make sure our team looks into the VPN issue right away. What time does it usually happen?',
        empathyScore: 0.6,
        professionalismScore: 0.7,
        feedback: 'Good technical follow-up, but you could have shown more understanding of the business impact first.',
        nextMessageId: 'node-3b',
      },
      {
        id: 'c2-c',
        text: 'Have you tried using a backup connection? That might help in the meantime.',
        empathyScore: 0.4,
        professionalismScore: 0.5,
        feedback: 'You\'re offering a band-aid solution without understanding the root cause. Clients want permanent fixes.',
        nextMessageId: 'node-3b',
      },
    ],
  },
  {
    id: 'node-2b',
    clientMessage:
      'Sorry to hear that?! We\'re losing THOUSANDS of dollars every hour your system is down! "Sorry" doesn\'t cut it anymore. I need to know what you\'re going to DO about this!',
    emotion: 'angry',
    satisfactionDelta: -5,
    patienceDelta: -10,
    choices: [
      {
        id: 'c2b-a',
        text: 'You\'re absolutely right — "sorry" isn\'t enough. Let me focus on solutions. The VPN drops suggest a hardware vulnerability. Here\'s what I can do right now: I\'ll escalate this to our senior engineer and get a dedicated line established for your site.',
        empathyScore: 0.85,
        professionalismScore: 0.9,
        feedback: 'Great recovery! You shifted from apology to concrete action, which is exactly what he needed.',
        nextMessageId: 'node-3',
      },
      {
        id: 'c2b-b',
        text: 'I understand this is urgent. Let me look into the ticket history and see what\'s been done so far.',
        empathyScore: 0.5,
        professionalismScore: 0.6,
        feedback: 'You\'re being reactive rather than proactive. He wants action, not investigation.',
        nextMessageId: 'node-3b',
      },
    ],
  },
  {
    id: 'node-2c',
    clientMessage:
      'Are you SERIOUS right now?! I don\'t care about your statistics! I care about my business not being able to function! Get me your manager — I\'m done talking to someone who doesn\'t take this seriously!',
    emotion: 'angry',
    satisfactionDelta: -15,
    patienceDelta: -25,
    choices: [
      {
        id: 'c2c-a',
        text: 'Mr. Collins, you\'re absolutely right — I was wrong to focus on statistics when your business is suffering. I take this very seriously. Let me put you through to our senior resolution team AND stay on the line to make sure this gets the priority it deserves.',
        empathyScore: 0.8,
        professionalismScore: 0.85,
        feedback: 'Excellent recovery! You acknowledged your mistake and offered both escalation and personal follow-through.',
        nextMessageId: 'node-3',
      },
      {
        id: 'c2c-b',
        text: 'Of course, I\'ll transfer you to my manager right away.',
        empathyScore: 0.3,
        professionalismScore: 0.4,
        feedback: 'Giving up and transferring isn\'t the best approach. You lost an opportunity to rebuild trust.',
        nextMessageId: 'node-3b',
      },
    ],
  },
  {
    id: 'node-3',
    clientMessage:
      'That actually makes sense. Nobody\'s ever asked about the infrastructure before. Look, it started about 6 weeks ago after that big storm. The connection box on the east side of the building took water damage, but nobody came to check it properly. What I really need is a guarantee this won\'t keep happening, and honestly, some kind of compensation for all the downtime.',
    emotion: 'frustrated',
    satisfactionDelta: 15,
    patienceDelta: 20,
    revealedNeed: 'Compensation for downtime',
    choices: [
      {
        id: 'c3-a',
        text: 'Thank you for that detail — the water damage is likely the root cause, and I\'ll make sure our team inspects it this week. Regarding guarantees and compensation: I\'ll prepare a service-level agreement with 99.9% uptime commitment and a compensation clause. I\'ll also set up a dedicated support line so you never have to wait again. Does that sound like what you need?',
        empathyScore: 0.95,
        professionalismScore: 0.95,
        feedback: 'Outstanding! You addressed both the technical issue AND the business concerns with concrete, professional solutions.',
        nextMessageId: 'node-4',
      },
      {
        id: 'c3-b',
        text: 'I\'ll send someone to look at the connection box. And I can look into compensation options for you.',
        empathyScore: 0.6,
        professionalismScore: 0.65,
        feedback: 'You addressed the issues but vaguely. Specific commitments build more trust with frustrated clients.',
        nextMessageId: 'node-4b',
      },
      {
        id: 'c3-c',
        text: 'Compensation would need to be approved by management. I can\'t make promises about that.',
        empathyScore: 0.3,
        professionalismScore: 0.4,
        feedback: 'Deflecting on compensation makes you seem powerless. At least offer to advocate for them.',
        nextMessageId: 'node-4b',
      },
    ],
  },
  {
    id: 'node-3b',
    clientMessage:
      'Look, I\'ve heard promises before. What I need is someone who will actually follow through. Can you guarantee me that this will be fixed, and that we won\'t be left in the dark again?',
    emotion: 'frustrated',
    satisfactionDelta: 5,
    patienceDelta: 5,
    choices: [
      {
        id: 'c3b-a',
        text: 'I understand you\'ve been let down before. Here\'s what I\'ll do differently: I\'ll be your single point of contact, I\'ll send you daily updates until this is resolved, and I\'ll schedule a site visit this week. You\'ll have my direct number. Is that the kind of follow-through you need?',
        empathyScore: 0.9,
        professionalismScore: 0.9,
        feedback: 'Perfect! You acknowledged past letdowns and offered specific, personal accountability.',
        nextMessageId: 'node-4',
      },
      {
        id: 'c3b-b',
        text: 'Yes, I can guarantee we\'ll fix it. Our team is very reliable.',
        empathyScore: 0.4,
        professionalismScore: 0.35,
        feedback: 'Empty promises won\'t work on a client who\'s been burned before. Be specific about how you\'ll follow through.',
        nextMessageId: 'node-4b',
      },
    ],
  },
  {
    id: 'node-4',
    clientMessage:
      'You know what, I appreciate that. I really do. I wasn\'t sure anyone at your company actually cared. Could we also talk about a migration plan? This old system clearly can\'t handle our needs anymore, and I want to plan ahead instead of constantly firefighting.',
    emotion: 'relieved',
    satisfactionDelta: 20,
    patienceDelta: 20,
    revealedNeed: 'Migration plan to new system',
    choices: [
      {
        id: 'c4-a',
        text: 'Absolutely — proactive planning is always better than firefighting. I\'ll put together a migration assessment for your infrastructure, including timeline, costs, and minimal-disruption options. We can schedule a meeting next week to review it together. And Mr. Collins — I\'m glad we could work through this today.',
        empathyScore: 0.9,
        professionalismScore: 0.95,
        feedback: 'Brilliant finish! You offered forward-looking solutions and closed the conversation warmly.',
        nextMessageId: 'node-5',
      },
      {
        id: 'c4-b',
        text: 'Sure, we can discuss migration. I\'ll have someone from our sales team reach out about upgrade options.',
        empathyScore: 0.5,
        professionalismScore: 0.5,
        feedback: 'Passing to sales feels impersonal after building rapport. Stay personally involved to maintain trust.',
        nextMessageId: 'node-5b',
      },
    ],
  },
  {
    id: 'node-4b',
    clientMessage:
      'I suppose that\'s something. Look, I still need a dedicated support line — I can\'t keep going through the general queue every time. And we need a plan to migrate off this unreliable system.',
    emotion: 'neutral',
    satisfactionDelta: 10,
    patienceDelta: 10,
    revealedNeed: 'Dedicated support line',
    choices: [
      {
        id: 'c4b-a',
        text: 'You\'re right — a dedicated line is essential for an operation your size. I\'ll set that up this week with priority routing. And regarding the system, let me prepare a migration roadmap. I\'d like to present it to you personally so we can align it with your shipping schedule.',
        empathyScore: 0.85,
        professionalismScore: 0.9,
        feedback: 'Strong finish! You took ownership and offered personalized service.',
        nextMessageId: 'node-5',
      },
      {
        id: 'c4b-b',
        text: 'I\'ll note the dedicated line request. For migration, you\'d need to speak to our solutions team.',
        empathyScore: 0.35,
        professionalismScore: 0.4,
        feedback: 'Too hands-off. You\'ve built some trust — don\'t lose it by passing everything to other teams.',
        nextMessageId: 'node-5b',
      },
    ],
  },
  {
    id: 'node-5',
    clientMessage:
      'Thank you. I really appreciate you taking the time to listen and actually help. I feel much better about this situation now. When can I expect that site visit?',
    emotion: 'satisfied',
    satisfactionDelta: 15,
    patienceDelta: 15,
    revealedNeed: 'Network stability guarantee',
    choices: [
      {
        id: 'c5-a',
        text: 'I\'ll schedule the site visit for this week. You\'ll receive a confirmation email by end of day. It\'s been a pleasure working through this with you, Mr. Collins.',
        empathyScore: 0.9,
        professionalismScore: 0.95,
        feedback: 'Perfect close! You provided a specific timeline and ended on a warm, professional note.',
      },
      {
        id: 'c5-b',
        text: 'We\'ll get that organised for you. Thanks for your patience today, Mr. Collins.',
        empathyScore: 0.7,
        professionalismScore: 0.75,
        feedback: 'Good ending, but could be more specific about the timeline.',
      },
    ],
  },
  {
    id: 'node-5b',
    clientMessage:
      'Alright, I\'ll give you one more chance. But I need to see results this time. Please make sure someone actually follows up.',
    emotion: 'neutral',
    satisfactionDelta: 10,
    patienceDelta: 10,
    choices: [
      {
        id: 'c5b-a',
        text: 'You have my word. I\'ll personally follow up with you by Thursday to update you on progress. Thank you for giving us the opportunity to make this right.',
        empathyScore: 0.8,
        professionalismScore: 0.85,
        feedback: 'Strong commitment! Personal follow-up builds trust with a skeptical client.',
      },
      {
        id: 'c5b-b',
        text: 'Understood. We\'ll make sure someone reaches out. Thanks for your patience.',
        empathyScore: 0.5,
        professionalismScore: 0.55,
        feedback: 'Acceptable, but "someone reaches out" is vague. Be more specific to build confidence.',
      },
    ],
  },
];

type ViewMode = 'dialogue' | 'scoring';

export default function DifficultClientScreen() {
  const [view, setView] = useState<ViewMode>('dialogue');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [empathyScores, setEmpathyScores] = useState<number[]>([]);
  const [professionalismScores, setProfessionalismScores] = useState<number[]>([]);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [escalationFailed, setEscalationFailed] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const client = useDialogueStore((s) => s.client);
  const initClient = useDialogueStore((s) => s.initClient);
  const addClientMessage = useDialogueStore((s) => s.addClientMessage);
  const updateClientSatisfaction = useDialogueStore((s) => s.updateClientSatisfaction);
  const updateClientPatience = useDialogueStore((s) => s.updateClientPatience);
  const updateClientEmotion = useDialogueStore((s) => s.updateClientEmotion);
  const revealNeed = useDialogueStore((s) => s.revealNeed);
  const setChoices = useDialogueStore((s) => s.setChoices);
  const resetDialogue = useDialogueStore((s) => s.resetDialogue);
  const completeMission = useGameStore((s) => s.completeMission);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetMissionState = useGameStore((s) => s.resetMissionState);

  // Initialize the difficult client
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initClient(DIFFICULT_CLIENT);
    // Start the first node
    const firstNode = SCENARIO_NODES[0];
    addClientMessage(firstNode.clientMessage, firstNode.emotion);
    setChoices(firstNode.choices);
  }, [initClient, addClientMessage, setChoices]);

  const handleChoiceSelected = useCallback(
    (choice: DialogueChoice) => {
      // Track scores
      setEmpathyScores((prev) => [...prev, choice.empathyScore]);
      setProfessionalismScores((prev) => [...prev, choice.professionalismScore]);

      // Show feedback
      if (choice.feedback) {
        setLastFeedback(choice.feedback);
        setTimeout(() => setLastFeedback(null), 4000);
      }

      // Find next node
      const currentNode = SCENARIO_NODES[currentNodeIndex];
      const nextNodeId = choice.nextMessageId;
      const nextNode = SCENARIO_NODES.find((n) => n.id === nextNodeId);

      if (nextNode) {
        const nextIndex = SCENARIO_NODES.indexOf(nextNode);
        setCurrentNodeIndex(nextIndex);

        // Apply deltas
        updateClientSatisfaction(nextNode.satisfactionDelta ?? currentNode.satisfactionDelta);
        updateClientPatience(nextNode.patienceDelta ?? currentNode.patienceDelta);

        // Reveal need if applicable
        if (nextNode.revealedNeed) {
          revealNeed(nextNode.revealedNeed);
        }

        // Delay for realism
        setTimeout(() => {
          addClientMessage(nextNode.clientMessage, nextNode.emotion);
          updateClientEmotion(nextNode.emotion);

          if (nextNode.choices.length > 0) {
            setChoices(nextNode.choices);
          } else {
            // End of conversation
            setIsComplete(true);
            setChoices([]);
          }
        }, 800);
      } else {
        // No next node — conversation ends
        setIsComplete(true);
        setChoices([]);
      }
    },
    [currentNodeIndex, addClientMessage, updateClientSatisfaction, updateClientPatience, updateClientEmotion, revealNeed, setChoices],
  );

  const handleEscalationFailure = useCallback(() => {
    setEscalationFailed(true);
  }, []);

  const handleUseHint = useCallback(() => {
    setHintsUsed((prev) => prev + 1);
  }, []);

  const handleComplete = useCallback(() => {
    setView('scoring');
    const satisfaction = client?.satisfaction ?? 50;
    const revealedNeedsCount = client?.revealedNeeds.length ?? 0;
    const totalNeedsCount = DIFFICULT_CLIENT.hiddenNeeds.length;

    const score = scoreDialogueMission('difficult-client', {
      empathyScores,
      professionalismScores,
      clientSatisfaction: satisfaction,
      revealedNeedsCount,
      totalNeedsCount,
      timeRemaining: 900,
      totalTime: 1500,
    });

    const hintPenalty = hintsUsed * 5;
    const adjustedScore = {
      ...score,
      totalScore: Math.max(0, score.totalScore - hintPenalty),
      xpEarned: Math.max(0, score.xpEarned - hintPenalty),
    };

    const missionScore = createMissionScore('difficult-client', 'difficult-client', adjustedScore);
    completeMission(missionScore);
  }, [client, empathyScores, professionalismScores, hintsUsed, completeMission]);

  const handleReset = useCallback(() => {
    resetDialogue();
    setView('dialogue');
    setHintsUsed(0);
    setEmpathyScores([]);
    setProfessionalismScores([]);
    setCurrentNodeIndex(0);
    setIsComplete(false);
    setEscalationFailed(false);
    setLastFeedback(null);

    initClient(DIFFICULT_CLIENT);
    const firstNode = SCENARIO_NODES[0];
    addClientMessage(firstNode.clientMessage, firstNode.emotion);
    setChoices(firstNode.choices);
  }, [resetDialogue, initClient, addClientMessage, setChoices]);

  // --- SCORING VIEW ---
  if (view === 'scoring') {
    const satisfaction = client?.satisfaction ?? 50;
    const totalScore = Math.min(100, Math.max(0, Math.round(
      (empathyScores.length > 0 ? empathyScores.reduce((a, b) => a + b, 0) / empathyScores.length * 100 : 0) * 0.3 +
      (professionalismScores.length > 0 ? professionalismScores.reduce((a, b) => a + b, 0) / professionalismScores.length * 100 : 0) * 0.3 +
      satisfaction * 0.4 -
      hintsUsed * 5
    )));
    const xpEarned = Math.max(0, Math.round(totalScore * 1.5));

    const getEmoji = () => {
      if (escalationFailed) return '💥';
      if (totalScore >= 90) return '🏆';
      if (totalScore >= 75) return '🌟';
      if (totalScore >= 60) return '👍';
      if (totalScore >= 40) return '📝';
      return '💪';
    };

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-6xl block mb-3">{getEmoji()}</span>
          <h2 className="text-3xl font-bold text-slate-800">
            {escalationFailed ? 'Escalation Failed' : totalScore >= 75 ? 'Great Job!' : totalScore >= 50 ? 'Good Effort!' : 'Keep Practising!'}
          </h2>
          <p className="text-slate-500 mt-1">Difficult Client Mission Complete</p>
        </motion.div>

        {/* Score circle */}
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

        {/* XP */}
        <div className="flex justify-center">
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 px-4 py-1.5 text-sm">
            +{xpEarned} XP Earned
          </Badge>
        </div>

        {/* Stats grid */}
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {empathyScores.length > 0 ? Math.round(empathyScores.reduce((a, b) => a + b, 0) / empathyScores.length * 100) : 0}%
                </p>
                <p className="text-xs text-amber-600 font-medium mt-1">Avg Empathy</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {professionalismScores.length > 0 ? Math.round(professionalismScores.reduce((a, b) => a + b, 0) / professionalismScores.length * 100) : 0}%
                </p>
                <p className="text-xs text-orange-600 font-medium mt-1">Avg Professionalism</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">{satisfaction}%</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Client Satisfaction</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rose-700">{hintsUsed}</p>
                <p className="text-xs text-rose-600 font-medium mt-1">Hints Used (-{hintsUsed * 5})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {escalationFailed && (
          <Card className="rounded-2xl border-2 border-rose-200 bg-rose-50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-800">The client escalated to management</p>
              <p className="text-xs text-rose-600 mt-1">
                In real situations, escalation failure can result in lost clients. Remember to always acknowledge feelings before offering solutions.
              </p>
            </CardContent>
          </Card>
        )}

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

  // --- DIALOGUE VIEW ---
  const satisfaction = client?.satisfaction ?? 10;
  const patience = client?.patience ?? 15;
  const emotion = client?.emotion ?? 'angry';
  const name = client?.name ?? 'Client';

  // Compute intensity from satisfaction/patience
  const intensity = Math.max(0, 100 - ((satisfaction + patience) / 2));

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Mission header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-r from-rose-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-rose-500" />
              <div>
                <h2 className="font-bold text-slate-800">Difficult Client Mission</h2>
                <p className="text-sm text-slate-600">
                  De-escalate the situation and find a resolution. Use empathy and professionalism.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Escalation failure overlay */}
      {escalationFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 text-center space-y-3"
        >
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold text-rose-800">Escalation Failed!</h3>
          <p className="text-sm text-rose-600">
            The client has asked to speak to management. Your response was too defensive or dismissive.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleComplete}
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
            >
              See Results
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main layout */}
      {!escalationFailed && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          {/* Left sidebar: Emotion, De-escalation meter, Hints */}
          <div className="space-y-4 order-2 lg:order-1">
            <EmotionDisplay
              emotion={emotion}
              intensity={intensity}
              name={name}
            />

            <DeEscalationMeter
              satisfaction={satisfaction}
              patience={patience}
            />

            <StrategyHint
              hintsUsed={hintsUsed}
              onUseHint={handleUseHint}
            />

            {/* Complete button */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleComplete}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Complete Mission
                </Button>
              </motion.div>
            )}
          </div>

          {/* Right: Dialogue */}
          <div className="order-1 lg:order-2">
            <BranchingDialogue
              onChoiceSelected={handleChoiceSelected}
              onEscalationFailure={handleEscalationFailure}
              clientSatisfaction={satisfaction}
              clientPatience={patience}
              isComplete={isComplete}
            />

            {/* Feedback toast */}
            <AnimatePresence>
              {lastFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-3"
                >
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    <span className="font-semibold">💡 Feedback: </span>
                    {lastFeedback}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
