'use client';

export function getButtonMotion(prefersReducedMotion) {
  if (prefersReducedMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    whileHover: { y: -1.5, scale: 1.01 },
    whileTap: { scale: 0.985, y: 0 },
    transition: { type: 'spring', stiffness: 360, damping: 28, mass: 0.7 },
  };
}

export function getCardMotion(prefersReducedMotion, hover = true) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: undefined,
      whileHover: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    whileHover: hover ? { y: -4, scale: 1.004 } : undefined,
    transition: { type: 'spring', stiffness: 190, damping: 24, mass: 0.85 },
  };
}

export function getPageTransition(prefersReducedMotion) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: undefined,
      exit: undefined,
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
  };
}

export function getModalMotion(prefersReducedMotion) {
  if (prefersReducedMotion) {
    return {
      overlay: {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      },
      panel: {
        initial: false,
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 0, scale: 1 },
        transition: { duration: 0 },
      },
    };
  }

  return {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18, ease: 'easeOut' },
    },
    panel: {
      initial: { opacity: 0, y: 14, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 10, scale: 0.99 },
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
    },
  };
}
