"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, DashboardMetrics } from "@/types";

interface UserState {
  user: AppUser | null;
  activeChannelId: string | null;
  metrics: DashboardMetrics;
  setUser: (user: AppUser | null) => void;
  setActiveChannel: (channelId: string | null) => void;
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void;
  reset: () => void;
}

const DEFAULT_METRICS: DashboardMetrics = {
  nicheScore: null,
  videosPublished: 0,
  daysToMonetization: null,
  projectedRevenue90d: null,
  roadmapProgress: 0,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      activeChannelId: null,
      metrics: DEFAULT_METRICS,

      setUser: (user) => set({ user }),

      setActiveChannel: (channelId) => set({ activeChannelId: channelId }),

      updateMetrics: (partial) =>
        set((state) => ({
          metrics: { ...state.metrics, ...partial },
        })),

      reset: () =>
        set({ user: null, activeChannelId: null, metrics: DEFAULT_METRICS }),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        activeChannelId: state.activeChannelId,
        metrics: state.metrics,
      }),
    }
  )
);
