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
    <div>
      <PageHeader title="Settings" description="Configure your payoff strategy" />

      <Card className="border bg-card max-w-lg">
        <CardContent className="p-5 space-y-5">
          <div>
            <Label className="text-sm font-medium">Payoff Method</Label>
            <Select
              value={settings.method}
              onValueChange={(v) => updateSettings({ method: v as PayoffMethod })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="avalanche">Avalanche (highest APR first)</SelectItem>
                <SelectItem value="snowball">Snowball (lowest balance first)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Start Date</Label>
            <Input
              type="date"
              value={settings.startDate}
              onChange={(e) => updateSettings({ startDate: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Horizon (months)</Label>
            <Input
              type="number"
              value={settings.monthsHorizon}
              onChange={(e) => updateSettings({ monthsHorizon: parseInt(e.target.value) || 60 })}
              className="mt-1"
              min={1}
              max={360}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
