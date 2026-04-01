import { forwardRef, useId } from 'react';
import clsx from 'clsx';
import {
  fieldShellSizeClasses,
  fieldSizeClasses,
  uiErrorClass,
  uiFieldClass,
  uiFieldInputClass,
  uiFieldShellClass,
  uiHelpClass,
  uiLabelClass,
  uiLabelHintClass,
} from './styles';

const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    className,
    containerClassName,
    labelClassName,
    labelHint,
    labelAction,
    fieldClassName,
    prefix,
    suffix,
    startAdornment,
    endAdornment,
    size = 'md',
    id,
    disabled,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const resolvedId = id || generatedId;
  const hasShellContent = prefix || suffix || startAdornment || endAdornment;

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

      {hasShellContent ? (
        <div
          className={clsx(
            uiFieldShellClass,
            fieldShellSizeClasses[size] || fieldShellSizeClasses.md,
            error &&
              'border-rose-500 ring-2 ring-rose-400/50 focus-within:border-rose-500 focus-within:ring-rose-400/50',
            disabled && 'opacity-70',
            fieldClassName
          )}
        >
          {prefix ? (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {prefix}
            </span>
          ) : null}
          {startAdornment ? (
            <span className="shrink-0 text-slate-400 dark:text-slate-500">
              {startAdornment}
            </span>
          ) : null}
          <input
            id={resolvedId}
            ref={ref}
            disabled={disabled}
            className={clsx(uiFieldInputClass, className)}
            {...props}
          />
          {endAdornment ? (
            <span className="shrink-0 text-slate-400 dark:text-slate-500">
              {endAdornment}
            </span>
          ) : null}
          {suffix ? (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {suffix}
            </span>
          ) : null}
        </div>
      ) : (
        <input
          id={resolvedId}
          ref={ref}
          disabled={disabled}
          className={clsx(
            uiFieldClass,
            fieldSizeClasses[size] || fieldSizeClasses.md,
            error &&
              'border-rose-500 ring-2 ring-rose-400/50 focus:border-rose-500 focus:ring-rose-400/50',
            className
          )}
          {...props}
        />
      )}

      {error ? <p className={uiErrorClass}>{error}</p> : null}
      {!error && helperText ? <p className={uiHelpClass}>{helperText}</p> : null}
    </div>
  );
});

export default Input;
