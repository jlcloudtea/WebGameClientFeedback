'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { useRoomStore } from '@/lib/stores/room-store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DoorOpen, Loader2 } from 'lucide-react';

export default function RoomCodeEntry() {
  const setPhase = useGameStore((s) => s.setPhase);
  const playerId = useGameStore((s) => s.playerId);
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const joinRoom = useRoomStore((s) => s.joinRoom);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

  const handleJoin = async () => {
    if (normalizedCode.length !== 6) {
      setError('Room code must be 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate joining a room (in real app, this would be a socket/API call)
    setTimeout(() => {
      joinRoom({
        id: normalizedCode,
        hostId: 'host-1',
        missionType: 'survey-builder',
        status: 'waiting',
        players: [
          {
            id: playerId,
            nickname,
            avatar,
            ready: false,
            connected: true,
          },
        ],
        createdAt: Date.now(),
      });
      setLoading(false);
      setPhase('dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-xl border-0">
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🚪</div>
              <h2 className="text-2xl font-bold text-slate-800">Join a Room</h2>
              <p className="text-sm text-slate-500">
                Enter the 6-character code from your teacher
              </p>
            </div>

            {/* Room code input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Room Code
              </label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                placeholder="e.g. ABC123"
                className="h-14 text-center text-2xl font-mono tracking-[0.3em] rounded-xl border-2 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 uppercase"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin();
                }}
              />
              {/* Character count */}
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-slate-400">
                  {normalizedCode.length}/6 characters
                </span>
                {error && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-red-500"
                  >
                    {error}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Visual code preview */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-bold transition-all ${
                    i < normalizedCode.length
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {normalizedCode[i] || '·'}
                </div>
              ))}
            </div>

            {/* Join button */}
            <Button
              onClick={handleJoin}
              disabled={normalizedCode.length !== 6 || loading}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <DoorOpen className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Joining...' : 'Join Room'}
            </Button>

            {/* Back */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setPhase('login')}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
