/**
 * Dashboard — placeholder page for Epic 1, Story 1.1.
 *
 * Story 1.1 only requires /dashboard to be the redirect destination after a
 * successful sign-in. The real content comes from Epic 2.
 */

import { UserMenu } from '@/components/auth/user-menu';
import { getSession } from '@/lib/auth/auth-server';

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getSession();
  const identity = session?.user?.email ?? 'unknown';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="text-lg font-semibold">BetterBond</div>
        <UserMenu />
      </header>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Signed in as {identity}</p>
      </main>
    </div>
  );
}
