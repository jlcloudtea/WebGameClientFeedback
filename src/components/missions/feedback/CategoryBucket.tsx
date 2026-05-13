'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { FeedbackItem } from '@/lib/stores/types';
import { useFeedbackStore } from '@/lib/stores/feedback-store';

// --- Category definitions ---
export const CATEGORY_DEFINITIONS = [
  { name: 'Service Quality', icon: '⭐', color: 'from-amber-400 to-orange-400' },
  { name: 'Response Time', icon: '⚡', color: 'from-yellow-400 to-amber-400' },
  { name: 'Communication', icon: '💬', color: 'from-emerald-400 to-teal-400' },
  { name: 'Technical Competence', icon: '🔧', color: 'from-orange-400 to-red-400' },
  { name: 'Pricing', icon: '💰', color: 'from-emerald-400 to-green-400' },
  { name: 'Accessibility', icon: '♿', color: 'from-teal-400 to-cyan-400' },
  { name: 'Reliability', icon: '🛡️', color: 'from-rose-400 to-pink-400' },
  { name: 'Training Needs', icon: '📚', color: 'from-violet-400 to-purple-400' },
] as const;

interface CategoryBucketProps {
  category: string;
  items: FeedbackItem[];
}

export default function CategoryBucket({ category, items }: CategoryBucketProps) {
  const uncategorizeItem = useFeedbackStore((s) => s.uncategorizeItem);

  const def = CATEGORY_DEFINITIONS.find((c) => c.name === category);
  const icon = def?.icon ?? '📁';
  const gradient = def?.color ?? 'from-slate-400 to-slate-500';

  const { isOver, setNodeRef } = useDroppable({
    id: `bucket-${category}`,
    data: { category },
  });

  return (
    <motion.div layout>
      <Card
        ref={setNodeRef}
        className={`rounded-xl border-2 transition-all duration-200 py-0 gap-0 ${
          isOver
            ? 'border-amber-400 shadow-lg shadow-amber-100 scale-[1.01]'
            : 'border-slate-200 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${gradient} rounded-t-[10px] px-4 py-2.5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <CardTitle className="text-sm font-bold text-white">{category}</CardTitle>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-xs hover:bg-white/30">
              {items.length}
            </Badge>
          </div>
        </div>

        {/* Items area */}
        <CardContent className="p-3">
          {items.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isOver ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-400">
                {isOver ? 'Drop here!' : 'Drag feedback items here'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-40">
              <div className="space-y-1.5">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-1.5 bg-slate-50 rounded-md p-2 group"
                    >
                      <span
                        className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${
                          item.sentiment === 'positive'
                            ? 'bg-emerald-400'
                            : item.sentiment === 'negative'
                              ? 'bg-rose-400'
                              : 'bg-amber-400'
                        }`}
                      />
                      <p className="text-[11px] text-slate-600 leading-snug flex-1 line-clamp-2">
                        {item.text}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => uncategorizeItem(item.id)}
                      >
                        <X className="h-3 w-3 text-slate-400" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
