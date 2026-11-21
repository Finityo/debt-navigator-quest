import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthEntryRoute } from '@/components/AuthEntryRoute';

const mocks = vi.hoisted(() => ({
  auth: { user: null as { id: string } | null, loading: false },
  signIn: vi.fn(), signUp: vi.fn(), toastError: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ ...mocks.auth, signIn: mocks.signIn, signUp: mocks.signUp }) }));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError } }));
beforeEach(() => { vi.clearAllMocks(); mocks.auth = { user: null, loading: false }; });
afterEach(cleanup);

function renderEntry(entry = '/auth') {
  let destination = '';
  function Destination() { destination = useLocation().pathname; return null; }
  render(<MemoryRouter initialEntries={[entry]}><Routes>
    <Route path="/auth" element={<AuthEntryRoute />} />
    <Route path="/debts" element={<Destination />} />
  </Routes></MemoryRouter>);
  return () => destination;
}

describe('existing-account sign-in only', () => {
  it.each(['/auth', '/auth?mode=signup', '/auth#recovery'])('offers only password sign-in at %s', async (entry) => {
    renderEntry(entry);
    mocks.signIn.mockResolvedValue({ error: null });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } });
    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/ }));
    await waitFor(() => expect(mocks.signIn).toHaveBeenCalledWith('existing@example.test', 'test-password'));
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Display Name')).toBeNull();
  });
  it('redirects an existing signed-in session to /debts', async () => {
    mocks.auth.user = { id: 'existing-user' };
    const destination = renderEntry();
    await waitFor(() => expect(destination()).toBe('/debts'));
    expect(mocks.signIn).not.toHaveBeenCalled();
  });
  it('reports rejected credentials without signing up', async () => {
    mocks.signIn.mockResolvedValue({ error: new Error('Invalid login credentials') });
    renderEntry();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'existing@example.test' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /^Sign In$/ }));
    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Invalid login credentials'));
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});