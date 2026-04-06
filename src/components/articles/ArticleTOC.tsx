'use client';

import { useEffect, useState } from 'react';
import type { TocEntry } from '@/types/article';

export function ArticleTOC({ items }: { items: TocEntry[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-24">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        On this page
      </h4>
      <ul className="space-y-1.5 border-l border-border pl-3">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm transition-colors ${
                item.level === 3 ? 'pl-3' : ''
              } ${
                activeId === item.id
                  ? 'font-medium text-accent'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
