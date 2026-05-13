'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/stores/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, ArrowLeft, Sparkles } from 'lucide-react';

export default function ModeSelector() {
  const setGameMode = useGameStore((s) => s.setGameMode);
  const setPhase = useGameStore((s) => s.setPhase);

  const handleSolo = () => {
    setGameMode('solo');
    setPhase('dashboard');
  };

  const handleMultiplayer = () => {
    setGameMode('multiplayer');
    setPhase('lobby');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Choose Your Mode</h2>
          <p className="text-slate-500 mt-1">
            How would you like to practice today?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Solo Mode Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className="cursor-pointer border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all rounded-2xl overflow-hidden h-full"
              onClick={handleSolo}
            >
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center">
                <Gamepad2 className="h-12 w-12 text-white mx-auto" />
              </div>
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="text-xl font-bold text-slate-800">Solo Mode</h3>
                <p className="text-sm text-slate-500">
                  Practice at your own pace with AI clients. No pressure — learn and improve on your own schedule.
                </p>
                <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  Perfect for beginners
                </div>
                <Button
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                >
                  Play Solo
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Multiplayer Mode Card */}
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className="cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all rounded-2xl overflow-hidden h-full"
              onClick={handleMultiplayer}
            >
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-center">
                <Users className="h-12 w-12 text-white mx-auto" />
              </div>
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="text-xl font-bold text-slate-800">Multiplayer Mode</h3>
                <p className="text-sm text-slate-500">
                  Join your classmates in real-time. Compete, collaborate, and learn together in a shared classroom.
                </p>
                <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-medium">
                  <Users className="h-3.5 w-3.5" />
                  Room code required
                </div>
                <Button
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
                >
                  Join Classroom
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back button */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setPhase('login')}
            className="text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
