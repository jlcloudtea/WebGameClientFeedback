'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, GripVertical } from 'lucide-react';
import type { FeedbackItem } from '@/lib/stores/types';

// --- Pre-defined correct category mapping (for scoring later) ---
export const CORRECT_CATEGORIES: Record<string, string> = {
  'fb-1': 'Service Quality',
  'fb-2': 'Response Time',
  'fb-3': 'Communication',
  'fb-4': 'Technical Competence',
  'fb-5': 'Pricing',
  'fb-6': 'Accessibility',
  'fb-7': 'Reliability',
  'fb-8': 'Training Needs',
  'fb-9': 'Service Quality',
  'fb-10': 'Response Time',
  'fb-11': 'Communication',
  'fb-12': 'Technical Competence',
  'fb-13': 'Pricing',
  'fb-14': 'Accessibility',
  'fb-15': 'Reliability',
  'fb-16': 'Training Needs',
};

// --- Sentiment colors ---
const SENTIMENT_CONFIG = {
  positive: { color: 'bg-emerald-400', label: 'Positive', textColor: 'text-emerald-700' },
  negative: { color: 'bg-rose-400', label: 'Negative', textColor: 'text-rose-700' },
  neutral: { color: 'bg-amber-400', label: 'Neutral', textColor: 'text-amber-700' },
} as const;

// --- Source badge colors ---
const SOURCE_COLORS: Record<string, string> = {
  survey: 'bg-sky-100 text-sky-700',
  interview: 'bg-violet-100 text-violet-700',
  'AI-generated': 'bg-orange-100 text-orange-700',
};

interface FeedbackCardProps {
  item: FeedbackItem;
  assignedCategory?: string;
  isDragOverlay?: boolean;
}

export default function FeedbackCard({ item, assignedCategory, isDragOverlay }: FeedbackCardProps) {
  const [open, setOpen] = useState(false);
  const sentiment = SENTIMENT_CONFIG[item.sentiment];
  const sourceKey = item.source.toLowerCase().includes('survey')
    ? 'survey'
    : item.source.toLowerCase().includes('interview')
      ? 'interview'
      : 'AI-generated';
  const sourceColor = SOURCE_COLORS[sourceKey] ?? 'bg-slate-100 text-slate-700';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
    disabled: !!assignedCategory,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  if (assignedCategory) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cursor-pointer"
          >
            <Card className="rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow py-0 gap-0">
              <CardContent className="p-2.5 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className={`mt-1 shrink-0 w-2.5 h-2.5 rounded-full ${sentiment.color}`} />
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                    {item.text}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${sourceColor}`}>
                    {item.source}
                  </Badge>
                  <span className="text-[9px] text-emerald-600 font-medium">
                    {assignedCategory}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className={`w-3 h-3 rounded-full ${sentiment.color}`} />
              Feedback Detail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-xs ${sourceColor}`}>
                {item.source}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {sentiment.label}
              </Badge>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                {assignedCategory}
              </Badge>
            </div>
            {item.priority && (
              <p className="text-xs text-slate-500">Priority: {item.priority}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 1.03 : 1 }}
            transition={{ duration: 0.15 }}
            className={isDragOverlay ? 'cursor-grabbing' : 'cursor-grab'}
          >
            <Card
              className={`rounded-lg border shadow-sm hover:shadow-md transition-all py-0 gap-0 ${
                isDragging
                  ? 'border-amber-300 shadow-amber-200 ring-2 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${sentiment.color}`} />
                      <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${sourceColor}`}>
                        {item.source}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                      {item.text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Feedback Detail
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${sourceColor}`}>
              {item.source}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {sentiment.label}
            </Badge>
          </div>
          {item.priority && (
            <p className="text-xs text-slate-500">Priority: {item.priority}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
