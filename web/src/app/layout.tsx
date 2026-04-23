import type { Metadata } from 'next';
import './globals.css';

import { SessionProvider } from '@/components/auth/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from '@/components/toast/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'BetterBond Commission Payments',
  description:
    'BetterBond internal console for tracking, parking, batching, and invoicing agent commissions.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <SessionProvider session={session}>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">{children}</main>
              </div>
              <ToastContainer />
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
