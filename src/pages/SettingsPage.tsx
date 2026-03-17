import { useDebtStore } from '@/store/useDebtStore';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PayoffMethod } from '@/types/debt';

export default function SettingsPage() {
  const { settings, updateSettings } = useDebtStore();

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
        </CardContent>
      </Card>
    </div>
  );
}
