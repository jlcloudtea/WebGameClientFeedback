// ============================================================
// ICT Support Pro — Game Type Definitions
// ============================================================

// --- App-level ---

export type AppPhase =
  | 'login'
  | 'lobby'
  | 'dashboard'
  | 'mission-active'
  | 'mission-summary'
  | 'achievements'
  | 'teacher'
  | 'leaderboard';

export type GameMode = 'solo' | 'multiplayer';

// --- Missions ---

export type MissionType =
  | 'survey-builder'
  | 'customer-interview'
  | 'feedback-analysis'
  | 'difficult-client'
  | 'service-improvement';

export type MissionPhase = 'briefing' | 'active' | 'review' | 'scoring';

// --- Survey ---

export type SurveyQuestionType =
  | 'quantitative-rating'
  | 'quantitative-multiple'
  | 'quantitative-scale'
  | 'qualitative-open'
  | 'qualitative-yesno';

export interface SurveyQuestionDraft {
  id: string;
  type: SurveyQuestionType;
  text: string;
  required: boolean;
  options?: string[];        // for multiple-choice
  scaleMin?: number;         // for scale
  scaleMax?: number;         // for scale
  scaleLabel?: string;       // for scale
}

export interface SurveyDraft {
  title: string;
  description: string;
  questions: SurveyQuestionDraft[];
}

// --- Dialogue ---

export type ClientEmotion =
  | 'neutral'
  | 'happy'
  | 'frustrated'
  | 'confused'
  | 'angry'
  | 'relieved'
  | 'satisfied';

export interface DialogueChoice {
  id: string;
  text: string;
  empathyScore: number;     // 0-1
  professionalismScore: number;
  nextMessageId?: string;
  feedback?: string;
}

export interface DialogueMessage {
  id: string;
  role: 'client' | 'player' | 'system';
  text: string;
  emotion?: ClientEmotion;
  timestamp: number;
  choiceId?: string;        // which choice led here (for player messages)
}

export interface ClientState {
  name: string;
  title: string;
  organization: string;
  avatar: string;
  satisfaction: number;     // 0-100
  patience: number;         // 0-100
  revealedNeeds: string[];
  hiddenNeeds: string[];
  emotion: ClientEmotion;
}

// --- Feedback Analysis ---

export interface FeedbackItem {
  id: string;
  text: string;
  source: string;           // e.g. "Survey Response #12"
  sentiment: 'positive' | 'negative' | 'neutral';
  category?: string;        // assigned during gameplay
  priority?: 'high' | 'medium' | 'low';
}

// --- Scoring ---

export interface MissionScore {
  missionId: string;
  missionType: MissionType;
  totalScore: number;       // 0-100
  empathy: number;          // 0-100
  professionalism: number;  // 0-100
  accuracy: number;         // 0-100
  communication: number;    // 0-100
  timeBonus: number;        // 0-100
  xpEarned: number;
  completedAt: number;      // timestamp
}

// --- Multiplayer / Rooms ---

export interface RoomPlayer {
  id: string;
  nickname: string;
  avatar: string;
  ready: boolean;
  score?: number;
  connected: boolean;
}

export interface RoomState {
  id: string;
  hostId: string;
  missionType: MissionType;
  status: 'waiting' | 'playing' | 'finished';
  players: RoomPlayer[];
  createdAt: number;
}

// --- Leaderboard ---

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  avatar: string;
  xp: number;
  level: number;
  missionsCompleted: number;
  averageScore: number;
}
