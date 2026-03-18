import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'About BonusClerk',
  description: 'BonusClerk helps you find and track the best bank account bonuses. Learn about our mission and how we verify bonus data.',
};

export default function AboutPage() {
  return (
    <Container size="narrow" className="py-10">
      <h1 className="text-3xl font-extrabold text-text-primary font-[var(--font-display)]">About BonusClerk</h1>
      <div className="prose mt-6">
        <p>
          BonusClerk is an independent resource for finding and tracking bank account bonuses.
          We monitor checking, savings, HYSA, CD, and business account offers from major banks
          and online institutions.
        </p>
        <h2>What We Do</h2>
        <p>
          We verify bonus requirements, track expiration dates, and break down the fine print
          so you can make informed decisions about which bonuses are worth your time.
        </p>
        <h2>Our Approach</h2>
        <p>
          We focus exclusively on bank account bonuses — no credit card offers, no travel points.
          Every bonus listed on BonusClerk includes verified requirements, fees, keep-open periods,
          and estimated payout timelines.
        </p>
        <h2>Affiliate Disclosure</h2>
        <p>
          Some links on BonusClerk may earn us a commission at no extra cost to you. This never
          affects our ratings or which bonuses we feature. We list bonuses based on value and
          accessibility, regardless of affiliate relationships.
        </p>
      </div>
    </Container>
  );
}
