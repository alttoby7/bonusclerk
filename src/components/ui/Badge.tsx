type BadgeVariant = 'active' | 'expiring' | 'expired' | 'ongoing' | 'new' | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-success-light text-success',
  expiring: 'bg-warning-light text-warning',
  expired: 'bg-danger-light text-danger',
  ongoing: 'bg-accent-light text-accent',
  new: 'bg-accent-light text-accent',
  default: 'bg-surface-raised text-text-secondary',
};

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
