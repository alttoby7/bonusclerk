'use client';

interface TimelineStep {
  label: string;
  detail: string;
  icon?: string;
}

const defaultIcons = ['📝', '💰', '⏳', '✅', '🔓'];

export function BonusTimeline({ steps, title }: { steps: TimelineStep[]; title?: string }) {
  return (
    <div className="my-8 not-prose">
      {title && (
        <h4 className="mb-4 font-bold text-text-primary text-sm uppercase tracking-wide">{title}</h4>
      )}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border" />

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Node */}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface text-lg">
                {step.icon ?? defaultIcons[i] ?? `${i + 1}`}
              </div>
              {/* Content */}
              <div className="pt-1.5">
                <p className="font-semibold text-text-primary text-sm">{step.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
