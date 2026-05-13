'use client';

import { motion } from 'framer-motion';
import { Copy, LogOut, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGameStore } from '@/lib/stores/game-store';
import { useRoomStore } from '@/lib/stores/room-store';
import { useSocket } from '@/hooks/use-socket';
import { MISSION_TYPES } from '@/lib/constants';
import PlayerCard from './PlayerCard';
import RoomChat from './RoomChat';

export default function LobbyRoom() {
  const playerId = useGameStore((s) => s.playerId);
  const room = useRoomStore((s) => s.room);
  const setPhase = useGameStore((s) => s.setPhase);

  const {
    chatMessages,
    sendChat,
    toggleReady,
    leaveRoom,
    startMission,
    isConnected,
  } = useSocket();

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-500 mb-4">No room joined yet.</p>
            <Button variant="outline" onClick={() => setPhase('dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const isHost = room.hostId === playerId;
  const allReady = room.players.every((p) => p.ready);
  const canStart = isHost && allReady && room.players.length >= 2 && room.status === 'waiting';

  const missionDef = MISSION_TYPES.find((m) => m.id === room.missionType);

  const copyCode = () => {
    navigator.clipboard.writeText(room.id.slice(0, 6).toUpperCase());
  };

  const handleLeave = () => {
    leaveRoom();
    setPhase('dashboard');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Room Header */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-800">Waiting Room</h2>
                  <Badge
                    variant={room.status === 'waiting' ? 'outline' : 'default'}
                    className={
                      room.status === 'waiting'
                        ? 'border-amber-400 text-amber-600'
                        : 'bg-emerald-500'
                    }
                  >
                    {room.status === 'waiting' ? 'Waiting' : room.status === 'playing' ? 'In Progress' : 'Finished'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {missionDef?.icon} {missionDef?.title ?? room.missionType}
                </p>
              </div>

              {/* Room Code */}
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Room Code
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-mono font-bold tracking-widest text-amber-600">
                      {room.id.slice(0, 6).toUpperCase()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content: Players + Chat */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Players panel */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Players ({room.players.length}/8)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {room.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isHost={player.id === room.hostId}
                />
              ))}
            </CardContent>
          </Card>

          {/* Chat panel */}
          <Card className="md:col-span-3 flex flex-col min-h-[300px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <RoomChat
                messages={chatMessages}
                onSend={sendChat}
                currentPlayerId={playerId ?? ''}
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Ready toggle */}
            <Button
              size="lg"
              onClick={toggleReady}
              disabled={!isConnected || room.status !== 'waiting'}
              className={
                currentPlayer?.ready
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }
            >
              {currentPlayer?.ready ? '✓ Ready' : 'Set Ready'}
            </Button>

            {/* Start Game (host only) */}
            {isHost && (
              <Button
                size="lg"
                onClick={startMission}
                disabled={!canStart || !isConnected}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleLeave}
            className="text-rose-500 border-rose-200 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
        </div>

        {/* Host notice */}
        {isHost && !canStart && room.status === 'waiting' && (
          <p className="text-xs text-center text-slate-400">
            {!allReady
              ? 'All players must be ready before starting.'
              : room.players.length < 2
                ? 'Need at least 2 players to start.'
                : ''}
          </p>
        )}
      </motion.div>
    </div>
  );
}
