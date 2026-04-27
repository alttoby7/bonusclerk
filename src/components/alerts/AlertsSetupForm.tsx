'use client';

import { useMemo, useState } from 'react';
import type { Bank } from '@/types/bonus';
import type { Institution } from '@/types/dd-checker';

interface Props {
  banks: Bank[];
  sources: Institution[];
}

type Step = 1 | 2 | 3 | 4;

export function AlertsSetupForm({ banks, sources }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [held, setHeld] = useState<Set<string>>(new Set());
  const [pushers, setPushers] = useState<Set<string>>(new Set());
  const [threshold, setThreshold] = useState(200);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sortedBanks = useMemo(() => [...banks].sort((a, b) => a.name.localeCompare(b.name)), [banks]);
  const sortedSources = useMemo(() =>
    [...sources].sort((a, b) => a.name.localeCompare(b.name))
  , [sources]);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, slug: string) {
    const next = new Set(set);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    setter(next);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          heldBankSlugs: [...held],
          sourceInstitutionSlugs: [...pushers],
          minBonusAmount: threshold,
          source: 'alerts_setup',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Subscription failed');
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary">You&apos;re in.</h2>
        <p className="mt-2 text-text-secondary">
          We&apos;ll email you only when a bonus matches your accounts and threshold. No spam, no
          weekly newsletter you don&apos;t want.
        </p>
        <p className="mt-4 text-xs text-text-tertiary">
          Sent to {email}. Update preferences any time at /alerts/setup.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
      <Stepper step={step} />

      {step === 1 && (
        <Section
          title="Which banks do you already have accounts at?"
          subtitle="We won't send alerts for banks you already hold — most have only one bonus per customer."
        >
          <ChipGrid
            items={sortedBanks.map(b => ({ slug: b.slug, label: b.name }))}
            selected={held}
            onToggle={s => toggle(held, setHeld, s)}
          />
          <Counter selected={held.size} label="banks held" />
          <NextRow onNext={() => setStep(2)} canNext />
        </Section>
      )}

      {step === 2 && (
        <Section
          title="Which institutions can you push ACH from?"
          subtitle="Direct deposit triggers usually require pushing from a brokerage, fintech, or bank you control."
        >
          <ChipGrid
            items={sortedSources.map(s => ({ slug: s.slug, label: s.name }))}
            selected={pushers}
            onToggle={s => toggle(pushers, setPushers, s)}
          />
          <Counter selected={pushers.size} label="sources available" />
          <NextRow
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            canNext={pushers.size > 0}
            nextDisabledLabel="Pick at least one push source"
          />
        </Section>
      )}

      {step === 3 && (
        <Section
          title="What's the smallest bonus worth your time?"
          subtitle="We won't email you about anything below this amount."
        >
          <div className="flex flex-wrap gap-2">
            {[100, 200, 300, 500, 750, 1000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setThreshold(amt)}
                className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                  threshold === amt
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-surface text-text-secondary hover:border-accent/50'
                }`}
              >
                ${amt}+
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-tertiary">
            Currently selected: <span className="font-mono text-text-primary">${threshold}+</span>
          </p>
          <NextRow onBack={() => setStep(2)} onNext={() => setStep(4)} canNext />
        </Section>
      )}

      {step === 4 && (
        <Section
          title="Where should we send your alerts?"
          subtitle="One personalized email per matching bonus. Unsubscribe any time."
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface-raised px-4 py-3 text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <div className="mt-4 rounded-lg bg-surface-sunken p-4 text-xs text-text-secondary">
            <p className="font-semibold text-text-primary">Your alert profile</p>
            <ul className="mt-2 space-y-1">
              <li>Banks held: {held.size === 0 ? 'none yet' : `${held.size}`}</li>
              <li>Push sources: {pushers.size}</li>
              <li>Min bonus: ${threshold}</li>
            </ul>
          </div>
          <NextRow
            onBack={() => setStep(3)}
            onSubmit={submit}
            canNext={!submitting && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            submitting={submitting}
            submitLabel="Get my alerts"
          />
        </Section>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ['Banks held', 'Push sources', 'Threshold', 'Email'];
  return (
    <div className="mb-6 flex items-center gap-2 text-xs">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
                active
                  ? 'bg-accent text-white'
                  : done
                    ? 'bg-accent/15 text-accent'
                    : 'bg-surface-sunken text-text-tertiary'
              }`}
            >
              {done ? '✓' : n}
            </span>
            <span className={`hidden sm:inline ${active ? 'text-text-primary font-medium' : 'text-text-tertiary'}`}>
              {label}
            </span>
            {i < labels.length - 1 && <span className="h-px w-4 bg-border sm:w-8" />}
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChipGrid({
  items,
  selected,
  onToggle,
}: {
  items: { slug: string; label: string }[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ slug, label }) => {
        const isSelected = selected.has(slug);
        return (
          <button
            key={slug}
            type="button"
            onClick={() => onToggle(slug)}
            className={`rounded-full px-3.5 py-1.5 text-sm border transition-colors ${
              isSelected
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-text-secondary hover:border-accent/50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Counter({ selected, label }: { selected: number; label: string }) {
  return (
    <p className="mt-3 text-xs text-text-tertiary">
      <span className="font-mono text-text-primary">{selected}</span> {label}
    </p>
  );
}

function NextRow({
  onBack,
  onNext,
  onSubmit,
  canNext,
  submitting,
  submitLabel,
  nextDisabledLabel,
}: {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  canNext: boolean;
  submitting?: boolean;
  submitLabel?: string;
  nextDisabledLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          ← Back
        </button>
      ) : (
        <span />
      )}
      {onSubmit ? (
        <button
          type="button"
          disabled={!canNext}
          onClick={onSubmit}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? 'Saving…' : (submitLabel ?? 'Continue')}
        </button>
      ) : (
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          title={!canNext ? nextDisabledLabel : undefined}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-50"
        >
          Continue →
        </button>
      )}
    </div>
  );
}
