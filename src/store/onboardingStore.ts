import { create } from "zustand";

type OnboardingState = {
  currentStep: number;
  hasSeen: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 0,
  hasSeen: !!localStorage.getItem("seen_onboarding"),
  start: () => set({ currentStep: 0, hasSeen: false }),
  next: () =>
    set((state) => {
      const nextStep = state.currentStep + 1;
      if (nextStep >= 3) {
        localStorage.setItem("seen_onboarding", "true");
        return { hasSeen: true, currentStep: nextStep };
      }
      return { currentStep: nextStep };
    }),
  prev: () =>
    set((state) => ({
      currentStep: Math.max(0, state.currentStep - 1),
    })),
  skip: () => {
    localStorage.setItem("seen_onboarding", "true");
    set({ hasSeen: true });
  },
  reset: () => {
    localStorage.removeItem("seen_onboarding");
    set({ currentStep: 0, hasSeen: false });
  },
}));
