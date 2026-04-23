/**
 * Server-side auth helpers for BetterBond.
 *
 * Use in Server Components and Server Actions only. Client components should
 * use @/lib/auth/auth-client instead.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';
import { hasRole } from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types/roles';

import type { Session } from 'next-auth';

/**
 * Require a signed-in session. Redirects to /auth/signin when no session exists.
 * Covers AC-1 (unauthenticated visitor is always routed to sign-in).
 */
export async function requireAuth(callbackUrl?: string): Promise<Session> {
  const session = await auth();

  if (!session) {
    let redirectUrl = callbackUrl;
    if (!redirectUrl) {
      const headersList = await headers();
      const pathname =
        headersList.get('x-pathname') || headersList.get('x-invoke-path');
      if (pathname) {
        redirectUrl = pathname;
      }
    }

    const signInUrl = redirectUrl
      ? `/auth/signin?callbackUrl=${encodeURIComponent(redirectUrl)}`
      : '/auth/signin';
    redirect(signInUrl);
  }

  return session;
}

/** Require the current user to have the given exact role. */
export async function requireRole(
  role: UserRole,
  callbackUrl?: string,
): Promise<Session> {
  const session = await requireAuth(callbackUrl);

  if (!hasRole(session.user, role)) {
    redirect('/auth/forbidden');
  }

  return session;
}

/** Returns the current session or null. */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/** True when the user is signed in and has the given role. */
export async function checkRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  if (!session) return false;
  return hasRole(session.user, role);
}
