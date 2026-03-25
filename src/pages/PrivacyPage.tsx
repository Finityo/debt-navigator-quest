import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Privacy Policy" description="Last updated: March 2026" />
      <Card className="glass-card">
        <CardContent className="p-6 prose prose-sm prose-invert max-w-none">
          <h2 className="text-lg font-heading font-semibold text-foreground">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            Finityo collects your email address and optional display name when you create an account.
            Financial data you enter (debt balances, interest rates, payment amounts) is stored securely
            and associated with your account.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">2. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your financial data is used solely to generate your personalized debt payoff plan.
            We do not sell, share, or monetize your personal or financial information.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">3. Data Storage & Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            All data is encrypted in transit (TLS) and at rest. Data is stored in secure,
            SOC 2 compliant infrastructure. Row-level security ensures your data is isolated
            and accessible only to you.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">4. Account Deletion</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can permanently delete your account and all associated data at any time from
            the Settings page. This action is irreversible and removes all your information
            from our systems.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">5. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you use the bank connection feature (Plaid), your banking credentials are handled
            entirely by Plaid and never stored by Finityo. We only receive the debt information
            you authorize.
          </p>

          <h2 className="text-lg font-heading font-semibold text-foreground mt-6">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For privacy inquiries, contact us at privacy@finityo.app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
