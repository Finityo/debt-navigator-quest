import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebtStore } from '@/store/useDebtStore';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StableNumberInput } from '@/components/ui/stable-number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Moon, Sun, Volume2, LogOut, Trash2, Shield, FileText, Loader2 } from 'lucide-react';
import type { PayoffMethod } from '@/types/debt';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, updateSettings } = useDebtStore();
  const { user, signOut, deleteAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(
    () => localStorage.getItem('finityo_voiceover_default') !== 'false'
  );
  const [deleting, setDeleting] = useState(false);

  const handleVoiceoverChange = (checked: boolean) => {
    setVoiceoverEnabled(checked);
    localStorage.setItem('finityo_voiceover_default', checked ? 'true' : 'false');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    if (error) {
      toast.error('Failed to delete account: ' + error.message);
      setDeleting(false);
      return;
    }
    toast.success('Account deleted permanently');
    navigate('/');
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Configure your payoff strategy" />

      {/* Account Section */}
      {user && (
        <Card className="max-w-lg glass-card">
          <CardContent className="p-6 space-y-4">
            <Label className="text-xs font-medium text-muted-foreground">Account</Label>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
                <p className="text-[11px] text-muted-foreground">Signed in</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="max-w-lg glass-card">
          <CardContent className="p-6">
            <Label className="text-xs font-medium text-muted-foreground">Account</Label>
            <div className="flex items-center justify-between rounded-lg border border-border p-4 mt-2">
              <p className="text-sm text-muted-foreground">Sign in to sync your debts across devices</p>
              <Button size="sm" onClick={() => navigate('/auth')}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-lg">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Payoff Method</Label>
            <Select
              value={settings.method}
              onValueChange={(v) => updateSettings({ method: v as PayoffMethod })}
            >
              <SelectTrigger className="mt-0.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Avalanche (highest APR first)</SelectItem>
                <SelectItem value="snowball">Snowball (lowest balance first)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              {settings.method === 'avalanche'
                ? 'Pays off highest-interest debt first — minimizes total interest.'
                : 'Pays off smallest balance first — builds momentum with quick wins.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={settings.startDate}
              onChange={(e) => updateSettings({ startDate: e.target.value })}
              className="mt-0.5"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Horizon (months)</Label>
            <StableNumberInput
              value={settings.monthsHorizon}
              onCommit={(v) => updateSettings({ monthsHorizon: Math.max(1, Math.min(360, Math.round(v))) })}
              className="mt-0.5"
            />
            <p className="text-[11px] text-muted-foreground">
              Maximum number of months to project your payoff plan.
            </p>
          </div>

          {/* Appearance */}
          <div className="border-t pt-6 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Appearance</Label>
            <div className="flex items-center justify-between rounded-lg border p-4 mt-0.5">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">Dark mode</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>

          {/* Voiceover */}
          <div className="border-t pt-6 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Accessibility</Label>
            <div className="flex items-center justify-between rounded-lg border p-4 mt-0.5">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Tour voiceover</span>
                  <p className="text-[11px] text-muted-foreground">Read onboarding steps aloud using your device's voice</p>
                </div>
              </div>
              <Switch
                checked={voiceoverEnabled}
                onCheckedChange={handleVoiceoverChange}
              />
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t pt-6 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Legal</Label>
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="ghost" className="justify-start text-sm" onClick={() => navigate('/privacy')}>
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="ghost" className="justify-start text-sm" onClick={() => navigate('/terms')}>
                <FileText className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          {user && (
            <div className="border-t border-destructive/30 pt-6 space-y-1.5">
              <Label className="text-xs font-medium text-destructive">Danger Zone</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full mt-2">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account, profile, and all debt data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-[11px] text-destructive/70">
                Permanently removes your account and all associated data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
