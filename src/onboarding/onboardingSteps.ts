export type TourStep = {
  id: string;
  route: string;
  target: string | null;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

export const onboardingSteps: TourStep[] = [
  {
    id: "welcome",
    route: "/debts",
    target: null,
    title: "Welcome to Finityo",
    content:
      "Let's walk through the app so you can add your debts, generate a payoff plan, and understand your numbers fast.",
    placement: "center",
  },
  {
    id: "debts-intro",
    route: "/debts",
    target: null,
    title: "This is where your payoff plan starts",
    content:
      "Add your debts here using one of three methods: connect accounts, add them manually, or import an Excel sheet.",
    placement: "center",
  },
  {
    id: "connect-accounts",
    route: "/debts",
    target: '[data-tour="connect-accounts"]',
    title: "Connect your accounts",
    content:
      "Use this option to connect supported financial accounts and pull in eligible debt information automatically.",
    placement: "bottom",
  },
  {
    id: "manual-add",
    route: "/debts",
    target: '[data-tour="manual-add-debt"]',
    title: "Add debts manually",
    content:
      "Enter debts one by one if you want full control or don't want to connect accounts.",
    placement: "bottom",
  },
  {
    id: "export-template",
    route: "/debts",
    target: '[data-tour="export-template"]',
    title: "Download the Excel template",
    content:
      "Export the template if you want to enter or organize your debts in spreadsheet form first.",
    placement: "bottom",
  },
  {
    id: "import-template",
    route: "/debts",
    target: '[data-tour="import-template"]',
    title: "Import your completed debt sheet",
    content:
      "Upload the filled-in template and Finityo will load your debts into the app.",
    placement: "bottom",
  },
  {
    id: "same-engine",
    route: "/debts",
    target: null,
    title: "All 3 methods work the same way",
    content:
      "Whether you connect accounts, enter debts manually, or import Excel, Finityo uses the same calculation engine once your debt data is loaded.",
    placement: "center",
  },
  {
    id: "plan-intro",
    route: "/plan",
    target: null,
    title: "This is your payoff plan",
    content:
      "Once your debts are loaded, this page shows how your payments are applied month by month and when your debt is projected to be paid off.",
    placement: "center",
  },
  {
    id: "snowball",
    route: "/plan",
    target: '[data-tour="snowball-option"]',
    title: "Snowball strategy",
    content:
      "Snowball pays off your smallest balance first while keeping minimum payments on the rest. As each debt is paid off, that payment rolls into the next debt.",
    placement: "bottom",
  },
  {
    id: "avalanche",
    route: "/plan",
    target: '[data-tour="avalanche-option"]',
    title: "Avalanche strategy",
    content:
      "Avalanche targets the highest interest rate first while keeping minimum payments on the rest. This can reduce total interest over time.",
    placement: "bottom",
  },
  {
    id: "monthly-breakdown",
    route: "/plan",
    target: '[data-tour="monthly-breakdown"]',
    title: "Read each month clearly",
    content:
      "Your plan can show how much goes to interest, how much goes to principal, and how your balances change over time.",
    placement: "top",
  },
  {
    id: "payoff-date",
    route: "/plan",
    target: '[data-tour="payoff-date"]',
    title: "Your projected payoff date",
    content:
      "This shows the estimated month and year you could become debt free based on your current debt data and payment settings.",
    placement: "bottom",
  },
  {
    id: "dashboard-intro",
    route: "/dashboard",
    target: null,
    title: "This is your dashboard",
    content:
      "Your dashboard gives you a quick snapshot of your debt picture, progress, and plan results.",
    placement: "center",
  },
  {
    id: "dashboard-total-debt",
    route: "/dashboard",
    target: '[data-tour="dashboard-total-debt"]',
    title: "Total debt",
    content:
      "This shows the total balance of the debts currently included in your plan.",
    placement: "bottom",
  },
  {
    id: "dashboard-monthly-minimums",
    route: "/dashboard",
    target: '[data-tour="dashboard-monthly-minimums"]',
    title: "Monthly minimums",
    content:
      "This shows the total minimum payment across the debts in your current plan.",
    placement: "bottom",
  },
  {
    id: "dashboard-payoff-date",
    route: "/dashboard",
    target: '[data-tour="dashboard-payoff-date"]',
    title: "Estimated payoff date",
    content:
      "This is the projected date your plan reaches payoff if you stay on track.",
    placement: "bottom",
  },
  {
    id: "dashboard-active-debts",
    route: "/dashboard",
    target: '[data-tour="dashboard-active-debts"]',
    title: "Active debts",
    content:
      "This shows how many debts are currently active in your plan.",
    placement: "bottom",
  },
  {
    id: "dashboard-progress",
    route: "/dashboard",
    target: '[data-tour="dashboard-progress"]',
    title: "Progress insights",
    content:
      "These cards help you track payoff progress and compare results depending on the plan type and available data.",
    placement: "bottom",
  },
  {
    id: "finish",
    route: "/dashboard",
    target: null,
    title: "You're ready to roll",
    content:
      "Start by adding your debts, then head to the Plan page to generate your payoff schedule. You can replay this tour anytime from the app.",
    placement: "center",
  },
];
