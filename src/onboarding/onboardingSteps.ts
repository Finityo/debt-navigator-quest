export type OnboardingStep = {
  id: string;
  route: string;
  targetId?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // --- WELCOME ---
  {
    id: "welcome",
    route: "/",
    placement: "center",
    title: "Welcome to Finityo",
    description:
      "Let's set up your personalized debt payoff plan. This will take less than 2 minutes.",
  },
  // --- DEBTS PAGE ---
  {
    id: "debts-intro",
    route: "/debts",
    placement: "center",
    title: "Add Your Debts",
    description:
      "You can add your debts 3 ways: connect accounts, enter manually, or import a spreadsheet.",
  },
  {
    id: "connect-accounts",
    route: "/debts",
    targetId: "connect-accounts-btn",
    title: "Connect Accounts",
    description:
      "Securely connect your bank to automatically import eligible debts.",
    placement: "bottom",
  },
  {
    id: "manual-entry",
    route: "/debts",
    targetId: "add-debt-btn",
    title: "Add Manually",
    description:
      "Prefer control? Add your debts manually with balances, APR, and payments.",
  },
  {
    id: "export-template",
    route: "/debts",
    targetId: "export-btn",
    title: "Export Template",
    description:
      "Download a spreadsheet template to organize your debts offline.",
  },
  {
    id: "import-template",
    route: "/debts",
    targetId: "import-btn",
    title: "Import Spreadsheet",
    description:
      "Upload your completed template and instantly populate your debts.",
  },
  {
    id: "calculation-note",
    route: "/debts",
    placement: "center",
    title: "All Methods Work the Same",
    description:
      "No matter how you add debts, Finityo calculates your payoff plan using the same engine.",
  },
  // --- PLAN PAGE ---
  {
    id: "plan-intro",
    route: "/plan",
    placement: "center",
    title: "Your Payoff Plan",
    description:
      "This is where Finityo calculates your strategy and shows your payoff timeline.",
  },
  {
    id: "snowball",
    route: "/plan",
    targetId: "snowball-toggle",
    title: "Snowball Method",
    description:
      "Focus on smallest balances first to build momentum and quick wins.",
  },
  {
    id: "avalanche",
    route: "/plan",
    targetId: "avalanche-toggle",
    title: "Avalanche Method",
    description:
      "Focus on highest interest rates first to minimize total interest paid.",
  },
  {
    id: "monthly-breakdown",
    route: "/plan",
    targetId: "monthly-table",
    title: "Monthly Breakdown",
    description:
      "Each payment shows how much goes toward interest and principal.",
  },
  {
    id: "payoff-date",
    route: "/plan",
    targetId: "payoff-date",
    title: "Payoff Date",
    description:
      "This is your projected debt-free date based on your current plan.",
  },
  // --- DASHBOARD ---
  {
    id: "dashboard-intro",
    route: "/dashboard",
    placement: "center",
    title: "Your Financial Overview",
    description:
      "This dashboard summarizes your debt, payments, and progress.",
  },
  {
    id: "total-debt",
    route: "/dashboard",
    targetId: "total-debt-card",
    title: "Total Debt",
    description:
      "Your total remaining balance across all active debts.",
  },
  {
    id: "monthly-payment",
    route: "/dashboard",
    targetId: "monthly-payment-card",
    title: "Monthly Payments",
    description:
      "The total amount you are paying toward debt each month.",
  },
  {
    id: "progress",
    route: "/dashboard",
    targetId: "progress-card",
    title: "Progress",
    description:
      "Track how much of your debt you've already paid off.",
  },
  // --- FINISH ---
  {
    id: "complete",
    route: "/dashboard",
    placement: "center",
    title: "You're Ready",
    description:
      "You're all set. Add your debts, generate your plan, and take control of your finances.",
  },
];
