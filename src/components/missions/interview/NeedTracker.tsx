'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, CheckCircle, Search } from 'lucide-react';

export default function NeedTracker() {
  const client = useDialogueStore((s) => s.client);

  if (!client) return null;

  const totalNeeds = client.revealedNeeds.length + client.hiddenNeeds.length;
  const revealedCount = client.revealedNeeds.length;
  const progressPct = totalNeeds > 0 ? (revealedCount / totalNeeds) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-emerald-500" />
              Needs Tracker
            </h4>
            <Badge variant="secondary" className="text-[10px]">
              {revealedCount}/{totalNeeds} discovered
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Revealed needs */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Revealed</p>
            <AnimatePresence mode="popLayout">
              {client.revealedNeeds.map((need, i) => (
                <motion.div
                  key={need}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg"
                >
                  <Unlock className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{need}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {client.revealedNeeds.length === 0 && (
              <p className="text-xs text-slate-400 italic pl-1">
                No needs discovered yet
              </p>
            )}
          </div>

          {/* Hidden needs */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Hidden</p>
            {client.hiddenNeeds.map((need, i) => (
              <motion.div
                key={need}
                className="flex items-center gap-2 text-sm bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg"
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>??? ({i + 1})</span>
              </motion.div>
            ))}
            {client.hiddenNeeds.length === 0 && totalNeeds > 0 && (
              <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">All needs discovered!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
