import Link from 'next/link';
import { Container } from './Container';
import { pillars } from '@/data/pillars';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-navy text-slate-300">
      <Container size="wide" className="py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold text-white font-[var(--font-display)]">
              Bonus<span className="text-blue-400">Clerk</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Track every bank bonus worth your time. Updated weekly with verified offers, requirements, and expiration dates.
            </p>
          </div>

          {/* Guides */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Guides
            </h4>
            <ul className="space-y-2">
              {pillars.slice(0, 5).map(pillar => (
                <li key={pillar.slug}>
                  <Link
                    href={`/${pillar.slug}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {pillar.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/bonuses" className="text-sm text-slate-400 hover:text-white transition-colors">
                  All Bonuses
                </Link>
              </li>
              <li>
                <Link href="/bank-bonus-churning" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Churning Guide
                </Link>
              </li>
              <li>
                <Link href="/bank-reviews" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Bank Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-6 md:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BonusClerk. Data verified weekly. Not FDIC insured. Not financial advice.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Independent, not bank-sponsored</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
