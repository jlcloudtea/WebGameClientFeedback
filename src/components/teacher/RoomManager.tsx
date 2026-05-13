'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Plus, Trash2, Users, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MISSION_TYPES } from '@/lib/constants';
import type { MissionType } from '@/lib/stores/types';

interface ManagedRoom {
  id: string;
  code: string;
  name: string;
  missionType: MissionType;
  status: string;
  playerCount: number;
  maxPlayers: number;
  currentMission?: string;
}

interface RoomManagerProps {
  rooms: ManagedRoom[];
  onCreateRoom: (data: { name: string; missionType: MissionType; maxPlayers: number }) => void;
  onDeleteRoom: (roomId: string) => void;
}

export default function RoomManager({ rooms, onCreateRoom, onDeleteRoom }: RoomManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [missionType, setMissionType] = useState<MissionType>('survey-builder');
  const [maxPlayers, setMaxPlayers] = useState(4);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateRoom({ name: name.trim(), missionType, maxPlayers });
    setName('');
    setShowForm(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const statusColors: Record<string, string> = {
    LOBBY: 'border-amber-400 text-amber-600',
    ACTIVE: 'border-emerald-400 text-emerald-600',
    COMPLETED: 'border-slate-400 text-slate-600',
  };

  return (
    <div className="space-y-4">
      {/* Create room button */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Game Rooms</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Room
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name (e.g. Monday Lab)"
                maxLength={50}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={missionType}
                  onValueChange={(v) => setMissionType(v as MissionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MISSION_TYPES.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.icon} {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={maxPlayers.toString()}
                  onValueChange={(v) => setMaxPlayers(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} players
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Room list */}
      {rooms.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Gamepad2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No rooms created yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{room.name}</span>
                        <Badge variant="outline" className={statusColors[room.status] ?? ''}>
                          {room.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {room.playerCount}/{room.maxPlayers}
                        </span>
                        {room.currentMission && (
                          <span>{room.currentMission}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Copy code */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(room.code)}
                        className="font-mono text-amber-600"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {room.code}
                      </Button>
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRoom(room.id)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
