import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { AlertsSetupForm } from '@/components/alerts/AlertsSetupForm';
import { banks } from '@/data/banks';
import { getAllInstitutions } from '@/lib/dd/repository';

export const metadata: Metadata = {
  title: 'Get Bank Bonus Alerts | BonusClerk',
  description: 'Tell us what banks you already have. We\'ll only email you about bonuses you actually qualify for.',
};

export default async function AlertsSetupPage() {
  const allInstitutions = await getAllInstitutions();

  // Sources for ACH push: anything that isn't strictly a "destination only" bank.
  // For onboarding we show all institutions (banks, brokerages, fintechs).
  const sources = allInstitutions.filter(i => i.type !== 'government' && i.type !== 'payroll');

  return (
    <Container size="narrow" className="py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary sm:text-4xl">
          Get bonus alerts for accounts you already have
        </h1>
        <p className="mt-3 text-text-secondary">
          Tell us your existing accounts and we&apos;ll only email you about bonuses you can
          actually qualify for. No newsletter, no spam — just personalized matches.
        </p>
      </div>
      <AlertsSetupForm banks={banks} sources={sources} />
      <p className="mt-6 text-center text-xs text-text-tertiary">
        We never sell your email. Unsubscribe with one click in any email.
      </p>
    </Container>
  );
}
