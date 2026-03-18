import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
  secondary: 'bg-surface-raised text-text-primary hover:bg-surface-sunken border border-border',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
  outline: 'border-2 border-accent text-accent hover:bg-accent-dim',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
