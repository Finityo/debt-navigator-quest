import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/debts" replace />;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 blur-[140px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-heading text-foreground text-shadow-sm">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access your debt plan
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Account creation is temporarily paused. Existing accounts can sign in with their password.
        </p>
      </motion.div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email" className="text-xs text-muted-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="login-email" autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password" className="text-xs text-muted-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input id="login-password" autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required minLength={6} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Sign In
      </Button>
      <Button type="button" variant="ghost" className="w-full h-10" disabled={resetting || !email} onClick={async () => {
        setResetting(true);
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
          if (error) throw error;
          toast.success('If this account exists, a password-reset link will be emailed.');
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not request a password reset.'); }
        finally { setResetting(false); }
      }}>{resetting ? 'Requesting link…' : 'Forgot password?'}</Button>
    </form>
  );
}
