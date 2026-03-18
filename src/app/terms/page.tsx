import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'BonusClerk terms of service.',
};

export default function TermsPage() {
  return (
    <Container size="narrow" className="py-10">
      <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)]">Terms of Service</h1>
      <div className="prose mt-6">
        <p><em>Last updated: March 2026</em></p>
        <p>
          By using BonusClerk (bonusclerk.com), you agree to these terms.
        </p>
        <h2>Not Financial Advice</h2>
        <p>
          BonusClerk provides information about bank bonuses for educational purposes only.
          We are not financial advisors. Always read the terms and conditions of any bank offer
          before opening an account.
        </p>
        <h2>Accuracy</h2>
        <p>
          We strive to keep bonus information accurate and up-to-date, but offers can change
          without notice. Always verify current terms directly with the bank before applying.
        </p>
        <h2>Affiliate Relationships</h2>
        <p>
          Some links on this site are affiliate links. We may earn a commission when you open
          an account through our links. This does not affect the accuracy of our information
          or which bonuses we feature.
        </p>
      </div>
    </Container>
  );
}
