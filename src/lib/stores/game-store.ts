import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppPhase,
  GameMode,
  MissionType,
  MissionPhase,
  MissionScore,
} from './types';

// --- Badge definition (lightweight, details in constants.ts) ---

export interface EarnedBadge {
  badgeId: string;
  earnedAt: number;
}

// --- Store State ---

interface GameState {
  // Core
  phase: AppPhase;
  gameMode: GameMode;
  playerId: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;

  // Mission
  currentMissionId: string | null;
  currentMissionType: MissionType | null;
  missionPhase: MissionPhase;
  missionTimer: number;           // seconds remaining
  missionTimerActive: boolean;

  // Progress
  completedMissionIds: string[];
  missionScores: MissionScore[];
  earnedBadgeIds: string[];

  // UI
  isTransitioning: boolean;
  showHint: boolean;
  currentHint: string;
  showAchievement: boolean;
  latestBadgeId: string | null;
}

// --- Store Actions ---

interface GameActions {
  // Phase
  setPhase: (phase: AppPhase) => void;
  setGameMode: (mode: GameMode) => void;

  // Login / Profile
  login: (playerId: string, nickname: string, avatar: string) => void;
  updateProfile: (nickname: string, avatar: string) => void;

  // Mission lifecycle
  startMission: (missionId: string, missionType: MissionType) => void;
  setMissionPhase: (phase: MissionPhase) => void;
  setMissionTimer: (seconds: number) => void;
  setMissionTimerActive: (active: boolean) => void;
  completeMission: (score: MissionScore) => void;

  // XP & Level
  addXp: (amount: number) => void;

  // Badges
  earnBadge: (badgeId: string) => void;
  dismissAchievement: () => void;

  // Hints
  setShowHint: (show: boolean, hint?: string) => void;

  // Transition
  setIsTransitioning: (val: boolean) => void;

  // Reset
  resetMissionState: () => void;
  resetAll: () => void;
}

// --- Helpers ---

const XP_PER_LEVEL = 200;

function computeLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// --- Initial State ---

const initialMissionState = {
  currentMissionId: null as string | null,
  currentMissionType: null as MissionType | null,
  missionPhase: 'briefing' as MissionPhase,
  missionTimer: 0,
  missionTimerActive: false,
};

const initialUiState = {
  isTransitioning: false,
  showHint: false,
  currentHint: '',
  showAchievement: false,
  latestBadgeId: null as string | null,
};

// --- Store ---

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // Core defaults
      phase: 'login',
      gameMode: 'solo',
      playerId: '',
      nickname: '',
      avatar: '',
      xp: 0,
      level: 1,

      ...initialMissionState,
      completedMissionIds: [],
      missionScores: [],
      earnedBadgeIds: [],
      ...initialUiState,

      // --- Actions ---

      setPhase: (phase) => set({ phase }),

      setGameMode: (gameMode) => set({ gameMode }),

      login: (playerId, nickname, avatar) =>
        set({ playerId, nickname, avatar, phase: 'lobby' }),

      updateProfile: (nickname, avatar) => set({ nickname, avatar }),

      startMission: (missionId, missionType) =>
        set({
          currentMissionId: missionId,
          currentMissionType: missionType,
          missionPhase: 'briefing',
          missionTimer: 0,
          missionTimerActive: false,
          phase: 'mission-active',
        }),

      setMissionPhase: (missionPhase) => set({ missionPhase }),

      setMissionTimer: (missionTimer) => set({ missionTimer }),

      setMissionTimerActive: (missionTimerActive) => set({ missionTimerActive }),

      completeMission: (score) => {
        const state = get();
        const alreadyCompleted = state.completedMissionIds.includes(score.missionId);
        const newCompleted = alreadyCompleted
          ? state.completedMissionIds
          : [...state.completedMissionIds, score.missionId];
        const newXp = state.xp + score.xpEarned;
        const newLevel = computeLevel(newXp);

        set({
          completedMissionIds: newCompleted,
          missionScores: [...state.missionScores, score],
          xp: newXp,
          level: newLevel,
          missionPhase: 'scoring',
          missionTimerActive: false,
        });
      },

      addXp: (amount) => {
        const newXp = get().xp + amount;
        set({ xp: newXp, level: computeLevel(newXp) });
      },

      earnBadge: (badgeId) => {
        const state = get();
        if (state.earnedBadgeIds.includes(badgeId)) return;
        set({
          earnedBadgeIds: [...state.earnedBadgeIds, badgeId],
          showAchievement: true,
          latestBadgeId: badgeId,
        });
      },

      dismissAchievement: () => set({ showAchievement: false, latestBadgeId: null }),

      setShowHint: (show, hint = '') => set({ showHint: show, currentHint: hint }),

      setIsTransitioning: (isTransitioning) => set({ isTransitioning }),

      resetMissionState: () => set({ ...initialMissionState, ...initialUiState }),

      resetAll: () =>
        set({
          phase: 'login',
          gameMode: 'solo',
          ...initialMissionState,
          ...initialUiState,
        }),
    }),
    {
      name: 'ict-support-pro-game',
      partialize: (state) => ({
        playerId: state.playerId,
        nickname: state.nickname,
        avatar: state.avatar,
        xp: state.xp,
        level: state.level,
        earnedBadgeIds: state.earnedBadgeIds,
        completedMissionIds: state.completedMissionIds,
        missionScores: state.missionScores,
      }),
    },
  ),
);
