'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/lib/stores/game-store';
import { useRoomStore } from '@/lib/stores/room-store';
import type { RoomState, MissionType } from '@/lib/stores/types';

// ============================================================
// Socket Hook — connects only when gameMode is 'multiplayer'
// ============================================================

interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const gameMode = useGameStore((s) => s.gameMode);
  const playerId = useGameStore((s) => s.playerId);
  const nickname = useGameStore((s) => s.nickname);
  const avatar = useGameStore((s) => s.avatar);
  const setPhase = useGameStore((s) => s.setPhase);
  const storeStartMission = useGameStore((s) => s.startMission);

  const setConnected = useRoomStore((s) => s.setConnected);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const updateRoomState = useRoomStore((s) => s.updateRoomState);
  const addPlayer = useRoomStore((s) => s.addPlayer);
  const removePlayer = useRoomStore((s) => s.removePlayer);
  const updatePlayer = useRoomStore((s) => s.updatePlayer);
  const resetRoom = useRoomStore((s) => s.resetRoom);

  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- Connect / Disconnect ----
  useEffect(() => {
    if (gameMode !== 'multiplayer') return;

    const socket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnected(true, socket.id);
      setError(null);
      console.log('[socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setConnected(false);
      console.log('[socket] Disconnected');
    });

    // ---- Room events ----
    socket.on('room:created', (data: { code: string; room: RoomState }) => {
      setRoomCode(data.code);
      joinRoom(data.room);
      setPhase('lobby');
    });

    socket.on('room:joined', (data: { code: string; room: RoomState }) => {
      setRoomCode(data.code);
      joinRoom(data.room);
      // Load existing chat
      setChatMessages(data.room.chat || []);
      setPhase('lobby');
    });

    socket.on('room:player-joined', (data: { player: RoomState['players'][0]; room: RoomState }) => {
      updateRoomState(data.room);
      addPlayer(data.player);
    });

    socket.on('room:player-left', (data: { playerId: string; room: RoomState }) => {
      removePlayer(data.playerId);
      updateRoomState(data.room);
    });

    socket.on('room:player-disconnected', (data: { playerId: string; room: RoomState }) => {
      updatePlayer(data.playerId, { connected: false });
      updateRoomState(data.room);
    });

    socket.on('room:ready-updated', (data: { playerId: string; ready: boolean; room: RoomState }) => {
      updatePlayer(data.playerId, { ready: data.ready });
      updateRoomState(data.room);
    });

    socket.on('room:chat', (data: { message: ChatMessage }) => {
      setChatMessages((prev) => [...prev, data.message]);
    });

    socket.on('room:left', () => {
      setRoomCode(null);
      setChatMessages([]);
      resetRoom();
      setPhase('dashboard');
    });

    socket.on('room:error', (data: { message: string }) => {
      setError(data.message);
      setTimeout(() => setError(null), 5000);
    });

    // ---- Mission events ----
    socket.on('mission:started', (data: { missionType: MissionType; room: RoomState }) => {
      updateRoomState(data.room);
      storeStartMission(data.missionType, data.missionType);
    });

    socket.on('mission:player-progress', () => {
      // Could be used for real-time progress display
    });

    socket.on('mission:player-complete', () => {
      // Could update leaderboard in real-time
    });

    socket.on('mission:all-complete', (data: { scores: Record<string, number>; room: RoomState }) => {
      updateRoomState(data.room);
    });

    // ---- Leaderboard ----
    socket.on('leaderboard:data', () => {
      // Handle leaderboard data
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameMode]);

  // ---- Emit helpers ----
  const createRoom = useCallback(
    (missionType: MissionType) => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('room:create', {
        playerId,
        nickname,
        avatar,
        missionType,
      });
    },
    [playerId, nickname, avatar],
  );

  const joinRoomByCode = useCallback(
    (code: string) => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('room:join', {
        code,
        playerId,
        nickname,
        avatar,
      });
    },
    [playerId, nickname, avatar],
  );

  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:leave');
  }, []);

  const toggleReady = useCallback(() => {
    if (!socketRef.current || !playerId) return;
    socketRef.current.emit('room:ready', { playerId });
  }, [playerId]);

  const sendChat = useCallback(
    (text: string) => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('room:chat', {
        playerId,
        nickname,
        avatar,
        text,
      });
    },
    [playerId, nickname, avatar],
  );

  const emitStartMission = useCallback(
    () => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('mission:start', { playerId });
    },
    [playerId],
  );

  const sendProgress = useCallback(
    (progress: number, details?: Record<string, unknown>) => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('mission:progress', { playerId, progress, details });
    },
    [playerId],
  );

  const completeMission = useCallback(
    (score: number, breakdown?: Record<string, number>) => {
      if (!socketRef.current || !playerId) return;
      socketRef.current.emit('mission:complete', { playerId, score, breakdown });
    },
    [playerId],
  );

  const requestLeaderboard = useCallback((roomCodeArg?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leaderboard:request', { roomCode: roomCodeArg });
  }, []);

  return {
    isConnected,
    roomCode,
    chatMessages,
    error,
    createRoom,
    joinRoomByCode,
    leaveRoom,
    toggleReady,
    sendChat,
    startMission: emitStartMission,
    sendProgress,
    completeMission,
    requestLeaderboard,
  };
}
