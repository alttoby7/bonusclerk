'use client';

import { useState, useEffect } from 'react';

interface ChecklistItem {
  label: string;
  detail?: string;
}

export function RequirementChecklist({
  items,
  bonusId,
  title = 'Requirements Checklist',
}: {
  items: ChecklistItem[];
  bonusId: string;
  title?: string;
}) {
  const storageKey = `bc-checklist-${bonusId}`;
  const [checked, setChecked] = useState<boolean[]>(() => new Array(items.length).fill(false));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  function toggle(index: number) {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }

  const completed = checked.filter(Boolean).length;
  const pct = Math.round((completed / items.length) * 100);

  return (
    <div className="my-8 rounded-xl border border-border bg-surface p-5 not-prose">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-text-primary text-sm">{title}</h4>
        <span className="text-xs font-medium text-text-tertiary">
          {completed}/{items.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 rounded-full bg-surface-sunken overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-raised"
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                checked[i]
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-strong'
              }`}>
                {checked[i] && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <span className={`text-sm font-medium ${checked[i] ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                  {item.label}
                </span>
                {item.detail && (
                  <p className="mt-0.5 text-xs text-text-tertiary">{item.detail}</p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {completed === items.length && (
        <div className="mt-4 rounded-lg bg-success-light/50 p-3 text-center text-sm font-medium text-success">
          All requirements met! Your bonus should post soon.
        </div>
      )}
    </div>
  );
}
