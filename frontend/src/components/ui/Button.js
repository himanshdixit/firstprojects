'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { getButtonMotion } from '@/lib/motion';
import Loader from './Loader';
import {
  buttonSizeClasses,
  buttonVariantClasses,
  uiFocusRingClass,
} from './styles';

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  loadingLabel = 'Loading',
  fullWidth = false,
  iconOnly = false,
  as: Component = motion.button,
  type,
  disabled = false,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = getButtonMotion(prefersReducedMotion);
  const isMotionButton = Component === motion.button;
  const isNativeButton = isMotionButton || Component === 'button';
  const isDisabled = disabled || loading;
  const componentProps = {
    ...props,
    ...(isNativeButton ? { type: type || 'button', disabled: isDisabled } : {}),
    ...(!isNativeButton && isDisabled ? { 'aria-disabled': true } : {}),
  };

  return (
    <Component
      {...(isMotionButton ? motionProps : {})}
      {...componentProps}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-200 ease-out will-change-transform disabled:cursor-not-allowed disabled:opacity-60',
        uiFocusRingClass,
        buttonSizeClasses[size] || buttonSizeClasses.md,
        iconOnly && size !== 'icon' && 'aspect-square px-0',
        fullWidth && 'w-full',
        buttonVariantClasses[variant] || buttonVariantClasses.primary,
        className
      )}
    >
      {loading ? (
        <Loader
          inline
          size={size === 'lg' || size === 'xl' ? 'sm' : 'xs'}
          variant={variant === 'primary' || variant === 'danger' ? 'inverse' : 'brand'}
          label={loadingLabel}
        />
      ) : null}
      {!loading && leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {children}
      {!loading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </Component>
  );
}
