import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlaidConnect from '@/components/PlaidConnect';

const mocks = vi.hoisted(() => ({
  auth: { user: null as { id: string } | null, loading: true },
  invoke: vi.fn(),
  addDebt: vi.fn(),
  computePlan: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: mocks.invoke } } }));
vi.mock('@/store/useDebtStore', () => ({
  useDebtStore: (select: (store: { addDebt: typeof mocks.addDebt; computePlan: typeof mocks.computePlan }) => unknown) => select(mocks),
}));
vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => {
    // A stateful hook reproduces the hook-order failure on auth transitions.
    React.useState(false);
    return { open: vi.fn(), ready: true, error: null };
  },
}));

const panel = () => <MemoryRouter><PlaidConnect /></MemoryRouter>;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth = { user: null, loading: true };
});
afterEach(cleanup);

describe('bank connection recovery', () => {
  it('does not initialize bank access while signed out', () => {
    mocks.auth.loading = false;
    render(panel());
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('survives loading, sign-in, and sign-out transitions', async () => {
    mocks.invoke.mockResolvedValue({ data: { link_token: 'test-fixture' }, error: null });
    const view = render(panel());
    mocks.auth = { user: { id: 'test-user' }, loading: false };
    view.rerender(panel());
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    mocks.auth = { user: null, loading: false };
    expect(() => view.rerender(panel())).not.toThrow();
    expect(mocks.addDebt).not.toHaveBeenCalled();
  });

  it('retries failed initialization instead of remaining stuck', async () => {
    mocks.auth = { user: { id: 'test-user' }, loading: false };
    mocks.invoke.mockResolvedValueOnce({ data: null, error: new Error('offline') })
      .mockResolvedValueOnce({ data: { link_token: 'test-fixture' }, error: null });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(panel());
    fireEvent.click(await screen.findByRole('button', { name: 'Try Again' }));
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Connect Your Bank Securely' })).toBeEnabled());
    vi.restoreAllMocks();
  });
});