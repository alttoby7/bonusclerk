interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  id?: string;
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  id,
}: CardProps) {
  return (
    <div
      id={id}
      className={`rounded-xl border border-border bg-surface ${paddingStyles[padding]} ${
        hover ? 'transition-shadow hover:shadow-md hover:border-border-strong' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
