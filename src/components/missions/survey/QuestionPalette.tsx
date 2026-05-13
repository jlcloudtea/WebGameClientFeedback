'use client';

import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { SURVEY_QUESTION_TYPES } from '@/lib/constants';
import type { QuestionTypePaletteItem } from '@/lib/constants';
import type { SurveyQuestionType } from '@/lib/stores/types';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';

function DraggablePaletteCard({ item }: { item: QuestionTypePaletteItem }) {
  const addQuestion = useSurveyStore((s) => s.addQuestion);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: item.type, fromPalette: true },
  });

  const isQuant = item.type.startsWith('quantitative');

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className="rounded-xl border border-dashed border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
      >
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between">
            <span className="text-2xl">{item.icon}</span>
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isQuant
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isQuant ? 'QUANT' : 'QUAL'}
              </span>
              <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">{item.label}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addQuestion(item.type);
            }}
            className="w-full flex items-center justify-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function QuestionPalette() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
        <span className="text-amber-500">🧩</span>
        Question Types
      </h3>
      <p className="text-xs text-slate-400">
        Drag to canvas or click &quot;Add&quot; to include in your survey
      </p>
      <div className="grid grid-cols-1 gap-2">
        {SURVEY_QUESTION_TYPES.map((item, i) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <DraggablePaletteCard item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
