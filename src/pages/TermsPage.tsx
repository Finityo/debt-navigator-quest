import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Terms of Service" description="Last updated: June 2026" />
      <Card className="glass-card">
        <CardContent className="p-6 prose prose-sm prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">1. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              Finityo is a debt management planning tool. It provides projections based on the inputs you
              provide. Finityo does not provide financial advice and should not replace professional guidance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">2. Optional Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              Optional features such as account sync and Plaid-based bank import require internet connectivity
              and third-party services to function.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">3. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for the accuracy of the information you enter into Finityo and for keeping
              your account credentials secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">4. Projections Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Actual payoff timelines may vary due to interest rate changes, fees, missed payments, and other
              factors outside Finityo's control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">5. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">6. As-Is</h2>
            <p className="text-muted-foreground leading-relaxed">
              Finityo is provided as-is, without warranties of any kind, express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">7. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms, contact <a href="mailto:support@finityo.com" className="text-primary">support@finityo.com</a>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
