'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherLoginProps {
  onLogin: (teacher: { id: string; nickname: string }) => void;
}

export default function TeacherLogin({ onLogin }: TeacherLoginProps) {
  const [nickname, setNickname] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || passcode.length !== 4) {
      setError('Please enter a nickname and 4-digit passcode.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/teacher?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim(), passcode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const teacher = await res.json();
      onLogin(teacher.teacher);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Teacher Login</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nickname
                </label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  maxLength={30}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  4-Digit Passcode
                </label>
                <Input
                  value={passcode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPasscode(val);
                  }}
                  placeholder="••••"
                  maxLength={4}
                  type="password"
                  className="text-center tracking-[0.5em] text-lg"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600"
                disabled={loading || !nickname.trim() || passcode.length !== 4}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
