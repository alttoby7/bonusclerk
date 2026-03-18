'use client';

import { useState, useRef, useEffect } from 'react';
import type { Institution } from '@/types/dd-checker';

const typeLabels: Record<string, string> = {
  bank: 'Bank',
  brokerage: 'Brokerage',
  fintech: 'Fintech',
  p2p: 'P2P',
  payroll: 'Payroll',
  government: 'Government',
  other: 'Other',
};

export function BankSelect({
  institutions,
  value,
  onChange,
  placeholder = 'Select institution...',
  label,
}: {
  institutions: Institution[];
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = institutions.find(i => i.slug === value);

  const filtered = search
    ? institutions.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.shortName?.toLowerCase().includes(search.toLowerCase()))
      )
    : institutions;

  // Group by type
  const grouped = new Map<string, Institution[]>();
  for (const inst of filtered) {
    const group = inst.isTrackedBank ? 'Tracked Banks' : typeLabels[inst.type] ?? 'Other';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group)!.push(inst);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-text-tertiary mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-sm transition-colors hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
      >
        <span className={selected ? 'text-text-primary' : 'text-text-tertiary'}>
          {selected ? (selected.shortName ?? selected.name) : placeholder}
        </span>
        <svg className="h-4 w-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-sunken px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-1 pb-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-text-tertiary">No results</div>
            )}
            {Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group}>
                <div className="px-3 py-1 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  {group}
                </div>
                {items.map(inst => (
                  <button
                    key={inst.slug}
                    type="button"
                    onClick={() => {
                      onChange(inst.slug);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface-raised ${
                      inst.slug === value ? 'bg-accent-light text-accent font-medium' : 'text-text-primary'
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-raised text-xs font-semibold text-text-secondary">
                      {(inst.shortName ?? inst.name).charAt(0)}
                    </span>
                    {inst.shortName ?? inst.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
