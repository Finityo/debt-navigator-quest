import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { GitCompare } from 'lucide-react';

export default function ScenariosPage() {
  return (
    <div>
      <PageHeader title="Scenarios" description="Compare different payoff strategies side by side" />
      <Card className="border bg-card">
        <CardContent className="p-8 text-center">
          <GitCompare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-heading font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compare baseline vs. alternate strategies — different methods, extra payment amounts, or APR changes — all powered by the same engine.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
