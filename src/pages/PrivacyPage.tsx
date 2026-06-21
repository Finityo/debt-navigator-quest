import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader title="Privacy Policy" description="Last updated: June 2026" />
      <Card className="glass-card">
        <CardContent className="p-6 prose prose-sm prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              Finityo may store information you provide, including your email address, optional display name,
              debt balances, APRs, payment amounts, notes, plan settings, and payment activity. If you choose
              to use bank import, Finityo may receive liability account information that you authorize through Plaid.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use this information to generate payoff plans, support account features, sync your data across
              devices, and operate the optional bank import feature. Finityo does not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">3. Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Local app state may be stored on your device. If you are signed in, your profile and debt data
              may also be stored in Supabase-backed cloud infrastructure so it can sync across your devices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Finityo uses Supabase for authentication and cloud storage, and Plaid for secure financial account
              connection flows. Finityo does not receive your bank username or password.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">5. Account Deletion</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can delete your account and associated cloud data at any time from the app's Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-foreground">6. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy inquiries, contact us at <a href="mailto:privacy@finityo.com" className="text-primary">privacy@finityo.com</a>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
