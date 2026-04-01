'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { getButtonMotion } from '@/lib/motion';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const motionProps = getButtonMotion(prefersReducedMotion);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);

    if (nextIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <motion.button
      {...motionProps}
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,238,0.86))] p-2.5 text-slate-700 shadow-[0_12px_28px_rgba(18,12,7,0.06)] backdrop-blur transition hover:border-amber-300/80 hover:bg-white hover:shadow-[0_16px_32px_rgba(18,12,7,0.08)] dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.84))] dark:text-slate-100 dark:hover:bg-[#18130f]"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </motion.button>
  );
}
