'use client';

import { motion } from 'framer-motion';

export const springTransition = {
  type: 'spring',
  stiffness: 240,
  damping: 24,
  mass: 0.6,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={{ ...springTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.07,
            delayChildren: 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: springTransition },
      }}
    >
      {children}
    </motion.div>
  );
}
