'use client';

import { useCallback, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Calendar,
  Users,
  Clock,
  GripVertical,
  Target,
} from 'lucide-react';
import { useImprovementStore, type Recommendation } from '@/lib/stores/improvement-store';

// --- Quadrant definitions ---
const QUADRANTS = [
  {
    id: 'delegate',
    label: 'Delegate',
    subtitle: 'High Priority · Low Impact',
    description: 'Important but less impactful. Assign to team members.',
    icon: Users,
    color: 'from-amber-400 to-yellow-400',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    criteria: (rec: Recommendation) => (rec.impact === 'low' || rec.impact === 'medium') && rec.effort === 'high',
  },
  {
    id: 'do-first',
    label: 'Do First',
    subtitle: 'High Priority · High Impact',
    description: 'Critical and impactful. Prioritise immediately.',
    icon: Zap,
    color: 'from-rose-400 to-orange-400',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    criteria: (rec: Recommendation) => rec.impact === 'high' && (rec.effort === 'low' || rec.effort === 'medium'),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    subtitle: 'Low Priority · High Impact',
    description: 'Valuable but not urgent. Plan for later.',
    icon: Calendar,
    color: 'from-emerald-400 to-teal-400',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    criteria: (rec: Recommendation) => rec.impact === 'high' && rec.effort === 'high',
  },
  {
    id: 'consider-later',
    label: 'Consider Later',
    subtitle: 'Low Priority · Low Impact',
    description: 'Nice to have. Revisit when resources allow.',
    icon: Clock,
    color: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    criteria: (rec: Recommendation) => rec.impact === 'low' && (rec.effort === 'low' || rec.effort === 'medium'),
  },
] as const;

// --- Draggable recommendation card ---
function DraggableRecCard({ rec, quadrantId }: { rec: Recommendation; quadrantId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: rec.id,
    data: { rec, fromQuadrant: quadrantId },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <motion.div
        layout
        animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 1.03 : 1 }}
        className={`bg-white rounded-lg border p-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'border-amber-300 ring-2 ring-amber-200' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-slate-300 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-700 leading-snug">{rec.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Badge className={`text-[8px] px-1 py-0 ${
                rec.impact === 'high' ? 'bg-rose-100 text-rose-700' :
                rec.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {rec.impact} impact
              </Badge>
              <Badge className={`text-[8px] px-1 py-0 ${
                rec.effort === 'high' ? 'bg-rose-100 text-rose-700' :
                rec.effort === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {rec.effort} effort
              </Badge>
              {rec.approved && (
                <span className="text-[8px] text-emerald-600">✓</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Droppable quadrant ---
function DroppableQuadrant({ quadrant, items }: { quadrant: typeof QUADRANTS[number]; items: Recommendation[] }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `quadrant-${quadrant.id}`,
    data: { quadrantId: quadrant.id },
  });

  const Icon = quadrant.icon;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 border-dashed p-3 min-h-[180px] transition-all ${
        isOver ? 'border-amber-400 bg-amber-50/50 scale-[1.01]' : `${quadrant.border} ${quadrant.bg}`
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${quadrant.color} flex items-center justify-center`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">{quadrant.label}</h4>
          <p className="text-[9px] text-slate-500">{quadrant.subtitle}</p>
        </div>
        <Badge variant="secondary" className="text-[9px] ml-auto">{items.length}</Badge>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{quadrant.description}</p>

      <div className="space-y-1.5">
        <AnimatePresence>
          {items.map((rec) => (
            <DraggableRecCard key={rec.id} rec={rec} quadrantId={quadrant.id} />
          ))}
        </AnimatePresence>
        {items.length === 0 && !isOver && (
          <p className="text-[10px] text-slate-400 text-center py-4">Drop items here</p>
        )}
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-dashed border-amber-300 rounded-lg p-3 text-center"
          >
            <p className="text-xs text-amber-600">Drop here</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PriorityMatrix() {
  const recommendations = useImprovementStore((s) => s.recommendations);
  const updateRecommendation = useImprovementStore((s) => s.updateRecommendation);

  // Track which quadrant each recommendation is in
  const [placements, setPlacements] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const rec of recommendations) {
      const matchingQuadrant = QUADRANTS.find((q) => q.criteria(rec));
      initial[rec.id] = matchingQuadrant ? matchingQuadrant.id : 'consider-later';
    }
    return initial;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const recId = active.id as string;
      const targetQuadrantId = (over.data.current?.quadrantId as string) ??
        (over.id as string).replace('quadrant-', '');

      if (!targetQuadrantId) return;

      setPlacements((prev) => ({ ...prev, [recId]: targetQuadrantId }));

      // Update impact/effort based on quadrant
      const impactEffortMap: Record<string, { impact: Recommendation['impact']; effort: Recommendation['effort'] }> = {
        'do-first': { impact: 'high', effort: 'low' },
        'schedule': { impact: 'high', effort: 'high' },
        'delegate': { impact: 'low', effort: 'high' },
        'consider-later': { impact: 'low', effort: 'low' },
      };

      const updates = impactEffortMap[targetQuadrantId];
      if (updates) {
        updateRecommendation(recId, updates);
      }
    },
    [updateRecommendation],
  );

  // Group recommendations by quadrant
  const itemsByQuadrant: Record<string, Recommendation[]> = {};
  for (const q of QUADRANTS) {
    itemsByQuadrant[q.id] = [];
  }
  for (const rec of recommendations) {
    const quadrantId = placements[rec.id] ?? 'consider-later';
    if (itemsByQuadrant[quadrantId]) {
      itemsByQuadrant[quadrantId].push(rec);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700">Priority Matrix</h3>
        <span className="text-[10px] text-slate-400 ml-2">Drag items between quadrants to adjust priority</span>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl">
          <Target className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Add recommendations first to see the priority matrix.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-3">
            {QUADRANTS.map((quadrant) => (
              <DroppableQuadrant
                key={quadrant.id}
                quadrant={quadrant}
                items={itemsByQuadrant[quadrant.id] ?? []}
              />
            ))}
          </div>
        </DndContext>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-rose-400 to-orange-400" />
          Urgent & Impactful
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-teal-400" />
          Valuable but Costly
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-amber-400 to-yellow-400" />
          Delegatable
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gradient-to-br from-slate-400 to-slate-500" />
          Low Priority
        </span>
      </div>
    </div>
  );
}
