import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { BonusMission } from '@/components/dd-checker/BonusMission';
import { getAllBonuses, getBonusById } from '@/lib/bonus-repository';
import {
  getAllInstitutions,
  getBestSourcesForBank,
  getFailingSourcesForBank,
  getMethodGuides,
} from '@/lib/dd/repository';

export const revalidate = 3600;

interface Props {
  params: Promise<{ 'bonus-id': string }>;
}

export async function generateStaticParams() {
  try {
    const allBonuses = await getAllBonuses();
    return allBonuses
      .filter(b => b.isActive && b.requirements.directDeposit)
      .map(b => ({ 'bonus-id': b.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { 'bonus-id': bonusId } = await params;
  const bonus = await getBonusById(bonusId);
  if (!bonus || !bonus.requirements.directDeposit) return {};
  return {
    title: `How to Trigger Direct Deposit for ${bonus.bank} $${bonus.bonusAmount} Bonus | BonusClerk`,
    description: `Step-by-step guide to trigger the direct deposit requirement for the ${bonus.bank} ${bonus.accountType} $${bonus.bonusAmount} bonus. See which sources work and which don't.`,
  };
}

export default async function BonusMissionPage({ params }: Props) {
  const { 'bonus-id': bonusId } = await params;
  const bonus = await getBonusById(bonusId);
  if (!bonus || !bonus.requirements.directDeposit) return notFound();

  const [allInstitutions, bestSources, failingSources, methodGuides] = await Promise.all([
    getAllInstitutions(),
    getBestSourcesForBank(bonus.bankSlug, 3),
    getFailingSourcesForBank(bonus.bankSlug),
    getMethodGuides(),
  ]);

  const dd = bonus.requirements.directDeposit;

  return (
    <Container>
      <div className="py-8 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-tertiary mb-6 flex-wrap">
          <Link href="/dd-checker" className="hover:text-accent transition-colors">DD Checker</Link>
          <span>/</span>
          <Link href={`/dd-checker/${bonus.bankSlug}`} className="hover:text-accent transition-colors">
            {bonus.bank}
          </Link>
          <span>/</span>
          <span className="text-text-secondary">${bonus.bonusAmount} Bonus Mission</span>
        </nav>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl mb-2">
            {bonus.bank} ${bonus.bonusAmount} {bonus.accountType.charAt(0).toUpperCase() + bonus.accountType.slice(1)} Bonus
            <span className="text-accent"> — DD Mission</span>
          </h1>
          <p className="text-text-secondary">
            Complete guide to triggering the ${dd.amount.toLocaleString()} direct deposit requirement ({dd.frequency}).
          </p>
        </div>

        <BonusMission
          bonus={bonus}
          bestSources={bestSources}
          failingSources={failingSources}
          allInstitutions={allInstitutions}
          methodGuides={methodGuides}
        />
      </div>
    </Container>
  );
}
