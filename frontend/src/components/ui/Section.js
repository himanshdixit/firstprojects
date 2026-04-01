import clsx from 'clsx';
import Container from './Container';

export default function Section({
  children,
  className = '',
  contentClassName = '',
  eyebrow,
  title,
  description,
  actions,
  size = 'default',
  surface = false,
}) {
  return (
    <section className={clsx('py-3 sm:py-4', className)}>
      <Container size={size}>
        <div
          className={clsx(
            'space-y-6',
            surface && 'card-elevated p-6 sm:p-8 lg:p-10',
            contentClassName
          )}
        >
          {eyebrow || title || description || actions ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                {title ? <h1 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h1> : null}
                {description ? (
                  <p className="editorial-copy mt-3 max-w-2xl text-base sm:text-[15px]">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          ) : null}

          {children}
        </div>
      </Container>
    </section>
  );
}
