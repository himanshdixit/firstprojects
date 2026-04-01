import { cn } from './styles';

export default function InsightCard({
  eyebrow,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <div className={cn('card-surface p-5 sm:p-6', className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="mt-3 text-2xl">{title}</h2> : null}
      {description ? <p className="editorial-copy mt-3">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
