export type OnboardingStep = {
  id: string;
  route: string;
  targetId?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "debts-intro",
    route: "/debts",
    targetId: "add-debt-btn",
    title: "Add Your Debts",
    description:
      "Start here — add your debts manually, connect your bank, or upload a spreadsheet.",
    placement: "bottom",
  },
  {
    id: "plan-intro",
    route: "/plan",
    placement: "center",
    title: "Your Payoff Plan",
    description:
      "This is your personalized payoff plan — see your timeline, interest, and strategy.",
  },
  {
    id: "scenarios",
    route: "/plan",
    placement: "center",
    title: "Explore Scenarios",
    description:
      "Try different strategies and extra payments to find the fastest path to debt freedom.",
  },
];
