import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Terms of Service" description="Last updated: March 2026" />
      <Card className="glass-card">
        <CardContent className="p-6 prose prose-sm prose-invert max-w-none">
          <h2 className="text-lg font-heading font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using Finityo, you agree to these Terms of Service. If you do not agree,
            please do not use the application.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">2. Service Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            Finityo is a debt management planning tool. It provides projections based on the
            data you input. It does not provide financial advice and should not be used as a
            substitute for professional financial guidance.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">3. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for the accuracy of data you enter. You are responsible for
            maintaining the security of your account credentials. You must not use the
            service for any unlawful purpose.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">4. Data Accuracy Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            Payoff projections are mathematical calculations based on your inputs. Actual
            payoff timelines may vary due to interest rate changes, fees, and other factors.
            Finityo is not liable for discrepancies between projections and actual outcomes.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">5. Account Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may delete your account at any time. We reserve the right to suspend or
            terminate accounts that violate these terms.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Finityo is provided "as is" without warranties of any kind. We are not liable
            for any financial decisions made based on the application's projections.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">7. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update these terms at any time. Continued use after changes constitutes
            acceptance of the updated terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
