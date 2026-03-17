import { useDebtStore } from '@/store/useDebtStore';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import type { PayoffMethod } from '@/types/debt';

export default function SettingsPage() {
  const { settings, updateSettings } = useDebtStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your payoff strategy" />

      <Card className="max-w-lg">
        <CardContent className="p-5 space-y-5">
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
            <Input
              type="number"
              value={settings.monthsHorizon}
              onChange={(e) => updateSettings({ monthsHorizon: parseInt(e.target.value) || 60 })}
              className="mt-0.5"
              min={1}
              max={360}
            />
            <p className="text-[11px] text-muted-foreground">
              Maximum number of months to project your payoff plan.
            </p>
          </div>

          {/* Appearance */}
          <div className="border-t pt-5 space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Appearance</Label>
            <div className="flex items-center justify-between rounded-lg border p-3 mt-0.5">
              <div className="flex items-center gap-2.5">
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
        </CardContent>
      </Card>
    </div>
  );
}