import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/ui/Callout';
import { BonusCardEmbed } from '@/components/mdx/BonusCardEmbed';
import { BonusTable } from '@/components/mdx/BonusTable';
import { DDCheckerCta } from '@/components/mdx/DDCheckerCta';
import { ProsCons } from '@/components/mdx/ProsCons';
import { KeyTakeaway } from '@/components/mdx/KeyTakeaway';
import { BonusTimeline } from '@/components/mdx/BonusTimeline';
import { EligibilitySnapshot } from '@/components/mdx/EligibilitySnapshot';
import { RequirementChecklist } from '@/components/mdx/RequirementChecklist';
import { FAQ } from '@/components/mdx/FAQ';
import { EffectiveValue } from '@/components/mdx/EffectiveValue';
import { SourceDrawer } from '@/components/mdx/SourceDrawer';
import { QuickAnswer } from '@/components/mdx/QuickAnswer';
import { StatGrid } from '@/components/mdx/StatGrid';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    BonusCardEmbed,
    BonusTable,
    DDCheckerCta,
    ProsCons,
    KeyTakeaway,
    BonusTimeline,
    EligibilitySnapshot,
    RequirementChecklist,
    FAQ,
    EffectiveValue,
    SourceDrawer,
    QuickAnswer,
    StatGrid,
    // Add id anchors to headings for TOC linking
    h2: ({ children, ...props }) => {
      const id = slugify(children);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const id = slugify(children);
      return <h3 id={id} {...props}>{children}</h3>;
    },
  };
}

function slugify(children: React.ReactNode): string {
  const text = typeof children === 'string' ? children : String(children ?? '');
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
