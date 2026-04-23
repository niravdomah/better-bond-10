/**
 * Protected Layout — Epic 1, Story 1.2.
 *
 * Wraps every authenticated route in the BetterBond application shell:
 *   <nav>, <main>, <footer> landmarks rendered by @/components/shell/app-shell.
 *
 * Unauthenticated visitors are redirected to /auth/signin (AC-8). The shell
 * itself — including the route-transition skeleton for BA-4 Option A — lives
 * in the client AppShell component.
 */

import { Suspense } from 'react';

import { AppShell } from '@/components/shell/app-shell';
import { requireAuth } from '@/lib/auth/auth-server';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/**
 * Simple loading skeleton shown in the main region while a child route
 * suspends during navigation. BA-4 Option A — the user sees "something is
 * happening" instead of a blank page or stale content.
 */
function RouteTransitionSkeleton(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex flex-col gap-3 animate-pulse"
    >
      <div className="h-6 w-1/3 rounded bg-muted" />
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="h-48 w-full rounded bg-muted" />
    </div>
  );
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<React.ReactElement> {
  // Redirects to /auth/signin if not authenticated (AC-8)
  await requireAuth();

  return (
    <AppShell>
      <Suspense fallback={<RouteTransitionSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}
