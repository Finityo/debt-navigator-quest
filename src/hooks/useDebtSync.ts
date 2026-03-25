import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDebtStore } from '@/store/useDebtStore';
import type { Debt } from '@/types/debt';
import { toast } from 'sonner';

const MIGRATED_KEY = 'finityo_cloud_migrated';

function localToCloud(d: Debt, userId: string) {
  return {
    user_id: userId,
    name: d.creditorName,
    balance: d.balance,
    apr: d.apr,
    minimum: d.minPayment,
    due_day: 1,
    type: d.type || 'other',
    notes: d.notes || '',
  };
}

function cloudToLocal(row: any): Debt {
  return {
    id: row.id,
    creditorName: row.name,
    balance: Number(row.balance),
    apr: Number(row.apr),
    minPayment: Number(row.minimum),
    type: row.type || 'other',
    startDate: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    notes: row.notes || '',
  };
}

export function useDebtSync() {
  const { user } = useAuth();
  const hasFetched = useRef(false);

  // Fetch debts from cloud on login
  const fetchDebts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch debts:', error);
      return;
    }

    const debts = (data || []).map(cloudToLocal);
    // Replace store debts with cloud debts
    useDebtStore.setState({ debts });
  }, [user]);

  // Migrate local debts to cloud on first login
  const migrateLocalDebts = useCallback(async () => {
    if (!user) return;
    if (localStorage.getItem(MIGRATED_KEY) === user.id) return;

    const store = useDebtStore.getState();
    const localDebts = store.debts;

    // Check if cloud already has debts
    const { data: existing } = await supabase
      .from('debts')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      // Cloud already has debts — skip migration, just mark done
      localStorage.setItem(MIGRATED_KEY, user.id);
      return;
    }

    if (localDebts.length === 0) {
      localStorage.setItem(MIGRATED_KEY, user.id);
      return;
    }

    // Upload local debts to cloud
    const rows = localDebts.map((d) => localToCloud(d, user.id));
    const { error } = await supabase.from('debts').insert(rows);

    if (error) {
      console.error('Migration failed:', error);
      toast.error('Failed to migrate local debts to cloud');
      return;
    }

    localStorage.setItem(MIGRATED_KEY, user.id);
    toast.success(`${localDebts.length} debts synced to your account`);
    // Re-fetch to get server-generated IDs
    await fetchDebts();
  }, [user, fetchDebts]);

  useEffect(() => {
    if (!user || hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      await migrateLocalDebts();
      await fetchDebts();
    })();
  }, [user, migrateLocalDebts, fetchDebts]);

  // Write-through functions
  const createDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    if (!user) return;
    const row = localToCloud({ ...debt, id: '' } as Debt, user.id);
    const { data, error } = await supabase
      .from('debts')
      .insert(row)
      .select()
      .single();

    if (error) {
      toast.error('Failed to save debt');
      return null;
    }

    const newDebt = cloudToLocal(data);
    useDebtStore.getState().addDebt(newDebt);
    return newDebt;
  }, [user]);

  const updateDebt = useCallback(async (id: string, updates: Partial<Debt>) => {
    if (!user) return;
    const patch: Record<string, any> = {};
    if (updates.creditorName !== undefined) patch.name = updates.creditorName;
    if (updates.balance !== undefined) patch.balance = updates.balance;
    if (updates.apr !== undefined) patch.apr = updates.apr;
    if (updates.minPayment !== undefined) patch.minimum = updates.minPayment;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.notes !== undefined) patch.notes = updates.notes;

    const { error } = await supabase
      .from('debts')
      .update(patch)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update debt');
      return;
    }

    useDebtStore.getState().updateDebt(id, updates);
  }, [user]);

  const removeDebt = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete debt');
      return;
    }

    useDebtStore.getState().removeDebt(id);
  }, [user]);

  return { fetchDebts, createDebt, updateDebt, removeDebt };
}
