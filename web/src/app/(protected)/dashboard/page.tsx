/**
 * Dashboard — placeholder page for Epic 1.
 *
 * Story 1.1 only requires /dashboard to be the redirect destination after a
 * successful sign-in. Story 1.2 wraps every authenticated page in the shared
 * AppShell (nav / main / footer), so this page only renders page-specific
 * content — the landmarks come from the shell.
 *
 * The real Dashboard content (charts, tiles, agency grid) is built in Epic 2.
 */

import { getSession } from '@/lib/auth/auth-server';

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await getSession();
  const identity = session?.user?.email ?? 'unknown';

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {identity}</p>
    </>
  );
}
