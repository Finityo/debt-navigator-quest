import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Square } from 'lucide-react';

export function BankTroubleshooting() {
  const { user } = useAuth();
  const [problem, setProblem] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => { if (!user) { abort.current?.abort(); setProblem(''); setAnswer(''); setError(''); } }, [user]);
  useEffect(() => () => abort.current?.abort(), []);
  if (!user) return null;

  const submit = async () => {
    if (loading) return;
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true); setAnswer(''); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again to use bank troubleshooting.');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bank-troubleshoot`, {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem }),
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error ?? 'AI troubleshooting is unavailable.'); }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No troubleshooting guidance was returned.');
      const decoder = new TextDecoder();
      let buffer = ''; let complete = false;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line);
          if (event.error) throw new Error(event.error);
          if (event.text) setAnswer(previous => previous + event.text);
          if (event.done) complete = true;
        }
      }
      if (!complete) throw new Error('The response was interrupted. Please start a new request.');
    } catch (e) {
      setAnswer('');
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'AI troubleshooting could not be reached.');
    } finally { setLoading(false); abort.current = null; }
  };
  return <section className="border-t border-border pt-5 space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />Bank connection help</h3>
    <Label htmlFor="bank-problem">What went wrong?</Label>
    <Textarea id="bank-problem" value={problem} onChange={e => setProblem(e.target.value)} maxLength={2000} disabled={loading} placeholder="The connection window closes before my accounts appear." />
    <p className="text-xs text-muted-foreground">Do not include passwords, codes, keys, account numbers, or personal details. AI guidance may be incorrect.</p>
    <div className="flex gap-2">
      <Button className="h-10" onClick={submit} disabled={loading || problem.trim().length < 10}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}Get troubleshooting steps</Button>
      {loading && <Button variant="outline" className="h-10" onClick={() => abort.current?.abort()} aria-label="Stop troubleshooting"><Square className="h-4 w-4" /></Button>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
    {answer && <div aria-live="polite" className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">{answer}</div>}
  </section>;
}