"use client";

import { create } from "zustand";
import type { NicheScoreBreakdown, NicheVerdict } from "@/types";
import type { ScoringInputs } from "@/lib/scoring/nicheScore";

export type EvaluatorStep = 1 | 2 | 3 | 4 | 5;

export type ChannelType = "no-face-ai" | "voice-only" | "with-face";
export type ContentLanguage = "ES" | "EN" | "PT" | "FR" | "OTHER";

export interface RiskFlags {
  seduction: boolean;
  compilationsNoNarrative: boolean;
  noEvergreen: boolean;
  musicDance: boolean;
  goreCrime: boolean;
  copyrightRisk: boolean;
}

interface EvaluatorState {
  currentStep: EvaluatorStep;
  isLoading: boolean;

  // Paso 1
  nicheName: string;
  subNiche: string;
  language: ContentLanguage;
  channelType: ChannelType;
  validationDate: Date | null;
  whyThisNiche: string;

  // Paso 2
  riskFlags: RiskFlags;

  // Paso 3-4 (resultados de búsqueda IA)
  scoringInputs: Partial<ScoringInputs>;

  // Paso 5
  scoreBreakdown: NicheScoreBreakdown | null;
  verdict: NicheVerdict | null;

  // Actions
  setStep: (step: EvaluatorStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateStep1: (data: Partial<Pick<EvaluatorState, "nicheName" | "subNiche" | "language" | "channelType" | "validationDate" | "whyThisNiche">>) => void;
  updateRiskFlags: (flags: Partial<RiskFlags>) => void;
  updateScoringInputs: (inputs: Partial<ScoringInputs>) => void;
  setResult: (score: NicheScoreBreakdown, verdict: NicheVerdict) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const DEFAULT_RISK_FLAGS: RiskFlags = {
  seduction: false,
  compilationsNoNarrative: false,
  noEvergreen: false,
  musicDance: false,
  goreCrime: false,
  copyrightRisk: false,
};

export const useEvaluatorStore = create<EvaluatorState>()((set) => ({
  currentStep: 1,
  isLoading: false,
  nicheName: "",
  subNiche: "",
  language: "ES",
  channelType: "no-face-ai",
  validationDate: null,
  whyThisNiche: "",
  riskFlags: DEFAULT_RISK_FLAGS,
  scoringInputs: {},
  scoreBreakdown: null,
  verdict: null,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 5) as EvaluatorStep,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1) as EvaluatorStep,
    })),

  updateStep1: (data) => set((state) => ({ ...state, ...data })),

  updateRiskFlags: (flags) =>
    set((state) => ({
      riskFlags: { ...state.riskFlags, ...flags },
    })),

  updateScoringInputs: (inputs) =>
    set((state) => ({
      scoringInputs: { ...state.scoringInputs, ...inputs },
    })),

  setResult: (score, verdict) =>
    set({ scoreBreakdown: score, verdict }),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      currentStep: 1,
      isLoading: false,
      nicheName: "",
      subNiche: "",
      language: "ES",
      channelType: "no-face-ai",
      validationDate: null,
      whyThisNiche: "",
      riskFlags: DEFAULT_RISK_FLAGS,
      scoringInputs: {},
      scoreBreakdown: null,
      verdict: null,
    }),
}));
