import { jsPDF } from 'jspdf';

type Section = {
  heading: string;
  body: string[];
};

const SECTIONS: Section[] = [
  {
    heading: 'What Finityo is for',
    body: [
      'Finityo turns your debts into a clear, automatic payoff plan. Enter what you owe and the app shows exactly what to pay, in what order, and when you will be debt-free — using proven Snowball or Avalanche strategies. No spreadsheets, no math, no guesswork.',
    ],
  },
  {
    heading: 'Step 1 — Land on the Hero',
    body: [
      'Open the app to see the Finityo welcome screen.',
      'Tap "Build My Plan" to start, or "Log In" if you already have an account.',
      'Takes under 60 seconds to get to your first plan.',
    ],
  },
  {
    heading: 'Step 2 — Add Your Debts',
    body: [
      'On the "Add Your Debts" screen there are three ways to add a debt:',
      '1. Manual — tap "Add Debt" and enter creditor name, current balance, APR (%), minimum monthly payment, and type.',
      '2. Bank import — tap "Import from Bank" to securely connect via Plaid and auto-pull balances.',
      '3. CSV upload — tap "Upload CSV" to import a spreadsheet.',
      'Tips: add as many debts as you need with "Add Another Debt". Edit or delete any debt from its card. Fields are validated — no negatives, letters, or absurd values.',
    ],
  },
  {
    heading: 'Step 3 — See Your Live Plan Preview',
    body: [
      'As soon as you have one debt, a preview card shows your total debt, projected payoff date, and total interest. This updates instantly as you add, edit, or remove debts.',
    ],
  },
  {
    heading: 'Step 4 — Open Your Payoff Plan',
    body: [
      'Tap "See Your Payoff Plan" to see your month-by-month schedule, total interest saved, projected debt-free date, and a per-debt breakdown.',
    ],
  },
  {
    heading: 'Step 5 — Toggle Strategy',
    body: [
      'At the top of the Plan page, switch between:',
      'Snowball — pay smallest balance first (fastest motivation/wins).',
      'Avalanche — pay highest APR first (least interest paid).',
      'The whole plan recalculates instantly so you can compare.',
    ],
  },
  {
    heading: 'Step 6 — Explore Deeper Views',
    body: [
      'Timeline — visual payoff milestones month by month.',
      'Scenarios — compare strategies side by side.',
      'Sensitivity — see how extra payments accelerate freedom.',
      'Extra Payments — schedule one-time or recurring boosts.',
      'If you visit any of these without debts entered, you will be sent back to "Add Debts" first.',
    ],
  },
  {
    heading: 'Step 7 — Save & Sync (Optional)',
    body: [
      'Create an account from "Log In" to persist your data across devices. Your debts, settings, and progress sync automatically once signed in.',
    ],
  },
  {
    heading: 'Step 8 — Iterate Over Time',
    body: [
      'Update balances as you pay down debt and the plan re-projects automatically.',
      'Try Snowball vs Avalanche to pick the strategy you will actually stick with.',
      'Add extra payments in Scenarios to see how much sooner you finish.',
    ],
  },
  {
    heading: 'Core promise',
    body: [
      'Enter your debts → get an accurate, personalized payoff plan → follow it → become debt-free on a real, predictable date.',
    ],
  },
];

export function exportUserGuidePDF() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Finityo — User Guide', margin, y);
  y += 28;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(110);
  doc.text('Debt Freedom Engine', margin, y);
  y += 24;
  doc.setTextColor(0);

  SECTIONS.forEach((section) => {
    ensureSpace(36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(section.heading, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    section.body.forEach((para) => {
      const lines = doc.splitTextToSize(para, contentWidth);
      lines.forEach((line: string) => {
        ensureSpace(16);
        doc.text(line, margin, y);
        y += 15;
      });
      y += 4;
    });
    y += 8;
  });

  // Footer page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(`Finityo User Guide  ·  Page ${i} of ${pageCount}`, margin, pageHeight - 24);
  }

  doc.save('Finityo-User-Guide.pdf');
}
