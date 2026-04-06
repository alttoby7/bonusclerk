'use client';

import { useState } from 'react';

interface Source {
  name: string;
  url?: string;
  date?: string;
  note?: string;
}

export function SourceDrawer({
  sources,
  verifiedAt,
  methodology,
}: {
  sources: Source[];
  verifiedAt: string;
  methodology?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-6 not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-3 text-left transition-colors hover:bg-surface-sunken"
      >
        <svg className="h-4 w-4 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <span className="text-sm font-medium text-text-primary flex-1">
          How we verified this
        </span>
        <span className="text-xs text-text-tertiary mr-2">
          Last verified {new Date(verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <svg
          className={`h-4 w-4 text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="rounded-b-lg border border-t-0 border-border bg-surface p-4 space-y-3">
          {methodology && (
            <p className="text-sm text-text-secondary">{methodology}</p>
          )}
          <ul className="space-y-2">
            {sources.map((src, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <div>
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:text-accent-hover">
                      {src.name}
                    </a>
                  ) : (
                    <span className="font-medium text-text-primary">{src.name}</span>
                  )}
                  {src.date && <span className="text-text-tertiary ml-1">({src.date})</span>}
                  {src.note && <p className="text-xs text-text-tertiary mt-0.5">{src.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
