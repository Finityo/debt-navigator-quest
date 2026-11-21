import { cleanup, render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthEntryRoute } from '@/components/AuthEntryRoute';

const authPage = vi.hoisted(() => vi.fn(() => null));
vi.mock('@/pages/AuthPage', () => ({ default: authPage }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('temporary auth page removal', () => {
  it.each(['/auth', '/auth?mode=signup', '/auth#recovery'])('redirects %s to /debts without mounting authentication', async (entry) => {
    let destination = '';
    function Destination() {
      destination = useLocation().pathname;
      return null;
    }
    render(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/auth" element={<AuthEntryRoute />} />
          <Route path="/debts" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(destination).toBe('/debts'));
    expect(authPage).not.toHaveBeenCalled();
  });
});