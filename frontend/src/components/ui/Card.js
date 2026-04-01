'use client';

import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { getCardMotion } from '@/lib/motion';
import { cardPaddingClasses, cardVariantClasses, cn } from './styles';

export function CardHeader({ children, className = '' }) {
  return <div className={cn('flex items-start justify-between gap-4', className)}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={cn(
        'mt-6 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-800',
        className
      )}
    >
      {children}
    </div>
  );
}

export function BlogCard(props) {
  return <Card variant="blog" {...props} />;
}

export function DashboardCard(props) {
  return <Card variant="dashboard" {...props} />;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = true,
  variant = 'default',
  as: Component = motion.section,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = getCardMotion(prefersReducedMotion, hover);
  const isMotionSection = Component === motion.section;

  return (
    <Component
      {...(isMotionSection ? motionProps : {})}
      {...props}
      className={clsx(
        cardVariantClasses[variant] || cardVariantClasses.default,
        'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out will-change-transform hover:border-amber-200/80 hover:shadow-[0_28px_64px_rgba(143,107,51,0.16)] dark:hover:border-amber-300/15 dark:hover:shadow-[0_28px_64px_rgba(0,0,0,0.42)]',
        !hover && 'hover:shadow-none dark:hover:shadow-none',
        cardPaddingClasses[padding] || cardPaddingClasses.md,
        className
      )}
    >
      {children}
    </Component>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
