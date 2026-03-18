export function Container({
  children,
  className = '',
  size = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}) {
  const maxWidth = {
    default: 'max-w-6xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-7xl',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth[size]} ${className}`}>
      {children}
    </div>
  );
}
