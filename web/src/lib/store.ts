import { create } from 'zustand';

export type Register = 'S' | 'I' | 'R';
export type CardVariant = 'observation' | 'hypothesis' | 'counterexample' | 'synthesis' | 'report';
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface AnalysisCard {
  variant: CardVariant;
  tag: string;
  content: string;
  register?: Register;
  meta?: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  cards?: AnalysisCard[];
  phase?: number;
  streaming?: boolean;
  attachments?: string[];
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentPhase: number;
  sidebarTab: 'perspectives' | 'documents' | 'search' | 'interview' | 'settings';
  sidebarOpen: boolean;
  interviewSessionId: string | null;
  interviewQuestionId: string | null;
  mode: 'analysis' | 'dialectical' | 'interview' | 'chat';
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, text: string) => void;
  addCardToMessage: (id: string, card: AnalysisCard) => void;
  setStreaming: (v: boolean) => void;
  setPhase: (n: number) => void;
  setSidebarTab: (tab: ChatState['sidebarTab']) => void;
  setSidebarOpen: (v: boolean) => void;
  setInterviewSessionId: (id: string | null) => void;
  setInterviewQuestionId: (id: string | null) => void;
  setMode: (m: ChatState['mode']) => void;
  clearMessages: () => void;
  loadMessages: () => void;
  saveMessages: () => void;
}

const STORAGE_KEY = 'hermeneut_chat_messages';
const MAX_STORED = 100;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  currentPhase: 0,
  sidebarTab: 'perspectives',
  sidebarOpen: true,
  interviewSessionId: null,
  interviewQuestionId: null,
  mode: 'chat',

  addMessage: (msg) => {
    const id = crypto.randomUUID();
    set((s) => {
      const messages = [...s.messages, { ...msg, id, timestamp: Date.now() }];
      return { messages };
    });
    get().saveMessages();
    return id;
  },

  updateMessage: (id, patch) => {
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
    get().saveMessages();
  },

  appendToMessage: (id, text) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + text } : m
      ),
    }));
  },

  addCardToMessage: (id, card) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, cards: [...(m.cards || []), card] } : m
      ),
    }));
  },

  setStreaming: (v) => set({ isStreaming: v }),
  setPhase: (n) => set({ currentPhase: n }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setInterviewSessionId: (id) => set({ interviewSessionId: id }),
  setInterviewQuestionId: (id) => set({ interviewQuestionId: id }),
  setMode: (m) => set({ mode: m }),

  clearMessages: () => {
    set({ messages: [] });
    localStorage.removeItem(STORAGE_KEY);
  },

  loadMessages: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const msgs: ChatMessage[] = JSON.parse(raw);
        set({ messages: msgs });
      }
    } catch { /* ignore */ }
  },

  saveMessages: () => {
    const msgs = get().messages.slice(-MAX_STORED);
    const stripped = msgs.map(({ streaming, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
  },
}));
