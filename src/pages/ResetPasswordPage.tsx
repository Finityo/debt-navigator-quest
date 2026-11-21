import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <p className="text-muted-foreground">Checking recovery link…</p>;
  if (!user) return <div className="space-y-4"><h1 className="text-2xl font-heading font-bold">Password reset</h1><p className="text-muted-foreground">Open the latest password-reset link from your email. If it has expired, request a new link from Sign In.</p><Button onClick={() => navigate('/auth')}>Sign In</Button></div>;
  return <form className="max-w-sm mx-auto space-y-4 py-10" onSubmit={async e => {
    e.preventDefault();
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    setSaving(true); setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated'); navigate('/debts', { replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : 'Password could not be updated.'); }
    finally { setSaving(false); }
  }}>
    <h1 className="text-2xl font-heading font-bold">Set a new password</h1>
    <Label htmlFor="new-password">New password</Label>
    <Input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} />
    <Label htmlFor="confirm-password">Confirm password</Label>
    <Input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirmation} onChange={e => setConfirmation(e.target.value)} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={saving} className="h-10">{saving ? 'Saving…' : 'Save password'}</Button>
  </form>;
}