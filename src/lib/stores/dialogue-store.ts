import { create } from 'zustand';
import type {
  ClientState,
  ClientEmotion,
  DialogueChoice,
  DialogueMessage,
} from './types';

// --- Store State ---

interface DialogueState {
  messages: DialogueMessage[];
  choices: DialogueChoice[];
  client: ClientState | null;
  isAiTyping: boolean;
}

// --- Store Actions ---

interface DialogueActions {
  initClient: (client: ClientState) => void;
  addClientMessage: (text: string, emotion?: ClientEmotion) => void;
  addPlayerMessage: (text: string, choiceId?: string) => void;
  addSystemMessage: (text: string) => void;
  setChoices: (choices: DialogueChoice[]) => void;
  selectChoice: (choiceId: string) => void;
  updateClientSatisfaction: (delta: number) => void;
  updateClientPatience: (delta: number) => void;
  updateClientEmotion: (emotion: ClientEmotion) => void;
  revealNeed: (need: string) => void;
  setAiTyping: (typing: boolean) => void;
  resetDialogue: () => void;
}

// --- Helpers ---

let messageCounter = 0;

function makeMessage(
  role: DialogueMessage['role'],
  text: string,
  opts?: Partial<Pick<DialogueMessage, 'emotion' | 'choiceId'>>,
): DialogueMessage {
  messageCounter += 1;
  return {
    id: `msg-${Date.now()}-${messageCounter}`,
    role,
    text,
    timestamp: Date.now(),
    ...opts,
  };
}

// --- Initial ---

const initialState: DialogueState = {
  messages: [],
  choices: [],
  client: null,
  isAiTyping: false,
};

// --- Store ---

export const useDialogueStore = create<DialogueState & DialogueActions>()(
  (set, get) => ({
    ...initialState,

    initClient: (client) =>
      set({
        client,
        messages: [
          makeMessage('system', `You are now speaking with ${client.name}, ${client.title} at ${client.organization}.`),
        ],
        choices: [],
        isAiTyping: false,
      }),

    addClientMessage: (text, emotion) =>
      set((s) => {
        const msg = makeMessage('client', text, { emotion });
        const newClient = s.client
          ? { ...s.client, emotion: emotion ?? s.client.emotion }
          : null;
        return { messages: [...s.messages, msg], client: newClient };
      }),

    addPlayerMessage: (text, choiceId) =>
      set((s) => ({
        messages: [...s.messages, makeMessage('player', text, { choiceId })],
      })),

    addSystemMessage: (text) =>
      set((s) => ({
        messages: [...s.messages, makeMessage('system', text)],
      })),

    setChoices: (choices) => set({ choices }),

    selectChoice: (choiceId) => {
      const choice = get().choices.find((c) => c.id === choiceId);
      if (!choice) return;
      set((s) => ({
        messages: [...s.messages, makeMessage('player', choice.text, { choiceId })],
        choices: [],
      }));
    },

    updateClientSatisfaction: (delta) =>
      set((s) => {
        if (!s.client) return s;
        const satisfaction = Math.max(0, Math.min(100, s.client.satisfaction + delta));
        return { client: { ...s.client, satisfaction } };
      }),

    updateClientPatience: (delta) =>
      set((s) => {
        if (!s.client) return s;
        const patience = Math.max(0, Math.min(100, s.client.patience + delta));
        return { client: { ...s.client, patience } };
      }),

    updateClientEmotion: (emotion) =>
      set((s) => {
        if (!s.client) return s;
        return { client: { ...s.client, emotion } };
      }),

    revealNeed: (need) =>
      set((s) => {
        if (!s.client) return s;
        if (s.client.revealedNeeds.includes(need)) return s;
        return {
          client: {
            ...s.client,
            revealedNeeds: [...s.client.revealedNeeds, need],
            hiddenNeeds: s.client.hiddenNeeds.filter((n) => n !== need),
          },
        };
      }),

    setAiTyping: (isAiTyping) => set({ isAiTyping }),

    resetDialogue: () => {
      messageCounter = 0;
      set({ ...initialState });
    },
  }),
);
