import { create } from 'zustand';
import type { RoomState, RoomPlayer, MissionType } from './types';

// --- Store State ---

interface RoomStoreState {
  room: RoomState | null;
  isConnected: boolean;
  socketId: string | null;
}

// --- Store Actions ---

interface RoomStoreActions {
  joinRoom: (room: RoomState) => void;
  leaveRoom: () => void;
  setReady: (playerId: string) => void;
  unsetReady: (playerId: string) => void;
  updateRoomState: (updates: Partial<RoomState>) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<RoomPlayer>) => void;
  setConnected: (connected: boolean, socketId?: string) => void;
  setRoomMissionType: (missionType: MissionType) => void;
  setRoomStatus: (status: RoomState['status']) => void;
  resetRoom: () => void;
}

// --- Initial ---

const initialState: RoomStoreState = {
  room: null,
  isConnected: false,
  socketId: null,
};

// --- Store ---

export const useRoomStore = create<RoomStoreState & RoomStoreActions>()(
  (set) => ({
    ...initialState,

    joinRoom: (room) => set({ room }),

    leaveRoom: () => set({ room: null }),

    setReady: (playerId) =>
      set((s) => {
        if (!s.room) return s;
        return {
          room: {
            ...s.room,
            players: s.room.players.map((p) =>
              p.id === playerId ? { ...p, ready: true } : p,
            ),
          },
        };
      }),

    unsetReady: (playerId) =>
      set((s) => {
        if (!s.room) return s;
        return {
          room: {
            ...s.room,
            players: s.room.players.map((p) =>
              p.id === playerId ? { ...p, ready: false } : p,
            ),
          },
        };
      }),

    updateRoomState: (updates) =>
      set((s) => {
        if (!s.room) return s;
        return { room: { ...s.room, ...updates } };
      }),

    addPlayer: (player) =>
      set((s) => {
        if (!s.room) return s;
        return {
          room: { ...s.room, players: [...s.room.players, player] },
        };
      }),

    removePlayer: (playerId) =>
      set((s) => {
        if (!s.room) return s;
        return {
          room: {
            ...s.room,
            players: s.room.players.filter((p) => p.id !== playerId),
          },
        };
      }),

    updatePlayer: (playerId, updates) =>
      set((s) => {
        if (!s.room) return s;
        return {
          room: {
            ...s.room,
            players: s.room.players.map((p) =>
              p.id === playerId ? { ...p, ...updates } : p,
            ),
          },
        };
      }),

    setConnected: (connected, socketId) =>
      set({ isConnected: connected, socketId: socketId ?? null }),

    setRoomMissionType: (missionType) =>
      set((s) => {
        if (!s.room) return s;
        return { room: { ...s.room, missionType } };
      }),

    setRoomStatus: (status) =>
      set((s) => {
        if (!s.room) return s;
        return { room: { ...s.room, status } };
      }),

    resetRoom: () => set({ ...initialState }),
  }),
);
