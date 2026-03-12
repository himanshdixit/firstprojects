'use client';

import { motion } from 'framer-motion';

export default function Card({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22, mass: 0.7 }}
      whileHover={{ y: -3 }}
      className={`card-surface p-5 transition-transform duration-300 sm:p-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}
