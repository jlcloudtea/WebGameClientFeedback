'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { useGameStore } from '@/lib/stores/game-store';
import { scoreSurveyBuilder, createMissionScore } from '@/lib/scoring';
import { MISSION_TYPES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuestionPalette from './QuestionPalette';
import SurveyCanvas from './SurveyCanvas';
import QuestionEditor from './QuestionEditor';
import SurveyPreview from './SurveyPreview';
import {
  Eye,
  Send,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function SurveyBuilder() {
  const draft = useSurveyStore((s) => s.draft);
  const setSurveyTitle = useSurveyStore((s) => s.setSurveyTitle);
  const setSurveyDescription = useSurveyStore((s) => s.setSurveyDescription);
  const selectedQuestionId = useSurveyStore((s) => s.selectedQuestionId);
  const resetDraft = useSurveyStore((s) => s.resetDraft);
  const currentMissionId = useGameStore((s) => s.currentMissionId);
  const currentMissionType = useGameStore((s) => s.currentMissionType);
  const completeMission = useGameStore((s) => s.completeMission);
  const setPhase = useGameStore((s) => s.setPhase);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const mission = MISSION_TYPES.find((m) => m.id === currentMissionType);

  const questionCount = draft.questions.length;
  const filledQuestions = draft.questions.filter((q) => q.text.trim().length > 0).length;
  const hasQuant = draft.questions.some((q) => q.type.startsWith('quantitative'));
  const hasQual = draft.questions.some((q) => q.type.startsWith('qualitative'));

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!draft.title.trim()) {
      setValidationMsg('Please add a survey title before submitting.');
      return;
    }
    if (questionCount < 3) {
      setValidationMsg('Please add at least 3 questions to your survey.');
      return;
    }
    if (filledQuestions < questionCount) {
      setValidationMsg('Some questions are missing text. Please fill in all questions.');
      return;
    }

    setValidationMsg(null);
    setSubmitting(true);

    // Simulate brief processing
    await new Promise((r) => setTimeout(r, 800));

    const scoreResult = scoreSurveyBuilder({
      draft,
      targetQuestionCount: 8,
      requiredCategories: ['hardware', 'software', 'support', 'training'],
    });

    const missionScore = createMissionScore(
      currentMissionId ?? 'survey-builder',
      currentMissionType ?? 'survey-builder',
      scoreResult,
    );

    completeMission(missionScore);
    resetDraft();
    setPhase('mission-summary');
  };

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
            <span>{mission?.icon ?? '📋'}</span>
            Survey Builder
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Design a professional survey to gather client requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="rounded-xl text-sm"
            disabled={questionCount === 0}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || questionCount === 0}
            className="rounded-xl text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {submitting ? (
              <>
                <Sparkles className="h-4 w-4 mr-1.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1.5" />
                Submit Survey
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Survey title and description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl border-0 shadow-md">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-600">Survey Details</h3>
            </div>
            <Input
              value={draft.title}
              onChange={(e) => setSurveyTitle(e.target.value)}
              placeholder="Survey Title (e.g. 'ICT Requirements Assessment')"
              className="rounded-xl text-sm font-medium"
            />
            <Textarea
              value={draft.description}
              onChange={(e) => setSurveyDescription(e.target.value)}
              placeholder="Brief description of what this survey aims to discover..."
              className="rounded-xl text-sm resize-none min-h-[60px]"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation message */}
      {validationMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {validationMsg}
        </motion.div>
      )}

      {/* Progress indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        <Badge
          variant="secondary"
          className={`text-xs ${questionCount >= 6 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {questionCount >= 6 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          {questionCount} questions
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs ${hasQuant ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {hasQuant ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          Quantitative
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs ${hasQual ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {hasQual ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          Qualitative
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs ${draft.title.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {draft.title.trim() ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          Title
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs ${draft.description.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
        >
          {draft.description.trim() ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
          Description
        </Badge>
      </motion.div>

      {/* Main layout: Palette + Canvas + Editor */}
      <div className="grid lg:grid-cols-[260px_1fr_280px] gap-4">
        {/* Left: Question palette */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <QuestionPalette />
        </motion.div>

        {/* Center: Survey canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <SurveyCanvas />
        </motion.div>

        {/* Right: Question editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {selectedQuestionId ? (
            <QuestionEditor />
          ) : (
            <Card className="rounded-2xl border-0 shadow-md border-l-4 border-l-slate-200">
              <CardContent className="p-4 text-center space-y-3">
                <div className="text-3xl">✏️</div>
                <p className="text-sm text-slate-500">
                  Select a question to edit its details
                </p>
                <p className="text-xs text-slate-400">
                  Click on any question card or add a new one from the palette
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Survey Preview Modal */}
      <SurveyPreview open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
