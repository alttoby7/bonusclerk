import type { ConfidenceLevel } from '@/types/dd-checker';

const dotConfig: Record<ConfidenceLevel, { color: string; label: string }> = {
  high: { color: 'bg-success', label: 'High' },
  medium: { color: 'bg-warning', label: 'Medium' },
  low: { color: 'bg-danger', label: 'Low' },
  insufficient: { color: 'bg-text-tertiary', label: 'Insufficient' },
};

export function ConfidenceDot({
  level,
  showLabel = true,
}: {
  level: ConfidenceLevel;
  showLabel?: boolean;
}) {
  const config = dotConfig[level];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${config.color}`} />
      {showLabel && <span className="text-xs text-text-secondary">{config.label}</span>}
    </span>
  );
}
