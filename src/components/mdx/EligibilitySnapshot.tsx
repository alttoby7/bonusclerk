interface SnapshotChip {
  label: string;
  type?: 'positive' | 'negative' | 'neutral' | 'warning';
}

const chipStyles = {
  positive: 'bg-success-light text-success border-success/20',
  negative: 'bg-danger-light text-danger border-danger/20',
  neutral: 'bg-surface-raised text-text-secondary border-border',
  warning: 'bg-warning-light text-warning border-warning/20',
};

export function EligibilitySnapshot({
  chips,
  bank,
  bonus,
}: {
  chips: SnapshotChip[];
  bank: string;
  bonus?: string;
}) {
  return (
    <div className="my-6 rounded-xl border border-border bg-surface p-5 not-prose">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-text-primary">{bank}</h4>
        {bonus && (
          <span className="font-money text-xl font-bold text-success">{bonus}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <span
            key={i}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
              chipStyles[chip.type ?? 'neutral']
            }`}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
