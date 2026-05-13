'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSurveyStore } from '@/lib/stores/survey-store';
import { SURVEY_QUESTION_TYPES } from '@/lib/constants';
import type { SurveyQuestionType } from '@/lib/stores/types';
import QuestionCard from './QuestionCard';
import { Card } from '@/components/ui/card';
import { Inbox, Plus } from 'lucide-react';

function EmptyCanvasDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 flex flex-col items-center justify-center py-16 px-6 rounded-xl border-2 border-dashed transition-colors duration-200 ${
        isOver
          ? 'border-amber-400 bg-amber-50'
          : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <Inbox className={`h-12 w-12 mb-4 ${isOver ? 'text-amber-400' : 'text-slate-300'}`} />
      <p className="text-sm font-medium text-slate-500 text-center">
        Drag question types here to build your survey
      </p>
      <p className="text-xs text-slate-400 mt-1">
        Or click &quot;Add&quot; on a question type card
      </p>
    </div>
  );
}

export default function SurveyCanvas() {
  const draft = useSurveyStore((s) => s.draft);
  const addQuestion = useSurveyStore((s) => s.addQuestion);
  const reorderQuestions = useSurveyStore((s) => s.reorderQuestions);
  const dragState = useSurveyStore((s) => s.dragState);
  const setDragState = useSurveyStore((s) => s.setDragState);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDragState({ isDragging: true, draggedQuestionId: String(event.active.id) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragState({ isDragging: false, draggedQuestionId: null, dragOverIndex: null });

    if (!over) return;

    // From palette
    const activeData = active.data.current;
    if (activeData?.fromPalette) {
      addQuestion(activeData.type as SurveyQuestionType);
      return;
    }

    // Reorder within canvas
    if (active.id !== over.id) {
      const oldIndex = draft.questions.findIndex((q) => q.id === active.id);
      const newIndex = draft.questions.findIndex((q) => q.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const idx = draft.questions.findIndex((q) => q.id === over.id);
      setDragState({ dragOverIndex: idx >= 0 ? idx : null });
    }
  };

  const questionIds = draft.questions.map((q) => q.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
          <span className="text-emerald-500">📝</span>
          Survey Canvas
          {draft.questions.length > 0 && (
            <span className="text-xs text-slate-400 font-normal">
              ({draft.questions.length} question{draft.questions.length !== 1 ? 's' : ''})
            </span>
          )}
        </h3>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        {draft.questions.length === 0 ? (
          <EmptyCanvasDropZone />
        ) : (
          <SortableContext
            items={questionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {draft.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        )}

        <DragOverlay>
          {dragState.isDragging && dragState.draggedQuestionId ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 shadow-xl opacity-80">
              <p className="text-sm text-amber-700 font-medium">Moving question...</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
