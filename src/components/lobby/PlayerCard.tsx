'use client';

import { motion } from 'framer-motion';
import { Check, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AVATAR_OPTIONS } from '@/lib/constants';
import type { RoomPlayer } from '@/lib/stores/types';

interface PlayerCardProps {
  player: RoomPlayer;
  isHost?: boolean;
}

export default function PlayerCard({ player, isHost }: PlayerCardProps) {
  const avatarEmoji =
    AVATAR_OPTIONS.find((a) => a.id === player.avatar)?.emoji ?? '👤';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        flex items-center gap-3 rounded-xl border p-3 transition-colors
        ${player.ready ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}
        ${!player.connected ? 'opacity-50' : ''}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl">
          {avatarEmoji}
        </span>
        {/* Online indicator */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white ${
            player.connected ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        >
          {player.connected ? (
            <Wifi className="h-2 w-2 text-white" />
          ) : (
            <WifiOff className="h-2 w-2 text-white" />
          )}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-800 truncate">
            {player.nickname}
          </span>
          {isHost && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600">
              Host
            </Badge>
          )}
        </div>
        {player.score !== undefined && (
          <span className="text-xs text-slate-500">Score: {player.score}</span>
        )}
      </div>

      {/* Ready indicator */}
      {player.ready && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500"
        >
          <Check className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
