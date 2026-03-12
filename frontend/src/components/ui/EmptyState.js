import Button from './Button';

export default function EmptyState({ title, message, ctaLabel, onCta }) {
  return (
    <div className="card-surface p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {ctaLabel && onCta ? (
        <Button className="mt-4" onClick={onCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}
