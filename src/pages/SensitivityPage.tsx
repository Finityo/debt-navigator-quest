import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function SensitivityPage() {
  return (
    <div>
      <PageHeader title="Sensitivity" description="Analyze how changes in extra payments or APR affect your plan" />
      <Card className="border bg-card">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-heading font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Sensitivity analysis will show how adjusting your extra monthly payment or interest rates impacts your total cost and payoff timeline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
