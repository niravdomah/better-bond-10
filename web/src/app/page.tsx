/**
 * Root route.
 *
 * AC-1 — unauthenticated visitors always land on /auth/signin.
 * AC-7 / AC-8 — already signed-in users go straight to /dashboard.
 */

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';

export default async function RootPage(): Promise<never> {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  redirect('/auth/signin');
}
