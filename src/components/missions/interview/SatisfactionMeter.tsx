'use client';

import { useDialogueStore } from '@/lib/stores/dialogue-store';
import ClientSatisfactionMeter from '@/components/shared/ClientSatisfactionMeter';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function InterviewSatisfactionMeter() {
  const client = useDialogueStore((s) => s.client);

  if (!client) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider self-start">
            Client Satisfaction
          </h4>
          <ClientSatisfactionMeter value={client.satisfaction} size={140} />
          <div className="w-full">
            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Patience</span>
              <span className="font-medium text-slate-600">{client.patience}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
              <motion.div
                className={`h-full rounded-full ${
                  client.patience > 60
                    ? 'bg-emerald-500'
                    : client.patience > 30
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${client.patience}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
