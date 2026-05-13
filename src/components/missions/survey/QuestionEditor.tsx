'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { SURVEY_QUESTION_TYPES } from '@/lib/constants';
import type { SurveyQuestionType } from '@/lib/stores/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Trash2, Star, CircleDot, BarChart3, FileText, CheckCircle } from 'lucide-react';

const TYPE_ICONS: Record<SurveyQuestionType, React.ReactNode> = {
  'quantitative-rating': <Star className="h-4 w-4 text-amber-500" />,
  'quantitative-multiple': <CircleDot className="h-4 w-4 text-amber-500" />,
  'quantitative-scale': <BarChart3 className="h-4 w-4 text-amber-500" />,
  'qualitative-open': <FileText className="h-4 w-4 text-emerald-500" />,
  'qualitative-yesno': <CheckCircle className="h-4 w-4 text-emerald-500" />,
};

export default function QuestionEditor() {
  const draft = useSurveyStore((s) => s.draft);
  const selectedQuestionId = useSurveyStore((s) => s.selectedQuestionId);
  const selectQuestion = useSurveyStore((s) => s.selectQuestion);
  const updateQuestion = useSurveyStore((s) => s.updateQuestion);

  const question = draft.questions.find((q) => q.id === selectedQuestionId);

  if (!question) return null;

  const paletteItem = SURVEY_QUESTION_TYPES.find((t) => t.type === question.type);
  const isQuant = question.type.startsWith('quantitative');

  const handleAddOption = () => {
    if (!question.options) return;
    const newOptions = [...question.options, `Option ${question.options.length + 1}`];
    updateQuestion(question.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (!question.options || question.options.length <= 2) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    updateQuestion(question.id, { options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(question.id, { options: newOptions });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="rounded-2xl border-0 shadow-lg border-l-4 border-l-amber-400">
          <CardContent className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {TYPE_ICONS[question.type]}
                <Badge
                  variant="secondary"
                  className={`text-xs font-bold ${
                    isQuant
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {paletteItem?.label ?? question.type}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => selectQuestion(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

            {/* Question text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">
                Question Text
              </Label>
              <Textarea
                value={question.text}
                onChange={(e) =>
                  updateQuestion(question.id, { text: e.target.value })
                }
                placeholder="Enter your question here..."
                className="rounded-xl min-h-[80px] text-sm resize-none"
              />
              <p className="text-[10px] text-slate-400">
                Write clear, unbiased questions for best results
              </p>
            </div>

            {/* Required toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-600">
                Required question
              </Label>
              <Switch
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { required: checked })
                }
              />
            </div>

            <Separator />

            {/* Multiple choice options */}
            {question.type === 'quantitative-multiple' && question.options && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Answer Options
                </Label>
                {question.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-5 shrink-0">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => handleUpdateOption(i, e.target.value)}
                      className="rounded-lg h-8 text-sm"
                      placeholder={`Option ${i + 1}`}
                    />
                    {question.options && question.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                        onClick={() => handleRemoveOption(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full rounded-lg text-xs mt-1"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Option
                </Button>
              </div>
            )}

            {/* Rating scale settings */}
            {question.type === 'quantitative-rating' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Rating Scale Preview
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {question.scaleMin ?? 1}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 }, (_, i) => (
                      <span key={i} className="text-amber-400 text-lg cursor-default">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {question.scaleMax ?? 5}
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-[10px] text-slate-400">Min value</Label>
                    <Input
                      type="number"
                      value={question.scaleMin ?? 1}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          scaleMin: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="rounded-lg h-8 text-sm"
                      min={1}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-slate-400">Max value</Label>
                    <Input
                      type="number"
                      value={question.scaleMax ?? 5}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          scaleMax: Math.min(10, Math.max(2, parseInt(e.target.value) || 5)),
                        })
                      }
                      className="rounded-lg h-8 text-sm"
                      min={2}
                      max={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Likert scale settings */}
            {question.type === 'quantitative-scale' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  Scale Labels
                </Label>
                <div className="space-y-1.5">
                  <Input
                    value={question.scaleLabel ?? ''}
                    onChange={(e) =>
                      updateQuestion(question.id, { scaleLabel: e.target.value })
                    }
                    placeholder="e.g. Strongly Disagree → Strongly Agree"
                    className="rounded-lg h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{question.scaleMin ?? 1}</span>
                  <div className="flex-1 flex gap-0.5">
                    {Array.from({ length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 }, (_, i) => (
                      <div key={i} className="flex-1 h-2 bg-slate-200 rounded-full first:rounded-l-full last:rounded-r-full" />
                    ))}
                  </div>
                  <span>{question.scaleMax ?? 5}</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-[10px] text-slate-400">Min</Label>
                    <Input
                      type="number"
                      value={question.scaleMin ?? 1}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          scaleMin: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      className="rounded-lg h-8 text-sm"
                      min={1}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-slate-400">Max</Label>
                    <Input
                      type="number"
                      value={question.scaleMax ?? 5}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          scaleMax: Math.min(10, Math.max(2, parseInt(e.target.value) || 5)),
                        })
                      }
                      className="rounded-lg h-8 text-sm"
                      min={2}
                      max={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Open-ended hint */}
            {question.type === 'qualitative-open' && (
              <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700">
                <p className="font-semibold mb-1">💡 Tip</p>
                <p>
                  Open-ended questions let respondents express their thoughts freely.
                  Use them to discover unexpected insights, but don&apos;t overuse them
                  — they&apos;re harder to analyse at scale.
                </p>
              </div>
            )}

            {/* Yes/No hint */}
            {question.type === 'qualitative-yesno' && (
              <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700">
                <p className="font-semibold mb-1">💡 Tip</p>
                <p>
                  Yes/No questions are great for confirming specific requirements.
                  Pair them with open-ended follow-ups for richer data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
