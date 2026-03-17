import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div>
      <PageHeader title="Activity" description="Track your actual payments and progress" />
      <Card className="border bg-card">
        <CardContent className="p-8 text-center">
          <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-heading font-semibold mb-1">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Log actual payments as you make them. Track your real progress against the plan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
