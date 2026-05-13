'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { SURVEY_QUESTION_TYPES } from '@/lib/constants';
import type { SurveyQuestionDraft, SurveyQuestionType } from '@/lib/stores/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, CircleDot, BarChart3, FileText, CheckCircle, X, Eye } from 'lucide-react';

const TYPE_ICONS: Record<SurveyQuestionType, React.ReactNode> = {
  'quantitative-rating': <Star className="h-4 w-4 text-amber-500" />,
  'quantitative-multiple': <CircleDot className="h-4 w-4 text-amber-500" />,
  'quantitative-scale': <BarChart3 className="h-4 w-4 text-amber-500" />,
  'qualitative-open': <FileText className="h-4 w-4 text-emerald-500" />,
  'qualitative-yesno': <CheckCircle className="h-4 w-4 text-emerald-500" />,
};

interface SurveyPreviewProps {
  open: boolean;
  onClose: () => void;
}

function RatingQuestion({ question }: { question: SurveyQuestionDraft }) {
  const [rating, setRating] = useState(0);
  const max = question.scaleMax ?? 5;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={i < rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-xs text-amber-600 font-medium">
          {rating} out of {max} stars
        </p>
      )}
    </div>
  );
}

function MultipleChoiceQuestion({ question }: { question: SurveyQuestionDraft }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {question.options?.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            selected === opt
              ? 'border-amber-400 bg-amber-50'
              : 'border-slate-200 hover:border-amber-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === opt ? 'border-amber-500' : 'border-slate-300'
            }`}
          >
            {selected === opt && (
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-sm text-slate-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function LikertScaleQuestion({ question }: { question: SurveyQuestionDraft }) {
  const [selected, setSelected] = useState<number | null>(null);
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 5;
  const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const val = min + i;
          const labelIdx = Math.round((i / (max - min)) * (labels.length - 1));
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(val)}
              className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all border-2 ${
                selected === val
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-500 hover:border-amber-200'
              }`}
            >
              {labels[labelIdx] ?? `(${val})`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpenTextQuestion() {
  return (
    <Textarea
      placeholder="Type your response here..."
      className="rounded-xl min-h-[80px] text-sm resize-none"
      readOnly
    />
  );
}

function YesNoQuestion() {
  const [selected, setSelected] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setSelected('yes')}
        className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
          selected === 'yes'
            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 text-slate-500 hover:border-emerald-200'
        }`}
      >
        👍 Yes
      </button>
      <button
        type="button"
        onClick={() => setSelected('no')}
        className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
          selected === 'no'
            ? 'border-rose-400 bg-rose-50 text-rose-700'
            : 'border-slate-200 text-slate-500 hover:border-rose-200'
        }`}
      >
        👎 No
      </button>
    </div>
  );
}

function QuestionRenderer({ question }: { question: SurveyQuestionDraft }) {
  const paletteItem = SURVEY_QUESTION_TYPES.find((t) => t.type === question.type);
  const isQuant = question.type.startsWith('quantitative');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-start gap-2">
        {TYPE_ICONS[question.type]}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="secondary"
              className={`text-[10px] font-bold ${
                isQuant
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {paletteItem?.label}
            </Badge>
            {question.required && (
              <span className="text-[10px] text-red-500 font-semibold">*Required</span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-700">
            {question.text || 'Untitled question'}
          </p>
        </div>
      </div>
      <div className="pl-8">
        {question.type === 'quantitative-rating' && <RatingQuestion question={question} />}
        {question.type === 'quantitative-multiple' && <MultipleChoiceQuestion question={question} />}
        {question.type === 'quantitative-scale' && <LikertScaleQuestion question={question} />}
        {question.type === 'qualitative-open' && <OpenTextQuestion />}
        {question.type === 'qualitative-yesno' && <YesNoQuestion />}
      </div>
    </motion.div>
  );
}

export default function SurveyPreview({ open, onClose }: SurveyPreviewProps) {
  const draft = useSurveyStore((s) => s.draft);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-amber-500" />
            Survey Preview
          </DialogTitle>
        </DialogHeader>

        {/* Survey header */}
        <div className="space-y-1 mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            {draft.title || 'Untitled Survey'}
          </h3>
          {draft.description && (
            <p className="text-sm text-slate-500">{draft.description}</p>
          )}
        </div>

        {draft.questions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No questions yet. Add some to preview!</p>
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-slate-100">
            {draft.questions.map((question, i) => (
              <div key={question.id} className="pt-4 first:pt-0">
                <QuestionRenderer question={question} />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="h-4 w-4 mr-1.5" />
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
