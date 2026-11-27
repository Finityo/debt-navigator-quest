// ============================================
// Finityo — Section explanations (Play / Read)
// ============================================
//
// Wording carried over verbatim from the Finityo Budget Planner.
// Each entry pairs a recorded voice explanation (public/audio, a
// recorded voice — never device text-to-speech) with the full
// written text, shown in a popup so the explanation is available
// to hearing-impaired users too.

export interface SectionInfo {
  title: string;
  label: string;
  text: string;
  audio: string;
}

export const SECTION_INFO: Record<'income' | 'expenses' | 'debts' | 'rollover', SectionInfo> = {
  income: {
    title: 'Income',
    label: 'What counts as income, and why the total drives the whole month.',
    text: 'What this section is for: list every source of money coming in this month, at its take-home (after-tax) amount. Why it matters: total income is the starting point for the whole plan — it feeds the summary up top and, minus expenses, sets how much is available for debt.',
    audio: '/audio/sec-nov-income.mp3',
  },
  expenses: {
    title: 'Expenses',
    label: 'Everyday living costs — and why debt payments do not belong here.',
    text: "What this section is for: list the month's everyday living costs — housing, utilities, food, transport, and so on — each with a category and, where known, a due date. Why it matters: total expenses are subtracted from income to give the amount available for debt. Debt payments do not go here; they belong in Debts and are handled by the debt budget, so nothing is counted twice.",
    audio: '/audio/sec-nov-expenses.mp3',
  },
  debts: {
    title: 'Debts',
    label: 'What you owe, and the three numbers the payoff plan runs on.',
    text: 'What this section is for: list everything you owe, one row per debt, with its balance, APR (the yearly interest rate; 0% means no interest or a 0% arrangement), and minimum payment. Why it matters: these three numbers per debt are what the payoff plan runs on — balances set the payoff order, APRs set the interest added each month, and minimums set the least the debt budget must cover. Paid-off debts (balance $0) leave the list. Loans and credit cards are ranked in the payoff plan and the list re-sorts when you switch strategy; vehicle and mortgage debts stay in the total debt picture and their regular payments are reserved from the budget, but they are never ranked and never receive extra payments. A minimum of $0 means no payment is currently due on that debt — for example, a payment that is deferred or a statement that is not due yet.',
    audio: '/audio/sec-nov-debts.mp3',
  },
  rollover: {
    title: 'Rolling months — how the month changes',
    label: 'How months roll forward, and what to do when a new month starts.',
    text: 'What this is for: the planner always keeps two live months — a Current month you are living in, and a Forecast month ahead of it — plus every earlier month saved as Closed history. When a new calendar month begins, the rollover runs the next time you open the planner. The old Current month freezes as Closed and becomes read-only, so history never rewrites itself. The Forecast becomes the new Current. A brand new Forecast is then generated for the month after: recurring income and expenses copy forward, each debt\u2019s opening balance is the prior month\u2019s projected ending balance after interest, minimums, and extra payments, and the prior month\u2019s surplus becomes the new Forecast\u2019s starting extra for debt. If you were away for more than a month, it repeats until it catches up. Your next step after a rollover is simple: review the new Current month\u2019s income and expenses, adjust anything that changed, then check the new Forecast.',
    audio: '/audio/sec-rollover.mp3',
  },
};
