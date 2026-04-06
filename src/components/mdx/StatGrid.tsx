interface StatItem {
  value: string;
  label: string;
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'default';
}

const colorMap = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  default: 'text-text-primary',
};

export function StatGrid({ stats }: { stats: StatItem[] }) {
  const cols = stats.length <= 2 ? 'grid-cols-2' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className={`my-6 grid ${cols} gap-3 not-prose`}>
      {stats.map((stat, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4 text-center">
          <div className={`font-money text-2xl font-bold ${colorMap[stat.color ?? 'default']}`}>
            {stat.value}
          </div>
          <div className="mt-1 text-xs text-text-tertiary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
