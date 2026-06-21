import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Support" description="We're here to help you get the most out of Finityo." />

      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Support:{' '}
            <a href="mailto:support@finityo.com" className="text-primary">support@finityo.com</a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Privacy:{' '}
            <a href="mailto:privacy@finityo.com" className="text-primary">privacy@finityo.com</a>
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">When you email us</h2>
          <p className="text-muted-foreground leading-relaxed">
            To help us respond quickly, please include:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>App version</li>
            <li>Device model and OS version</li>
            <li>A short description of the issue and what you expected to happen</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            If the issue involves account sync or bank import, please let us know whether you were signed in
            and whether you were using Plaid at the time.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-heading font-semibold text-foreground">Quick troubleshooting</h2>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>
              If your payoff plan looks wrong, double-check your balances, APRs, minimum payments, and any
              extra payment dates.
            </li>
            <li>
              If bank import fails, wait a few minutes and try again, or enter your debts manually — you can
              connect later.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
