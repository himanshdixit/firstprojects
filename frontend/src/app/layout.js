import './globals.css';
import AppShell from '@/components/layout/AppShell';
import Providers from '@/components/layout/Providers';

export const metadata = {
  title: 'Codex Blogging',
  description: 'Modern blogging platform UI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
