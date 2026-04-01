import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import {
  fieldSizeClasses,
  uiErrorClass,
  uiFieldClass,
  uiHelpClass,
  uiLabelClass,
  uiLabelHintClass,
} from './styles';

const TextArea = forwardRef(function TextArea(
  {
    label,
    helperText,
    error,
    className,
    containerClassName,
    labelClassName,
    labelHint,
    labelAction,
    size = 'md',
    resize = 'vertical',
    id,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const resolvedId = id || generatedId;

  return (
    <div className={clsx('block space-y-1.5', containerClassName)}>
      {label || labelAction || labelHint ? (
        <div className="flex items-center justify-between gap-3">
          {label ? (
            <label htmlFor={resolvedId} className={clsx(uiLabelClass, labelClassName)}>
              {label}
            </label>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {labelHint ? <span className={uiLabelHintClass}>{labelHint}</span> : null}
            {labelAction}
          </div>
        </div>
      ) : null}

      <textarea
        id={resolvedId}
        ref={ref}
        className={clsx(
          uiFieldClass,
          fieldSizeClasses[size] || fieldSizeClasses.md,
          'min-h-[120px]',
          resize === 'none' && 'resize-none',
          resize === 'both' && 'resize',
          resize === 'vertical' && 'resize-y',
          error &&
            'border-rose-500 ring-2 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-400/50',
          className
        )}
        {...props}
      />

      {error ? <p className={uiErrorClass}>{error}</p> : null}
      {!error && helperText ? <p className={uiHelpClass}>{helperText}</p> : null}
    </div>
  );
});

export default TextArea;
