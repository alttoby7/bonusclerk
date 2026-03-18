'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Container } from './Container';
import { pillars } from '@/data/pillars';

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-text-primary font-[var(--font-display)]">
              Bonus<span className="text-accent">Clerk</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/bonuses"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              All Bonuses
            </Link>
            <Link
              href="/dd-checker"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              DD Checker
            </Link>
            <div className="relative group">
              <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                Guides
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="w-64 rounded-lg border border-border bg-surface p-2 shadow-lg">
                  {pillars.map(pillar => (
                    <Link
                      key={pillar.slug}
                      href={`/${pillar.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors"
                    >
                      {pillar.icon} {pillar.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/bank-bonus-churning"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Churning Guide
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border pb-4 md:hidden">
            <Link
              href="/bonuses"
              className="block px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              All Bonuses
            </Link>
            <Link
              href="/dd-checker"
              className="block px-2 py-3 text-sm font-medium text-text-secondary hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              DD Checker
            </Link>
            {pillars.map(pillar => (
              <Link
                key={pillar.slug}
                href={`/${pillar.slug}`}
                className="block px-2 py-3 text-sm text-text-secondary hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {pillar.icon} {pillar.title}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </nav>
  );
}
