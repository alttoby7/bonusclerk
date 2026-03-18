import type { DDStatus } from '@/types/dd-checker';

const statusConfig: Record<DDStatus, { label: string; className: string }> = {
  'likely-works': {
    label: 'Likely Works',
    className: 'bg-success-light text-success',
  },
  'mixed': {
    label: 'Mixed Reports',
    className: 'bg-warning-light text-warning',
  },
  'likely-fails': {
    label: 'Likely Fails',
    className: 'bg-danger-light text-danger',
  },
  'not-enough-data': {
    label: 'Not Enough Data',
    className: 'bg-surface-raised text-text-tertiary',
  },
};

export function StatusBadge({ status }: { status: DDStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
