"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ChatSession } from "@/types/ai";

interface ConsultantState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isStreaming: boolean;

  createSession: (channelId: string) => string;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateStreamingMessage: (sessionId: string, messageId: string, content: string) => void;
  finalizeStreamingMessage: (sessionId: string, messageId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  getActiveSession: () => ChatSession | null;
  clearSession: (sessionId: string) => void;
}

export const useConsultantStore = create<ConsultantState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isStreaming: false,

      createSession: (channelId) => {
        const id = `session-${Date.now()}`;
        const session: ChatSession = {
          id,
          channelId,
          messages: [],
          context: {
            nicheScore: null,
            roadmapProgress: 0,
            lastCompletedActions: [],
          },
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: id,
        }));
        return id;
      },

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message] }
              : s
          ),
        })),

      updateStreamingMessage: (sessionId, messageId, content) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : s
          ),
        })),

      finalizeStreamingMessage: (sessionId, messageId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId ? { ...m, isStreaming: false } : m
                  ),
                }
              : s
          ),
          isStreaming: false,
        })),

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },

      clearSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
        })),
    }),
    {
      name: "consultant-store",
      partialize: (state) => ({
        sessions: state.sessions.map((s) => ({
          ...s,
          messages: s.messages.slice(-50), // Keep last 50 messages per session
        })),
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);
