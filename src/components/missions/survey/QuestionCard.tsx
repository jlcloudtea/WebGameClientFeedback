'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SURVEY_QUESTION_TYPES } from '@/lib/constants';
import type { SurveyQuestionDraft, SurveyQuestionType } from '@/lib/stores/types';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Trash2, Edit3, Star, CircleDot, BarChart3, FileText, CheckCircle } from 'lucide-react';

const TYPE_ICONS: Record<SurveyQuestionType, React.ReactNode> = {
  'quantitative-rating': <Star className="h-3.5 w-3.5" />,
  'quantitative-multiple': <CircleDot className="h-3.5 w-3.5" />,
  'quantitative-scale': <BarChart3 className="h-3.5 w-3.5" />,
  'qualitative-open': <FileText className="h-3.5 w-3.5" />,
  'qualitative-yesno': <CheckCircle className="h-3.5 w-3.5" />,
};

interface QuestionCardProps {
  question: SurveyQuestionDraft;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const selectedQuestionId = useSurveyStore((s) => s.selectedQuestionId);
  const selectQuestion = useSurveyStore((s) => s.selectQuestion);
  const removeQuestion = useSurveyStore((s) => s.removeQuestion);
  const updateQuestion = useSurveyStore((s) => s.updateQuestion);

  const isSelected = selectedQuestionId === question.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const paletteItem = SURVEY_QUESTION_TYPES.find((t) => t.type === question.type);
  const isQuant = question.type.startsWith('quantitative');

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-amber-400 shadow-lg shadow-amber-100 bg-white'
          : 'border-slate-200 bg-white hover:border-amber-200 hover:shadow-md'
      } ${isDragging ? 'z-50 shadow-xl' : ''}`}
    >
      <div className="p-3 space-y-2">
        {/* Top row: drag handle, type badge, required toggle, delete */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 text-slate-400"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <Badge
            variant="secondary"
            className={`text-[10px] font-bold gap-1 ${
              isQuant
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {TYPE_ICONS[question.type]}
            {paletteItem?.label ?? question.type}
          </Badge>

          <span className="text-xs text-slate-400">Q{index + 1}</span>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Required</span>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { required: checked })
                }
                className="scale-75"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-amber-600"
              onClick={() => selectQuestion(isSelected ? null : question.id)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-red-500"
              onClick={() => removeQuestion(question.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Question text */}
        <button
          type="button"
          onClick={() => selectQuestion(isSelected ? null : question.id)}
          className="w-full text-left"
        >
          {question.text.trim() ? (
            <p className="text-sm text-slate-700 leading-relaxed">{question.text}</p>
          ) : (
            <p className="text-sm text-slate-300 italic">
              Click to add question text...
            </p>
          )}
        </button>

        {/* Multiple choice options preview */}
        {question.type === 'quantitative-multiple' && question.options && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {question.options.map((opt, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full"
              >
                {opt || `Option ${i + 1}`}
              </span>
            ))}
          </div>
        )}

        {/* Rating/scale preview */}
        {(question.type === 'quantitative-rating' || question.type === 'quantitative-scale') && (
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: question.scaleMax ?? 5 }, (_, i) => (
              <span
                key={i}
                className={question.type === 'quantitative-rating' ? 'text-amber-400 text-xs' : 'text-slate-300 text-xs'}
              >
                {question.type === 'quantitative-rating' ? '★' : '○'}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
