// ============================================================
// ICT Support Pro — Socket.io Multiplayer Server
// Port: 3001
// ============================================================

import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ============================================================
// Types
// ============================================================

interface RoomPlayer {
  id: string;
  nickname: string;
  avatar: string;
  ready: boolean;
  score?: number;
  connected: boolean;
}

type MissionType =
  | 'survey-builder'
  | 'customer-interview'
  | 'feedback-analysis'
  | 'difficult-client'
  | 'service-improvement';

type RoomStatus = 'waiting' | 'playing' | 'finished';

interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  avatar: string;
  text: string;
  timestamp: number;
}

interface RoomData {
  id: string;
  code: string;
  hostId: string;
  missionType: MissionType;
  status: RoomStatus;
  players: RoomPlayer[];
  chat: ChatMessage[];
  scores: Record<string, number>;
  createdAt: number;
}

// ============================================================
// In-memory state
// ============================================================

const rooms = new Map<string, RoomData>();
const socketRoomMap = new Map<string, string>();   // socketId → roomCode
const socketPlayerMap = new Map<string, string>();  // socketId → playerId

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function getRoomBySocket(socketId: string): RoomData | undefined {
  const code = socketRoomMap.get(socketId);
  if (!code) return undefined;
  return rooms.get(code);
}

// ============================================================
// Socket handlers
// ============================================================

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ---- Room: Create ----
  socket.on(
    'room:create',
    (data: { playerId: string; nickname: string; avatar: string; missionType: MissionType }) => {
      const { playerId, nickname, avatar, missionType } = data;
      const code = generateRoomCode();

      const player: RoomPlayer = {
        id: playerId,
        nickname,
        avatar,
        ready: false,
        connected: true,
      };

      const room: RoomData = {
        id: generateId(),
        code,
        hostId: playerId,
        missionType,
        status: 'waiting',
        players: [player],
        chat: [],
        scores: {},
        createdAt: Date.now(),
      };

      rooms.set(code, room);
      socketRoomMap.set(socket.id, code);
      socketPlayerMap.set(socket.id, playerId);
      socket.join(code);

      socket.emit('room:created', { code, room });
      console.log(`[room:create] ${nickname} created room ${code}`);
    },
  );

  // ---- Room: Join ----
  socket.on(
    'room:join',
    (data: { code: string; playerId: string; nickname: string; avatar: string }) => {
      const { code, playerId, nickname, avatar } = data;
      const upperCode = code.toUpperCase();
      const room = rooms.get(upperCode);

      if (!room) {
        socket.emit('room:error', { message: 'Room not found' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('room:error', { message: 'Game already in progress' });
        return;
      }

      // Check if player already in room (reconnect)
      const existingPlayer = room.players.find((p) => p.id === playerId);
      if (existingPlayer) {
        existingPlayer.connected = true;
      } else {
        if (room.players.length >= 8) {
          socket.emit('room:error', { message: 'Room is full (max 8 players)' });
          return;
        }

        const player: RoomPlayer = {
          id: playerId,
          nickname,
          avatar,
          ready: false,
          connected: true,
        };
        room.players.push(player);
      }

      socketRoomMap.set(socket.id, upperCode);
      socketPlayerMap.set(socket.id, playerId);
      socket.join(upperCode);

      // System chat message
      const sysMsg: ChatMessage = {
        id: generateId(),
        playerId: 'system',
        nickname: 'System',
        avatar: '',
        text: `${nickname} joined the room`,
        timestamp: Date.now(),
      };
      room.chat.push(sysMsg);

      // Send room state to the joiner
      socket.emit('room:joined', { code: upperCode, room });

      // Notify others
      socket.to(upperCode).emit('room:player-joined', {
        player: existingPlayer || room.players[room.players.length - 1],
        room,
      });

      // Broadcast chat
      io.to(upperCode).emit('room:chat', { message: sysMsg });

      console.log(`[room:join] ${nickname} joined room ${upperCode}`);
    },
  );

  // ---- Room: Leave ----
  socket.on('room:leave', () => {
    const code = socketRoomMap.get(socket.id);
    const playerId = socketPlayerMap.get(socket.id);
    if (!code || !playerId) return;

    const room = rooms.get(code);
    if (!room) return;

    const leavingPlayer = room.players.find((p) => p.id === playerId);
    if (!leavingPlayer) return;

    room.players = room.players.filter((p) => p.id !== playerId);

    const sysMsg: ChatMessage = {
      id: generateId(),
      playerId: 'system',
      nickname: 'System',
      avatar: '',
      text: `${leavingPlayer.nickname} left the room`,
      timestamp: Date.now(),
    };
    room.chat.push(sysMsg);

    socket.leave(code);
    socketRoomMap.delete(socket.id);
    socketPlayerMap.delete(socket.id);

    socket.emit('room:left');

    if (room.players.length === 0) {
      rooms.delete(code);
      console.log(`[room:cleanup] Room ${code} deleted (empty)`);
    } else {
      // Transfer host if needed
      if (room.hostId === playerId) {
        room.hostId = room.players[0].id;
      }

      io.to(code).emit('room:player-left', {
        playerId,
        room,
      });
      io.to(code).emit('room:chat', { message: sysMsg });
    }

    console.log(`[room:leave] ${leavingPlayer.nickname} left room ${code}`);
  });

  // ---- Room: Ready Toggle ----
  socket.on('room:ready', (data: { playerId: string }) => {
    const room = getRoomBySocket(socket.id);
    if (!room) {
      socket.emit('room:error', { message: 'Not in a room' });
      return;
    }

    const player = room.players.find((p) => p.id === data.playerId);
    if (!player) {
      socket.emit('room:error', { message: 'Player not found in room' });
      return;
    }

    player.ready = !player.ready;

    io.to(room.code).emit('room:ready-updated', {
      playerId: data.playerId,
      ready: player.ready,
      room,
    });

    console.log(`[room:ready] ${player.nickname} is ${player.ready ? 'ready' : 'not ready'}`);
  });

  // ---- Room: Chat ----
  socket.on(
    'room:chat',
    (data: { playerId: string; nickname: string; avatar: string; text: string }) => {
      const room = getRoomBySocket(socket.id);
      if (!room) return;

      const message: ChatMessage = {
        id: generateId(),
        playerId: data.playerId,
        nickname: data.nickname,
        avatar: data.avatar,
        text: data.text,
        timestamp: Date.now(),
      };

      room.chat.push(message);
      io.to(room.code).emit('room:chat', { message });

      console.log(`[room:chat] ${data.nickname}: ${data.text.substring(0, 50)}`);
    },
  );

  // ---- Mission: Start ----
  socket.on('mission:start', (data: { playerId: string }) => {
    const room = getRoomBySocket(socket.id);
    if (!room) {
      socket.emit('room:error', { message: 'Not in a room' });
      return;
    }

    // Only host can start
    if (room.hostId !== data.playerId) {
      socket.emit('room:error', { message: 'Only the host can start the game' });
      return;
    }

    // All players must be ready
    const allReady = room.players.every((p) => p.ready);
    if (!allReady) {
      socket.emit('room:error', { message: 'All players must be ready' });
      return;
    }

    // Min 2 players
    if (room.players.length < 2) {
      socket.emit('room:error', { message: 'Need at least 2 players' });
      return;
    }

    room.status = 'playing';

    const sysMsg: ChatMessage = {
      id: generateId(),
      playerId: 'system',
      nickname: 'System',
      avatar: '',
      text: `Mission started: ${room.missionType}`,
      timestamp: Date.now(),
    };
    room.chat.push(sysMsg);

    io.to(room.code).emit('mission:started', {
      missionType: room.missionType,
      room,
    });
    io.to(room.code).emit('room:chat', { message: sysMsg });

    console.log(`[mission:start] Room ${room.code} started ${room.missionType}`);
  });

  // ---- Mission: Progress ----
  socket.on(
    'mission:progress',
    (data: { playerId: string; progress: number; details?: Record<string, unknown> }) => {
      const room = getRoomBySocket(socket.id);
      if (!room) return;

      io.to(room.code).emit('mission:player-progress', {
        playerId: data.playerId,
        progress: data.progress,
        details: data.details,
      });
    },
  );

  // ---- Mission: Complete ----
  socket.on(
    'mission:complete',
    (data: { playerId: string; score: number; breakdown?: Record<string, number> }) => {
      const room = getRoomBySocket(socket.id);
      if (!room) return;

      room.scores[data.playerId] = data.score;

      // Update player score
      const player = room.players.find((p) => p.id === data.playerId);
      if (player) player.score = data.score;

      io.to(room.code).emit('mission:player-complete', {
        playerId: data.playerId,
        score: data.score,
        breakdown: data.breakdown,
      });

      // Check if all players have completed
      const allCompleted = room.players.every((p) => room.scores[p.id] !== undefined);
      if (allCompleted) {
        room.status = 'finished';

        io.to(room.code).emit('mission:all-complete', {
          scores: room.scores,
          room,
        });

        console.log(`[mission:complete] All players completed in room ${room.code}`);
      }
    },
  );

  // ---- Leaderboard ----
  socket.on('leaderboard:request', (data: { roomCode?: string }) => {
    if (data.roomCode) {
      const room = rooms.get(data.roomCode.toUpperCase());
      if (room) {
        const entries = room.players
          .map((p) => ({
            playerId: p.id,
            nickname: p.nickname,
            avatar: p.avatar,
            score: room.scores[p.id] ?? 0,
          }))
          .sort((a, b) => b.score - a.score);

        socket.emit('leaderboard:data', { entries, roomCode: room.code });
      } else {
        socket.emit('leaderboard:data', { entries: [], roomCode: data.roomCode });
      }
    } else {
      // Global leaderboard from all rooms
      const allScores: Array<{
        playerId: string;
        nickname: string;
        avatar: string;
        score: number;
      }> = [];

      for (const room of rooms.values()) {
        for (const player of room.players) {
          const existing = allScores.find((s) => s.playerId === player.id);
          const score = room.scores[player.id] ?? 0;
          if (existing) {
            existing.score += score;
          } else {
            allScores.push({
              playerId: player.id,
              nickname: player.nickname,
              avatar: player.avatar,
              score,
            });
          }
        }
      }

      allScores.sort((a, b) => b.score - a.score);
      socket.emit('leaderboard:data', { entries: allScores.slice(0, 20), roomCode: null });
    }
  });

  // ---- Disconnect ----
  socket.on('disconnect', () => {
    const code = socketRoomMap.get(socket.id);
    const playerId = socketPlayerMap.get(socket.id);

    socketRoomMap.delete(socket.id);
    socketPlayerMap.delete(socket.id);

    if (!code || !playerId) {
      console.log(`[disconnect] ${socket.id} (not in room)`);
      return;
    }

    const room = rooms.get(code);
    if (!room) return;

    // Mark player as disconnected (but keep them in the room for reconnection)
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.connected = false;
      io.to(code).emit('room:player-disconnected', { playerId, room });
    }

    // Schedule cleanup if all players are disconnected
    const connectedPlayers = room.players.filter((p) => p.connected);
    if (connectedPlayers.length === 0) {
      setTimeout(() => {
        const currentRoom = rooms.get(code);
        if (currentRoom) {
          const stillConnected = currentRoom.players.filter((p) => p.connected);
          if (stillConnected.length === 0) {
            rooms.delete(code);
            console.log(`[room:cleanup] Room ${code} deleted (all disconnected)`);
          }
        }
      }, 5 * 60 * 1000);
    }

    console.log(`[disconnect] ${playerId} from room ${code}`);
  });

  // ---- Error handler ----
  socket.on('error', (error) => {
    console.error(`[socket:error] ${socket.id}:`, error);
  });
});

// ============================================================
// Start server
// ============================================================

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`ICT Support Pro Socket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  io.close();
  httpServer.close(() => {
    console.log('Socket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  io.close();
  httpServer.close(() => {
    console.log('Socket server closed');
    process.exit(0);
  });
});
