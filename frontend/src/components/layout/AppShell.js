'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AppShell({ children }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container-shell py-8">{children}</main>
      <Footer />
    </div>
  );
}
