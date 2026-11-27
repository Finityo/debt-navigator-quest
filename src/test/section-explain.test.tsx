// ==========================================================
//  SectionExplain — the Play / Read explanation card pattern
//  ported from the Budget Planner (Nov 27, 2026).
//
//  Every section card shows a one-line label, a Play button for
//  the recorded voice explanation, and a Read button that opens
//  the full written text in a popup for hearing-impaired users.
// ==========================================================

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import SectionExplain from '@/components/budget/SectionExplain';
import { SECTION_INFO } from '@/components/budget/sectionInfo';

afterEach(cleanup);

describe('SectionExplain', () => {
  it('renders the one-line label with Play and Read buttons', () => {
    render(<SectionExplain info={SECTION_INFO.income} />);
    expect(screen.getByText(SECTION_INFO.income.label)).toBeTruthy();
    expect(screen.getByRole('button', { name: /play the voice explanation/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /read explanation/i })).toBeTruthy();
  });

  it('Read opens a popup with the full written explanation', async () => {
    render(<SectionExplain info={SECTION_INFO.debts} />);
    fireEvent.click(screen.getByRole('button', { name: /read explanation/i }));
    const text = await screen.findByText(/list everything you owe, one row per debt/i);
    expect(text).toBeTruthy();
  });

  it('every section explanation points at a recorded audio clip, never device speech', () => {
    for (const info of Object.values(SECTION_INFO)) {
      expect(info.audio.startsWith('/audio/sec-')).toBe(true);
      expect(info.audio.endsWith('.mp3')).toBe(true);
      expect(info.text.length).toBeGreaterThan(50);
    }
  });
});
