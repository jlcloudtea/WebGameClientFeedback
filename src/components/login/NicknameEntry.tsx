'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { AVATAR_OPTIONS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Gamepad2, Users, GraduationCap } from 'lucide-react';

export default function NicknameEntry() {
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const login = useGameStore((s) => s.login);
  const setPhase = useGameStore((s) => s.setPhase);

  const [inputNickname, setInputNickname] = useState(nickname || '');
  const [selectedAvatar, setSelectedAvatar] = useState(avatar || AVATAR_OPTIONS[0].emoji);

  const canProceed = inputNickname.trim().length >= 2;

  const handleSoloStart = () => {
    if (!canProceed) return;
    const playerId = `player-${Date.now()}`;
    login(playerId, inputNickname.trim(), selectedAvatar);
    setPhase('dashboard');
  };

  const handleMultiplayer = () => {
    if (!canProceed) return;
    const playerId = `player-${Date.now()}`;
    login(playerId, inputNickname.trim(), selectedAvatar);
    setPhase('lobby');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Gradient top banner */}
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-6xl mb-3"
            >
              🛠️
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              ICT Support Pro
            </h1>
            <p className="text-amber-100 text-sm mt-1 font-medium">
              Customer Service Training Simulator
            </p>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* Nickname input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="h-4 w-4 text-amber-500" />
                Your Nickname
              </label>
              <Input
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                placeholder="Enter your nickname..."
                className="h-11 text-base rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canProceed) handleSoloStart();
                }}
              />
            </div>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(opt.emoji)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-colors cursor-pointer ${
                      selectedAvatar === opt.emoji
                        ? 'border-amber-400 bg-amber-50 shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleSoloStart}
                disabled={!canProceed}
                className="h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200 transition-all"
              >
                <Gamepad2 className="h-5 w-5 mr-2" />
                Start Learning
              </Button>

              <Button
                onClick={handleMultiplayer}
                disabled={!canProceed}
                variant="outline"
                className="h-12 text-base font-semibold rounded-xl border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Classroom
              </Button>
            </div>

            {/* Teacher link */}
            <div className="text-center pt-2">
              <button
                onClick={() => setPhase('teacher')}
                className="text-xs text-slate-400 hover:text-amber-600 transition-colors inline-flex items-center gap-1"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Teacher Login
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
