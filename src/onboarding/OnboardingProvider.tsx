import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ONBOARDING_STEPS } from "./onboardingSteps";

type OnboardingContextType = {
  isActive: boolean;
  currentStepIndex: number;
  hasCompleted: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  replayTour: () => void;
  closeTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const STORAGE_KEYS = {
  completed: "finityyo_onboarding_completed",
  stepIndex: "finityyo_onboarding_step_index",
  active: "finityyo_onboarding_active",
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEYS.completed) === "true";
    const active = localStorage.getItem(STORAGE_KEYS.active) === "true";
    const stepIndex = Number(localStorage.getItem(STORAGE_KEYS.stepIndex) || 0);

    setHasCompleted(completed);
    setIsActive(!completed && active);
    setCurrentStepIndex(Number.isFinite(stepIndex) ? stepIndex : 0);

    // Auto-start for first-time visitors
    if (!completed && localStorage.getItem(STORAGE_KEYS.active) === null) {
      setIsActive(true);
      localStorage.setItem(STORAGE_KEYS.active, "true");
    }
  }, []);

  const goToStep = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(index, onboardingSteps.length - 1));
    const step = onboardingSteps[bounded];
    setCurrentStepIndex(bounded);
    localStorage.setItem(STORAGE_KEYS.stepIndex, String(bounded));

    if (location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [location.pathname, navigate]);

  const startTour = useCallback(() => {
    setIsActive(true);
    localStorage.setItem(STORAGE_KEYS.active, "true");
    goToStep(0);
  }, [goToStep]);

  const nextStep = useCallback(() => {
    if (currentStepIndex >= onboardingSteps.length - 1) {
      setHasCompleted(true);
      setIsActive(false);
      localStorage.setItem(STORAGE_KEYS.completed, "true");
      localStorage.setItem(STORAGE_KEYS.active, "false");
      return;
    }
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(STORAGE_KEYS.completed, "true");
    localStorage.setItem(STORAGE_KEYS.active, "false");
  }, []);

  const replayTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.completed, "false");
    localStorage.setItem(STORAGE_KEYS.active, "true");
    localStorage.setItem(STORAGE_KEYS.stepIndex, "0");
    setHasCompleted(false);
    setIsActive(true);
    goToStep(0);
  }, [goToStep]);

  const closeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEYS.active, "false");
  }, []);

  const value = useMemo(
    () => ({
      isActive,
      currentStepIndex,
      hasCompleted,
      startTour,
      nextStep,
      prevStep,
      skipTour,
      replayTour,
      closeTour,
    }),
    [isActive, currentStepIndex, hasCompleted, startTour, nextStep, prevStep, skipTour, replayTour, closeTour]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }
  return ctx;
}
