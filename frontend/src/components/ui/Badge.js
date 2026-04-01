import clsx from 'clsx';
import { badgeSizeClasses, badgeVariantClasses } from './styles';

export default function Badge({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  icon,
  caps = true,
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        caps && 'uppercase tracking-[0.18em]',
        badgeSizeClasses[size] || badgeSizeClasses.md,
        badgeVariantClasses[variant] || badgeVariantClasses.default,
        className
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </span>
  );
}
