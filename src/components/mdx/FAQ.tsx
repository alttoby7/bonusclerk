'use client';

import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

export function FAQ({ items, title = 'Frequently Asked Questions' }: { items: FAQItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="my-8 not-prose">
      <h3 className="mb-4 text-lg font-bold text-text-primary">{title}</h3>
      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-surface-raised"
              aria-expanded={open === i}
            >
              <span className="font-medium text-sm text-text-primary">{item.q}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-200 ${
                  open === i ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map(item => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />
    </div>
  );
}
