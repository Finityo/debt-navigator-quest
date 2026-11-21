import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
const mocks = vi.hoisted(() => ({ user: null as { id: string } | null, updateUser: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: mocks.user, loading: false }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { updateUser: mocks.updateUser } } }));
beforeEach(() => { vi.clearAllMocks(); mocks.user = null; });
afterEach(cleanup);
describe('password recovery', () => {
  it('does not allow signed-out users to change a password', () => {
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    expect(screen.queryByLabelText('New password')).toBeNull();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('rejects mismatched passwords without changing the account', () => {
    mocks.user = { id: 'fixture' };
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'fixture-one' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'fixture-two' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it('updates only the authenticated account password', async () => {
    mocks.user = { id: 'fixture' }; mocks.updateUser.mockResolvedValue({ error: null });
    render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
    for (const label of ['New password', 'Confirm password']) fireEvent.change(screen.getByLabelText(label), { target: { value: 'fixture-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }));
    await waitFor(() => expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'fixture-password' }));
  });
});