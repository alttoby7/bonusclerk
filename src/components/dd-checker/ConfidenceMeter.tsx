import type { ConfidenceLevel } from '@/types/dd-checker';

const meterConfig: Record<ConfidenceLevel, { color: string; label: string }> = {
  high: { color: 'bg-success', label: 'High' },
  medium: { color: 'bg-warning', label: 'Medium' },
  low: { color: 'bg-danger', label: 'Low' },
  insufficient: { color: 'bg-text-tertiary', label: 'Insufficient' },
};

export function ConfidenceMeter({
  level,
  score,
  showLabel = true,
}: {
  level: ConfidenceLevel;
  score: number;
  showLabel?: boolean;
}) {
  const config = meterConfig[level];
  const width = Math.max(8, Math.round(score * 100));

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-surface-sunken overflow-hidden">
        <div
          className={`h-full rounded-full ${config.color} transition-all`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-secondary">{config.label}</span>
      )}
    </div>
  );
}
