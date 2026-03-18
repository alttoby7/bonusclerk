import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'BonusClerk privacy policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <Container size="narrow" className="py-10">
      <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)]">Privacy Policy</h1>
      <div className="prose mt-6">
        <p><em>Last updated: March 2026</em></p>
        <p>
          BonusClerk (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates bonusclerk.com.
          This page informs you of our policies regarding the collection, use, and disclosure of personal data.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect standard web analytics data (page views, browser type, referral source) through
          privacy-respecting analytics. We do not sell personal information.
        </p>
        <h2>Cookies</h2>
        <p>
          We use essential cookies for site functionality. Third-party advertising cookies may be
          used if display ads are enabled.
        </p>
        <h2>Affiliate Links</h2>
        <p>
          When you click an affiliate link, the destination bank may collect information according
          to their own privacy policy. We receive only commission data, not your personal banking information.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions, contact us at privacy@bonusclerk.com.
        </p>
      </div>
    </Container>
  );
}
