type CalloutType = 'tip' | 'warning' | 'info';

const typeStyles: Record<CalloutType, { border: string; bg: string; icon: string }> = {
  tip: { border: 'border-l-success', bg: 'bg-success-light/50', icon: '💡' },
  warning: { border: 'border-l-warning', bg: 'bg-warning-light/50', icon: '⚠️' },
  info: { border: 'border-l-accent', bg: 'bg-accent-light/50', icon: 'ℹ️' },
};

export function Callout({
  children,
  type = 'info',
  title,
}: {
  children: React.ReactNode;
  type?: CalloutType;
  title?: string;
}) {
  const style = typeStyles[type];

  return (
    <div className={`my-6 rounded-r-lg border-l-4 ${style.border} ${style.bg} p-4`}>
      {title && (
        <p className="mb-1 font-semibold text-text-primary">
          {style.icon} {title}
        </p>
      )}
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  );
}
