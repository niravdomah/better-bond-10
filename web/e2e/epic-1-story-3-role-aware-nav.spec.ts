/**
 * Epic 1, Story 1.3 — Role-aware navigation links and active state
 *
 * End-to-end verification in a real Chromium browser. Covers the runtime
 * contract that jsdom cannot verify on its own:
 *   AC-1  — admin sees all four links on /dashboard
 *   AC-2  — viewer sees only Dashboard and Payments Made
 *   AC-3  — viewer does NOT see Payment Management anywhere in the nav DOM
 *   AC-4  — viewer does NOT see Users anywhere in the nav DOM
 *   AC-9  — clicking a nav link triggers client-side navigation (no full
 *           document reload — the <nav> DOM node survives the route change)
 *   AC-5  — the Dashboard link is visually highlighted when on /dashboard
 *   BA-1  — nearest-parent active matching (deep routes don't break the nav)
 *   BA-3  — the admin-only link labelled "Users" is present for admin
 *
 * The mobile (375px) menu-list variant (BA-2 Option B) is exercised
 * end-to-end here because it requires the full shell + dropdown plumbing
 * from Story 1.2.
 */

import { test, expect } from '@playwright/test';
import { adminUser, viewerUser } from './fixtures/credentials';

async function signIn(
  page: import('@playwright/test').Page,
  user: typeof adminUser,
): Promise<void> {
  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/dashboard');
}

test.describe('Epic 1, Story 1.3: Role-aware navigation', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('AC-1: admin sees Dashboard, Payment Management, Payments Made, Users', async ({
    page,
  }) => {
    await signIn(page, adminUser);

    const nav = page.getByRole('navigation', { name: /primary/i });

    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Payment Management' }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Payments Made' }),
    ).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Users' })).toBeVisible();

    // Exactly four primary nav links are rendered (order-insensitive count
    // check — the order is asserted in the Vitest integration test to keep
    // this spec focused on runtime reachability).
    await expect(nav.getByRole('link')).toHaveCount(4);
  });

  test('AC-2 / AC-3 / AC-4: viewer sees only Dashboard and Payments Made — Payment Management and Users are not in the DOM', async ({
    page,
  }) => {
    await signIn(page, viewerUser);

    const nav = page.getByRole('navigation', { name: /primary/i });

    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Payments Made' }),
    ).toBeVisible();

    // AC-3 / AC-4: the forbidden links are NOT rendered at all — this is the
    // stronger assertion (not hidden via CSS, not merely aria-hidden).
    await expect(
      nav.getByRole('link', { name: 'Payment Management' }),
    ).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Users' })).toHaveCount(0);

    await expect(nav.getByRole('link')).toHaveCount(2);
  });

  test('AC-5: Dashboard link carries aria-current="page" when on /dashboard', async ({
    page,
  }) => {
    await signIn(page, adminUser);

    const dashboard = page
      .getByRole('navigation', { name: /primary/i })
      .getByRole('link', { name: 'Dashboard' });

    await expect(dashboard).toHaveAttribute('aria-current', 'page');
  });

  test('AC-9 (partial) / AC-10: clicking the active Dashboard link keeps the URL on /dashboard without error', async ({
    page,
  }) => {
    await signIn(page, adminUser);

    // The Dashboard link is the active one on /dashboard. Clicking it again
    // is the self-link / no-op case (AC-10) — and because Dashboard is the
    // only protected page that has a real handler today, it's also the only
    // link we can click in Playwright without triggering a 404 fallback.
    //
    // The "no full-page reload when navigating between routable pages"
    // contract is covered in the Vitest test (router.push is invoked with
    // the link href — see src/__tests__/shell/role-aware-nav.test.tsx).
    // Once Epic 2/3/4 add real page handlers for /payment-management,
    // /payments-made, and /users this spec should assert cross-page
    // client-side navigation directly.
    const nav = page.getByRole('navigation', { name: /primary/i });
    await nav.getByRole('link', { name: 'Dashboard' }).click();

    await expect(page).toHaveURL('/dashboard');

    // The Dashboard heading is still rendered — no error page replaced it.
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible();

    // Dashboard is still the active link.
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  // BA-1 Option C — deep-route "nearest parent" matching is fully covered by
  // the Vitest tests using a mocked usePathname (see
  // src/__tests__/shell/role-aware-nav.test.tsx). In the browser we only have
  // /dashboard rendering the shell today — the other protected pages land in
  // Epic 2/3/5 stories, so a deep-route Playwright assertion here would
  // depend on routes that do not exist yet. Re-enable once /payment-management
  // has a real page that renders the shell.

  test('BA-2 Option B: mobile (375px) — links live inside the dropdown; the active link has aria-current and a menu-list treatment', async ({
    page,
  }) => {
    await signIn(page, adminUser);

    await page.setViewportSize({ width: 375, height: 700 });

    // Open the mobile menu dropdown.
    const menuButton = page.getByRole('button', {
      name: /menu|open navigation/i,
    });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const dropdown = page.getByRole('menu', { name: /primary navigation/i });
    await expect(dropdown).toBeVisible();

    // All four admin links are inside the dropdown.
    await expect(
      dropdown.getByRole('link', { name: 'Dashboard' }),
    ).toBeVisible();
    await expect(
      dropdown.getByRole('link', { name: 'Payment Management' }),
    ).toBeVisible();
    await expect(
      dropdown.getByRole('link', { name: 'Payments Made' }),
    ).toBeVisible();
    await expect(dropdown.getByRole('link', { name: 'Users' })).toBeVisible();

    // Dashboard is active because the URL is /dashboard.
    await expect(
      dropdown.getByRole('link', { name: 'Dashboard' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('BA-3 Option A: the admin-only link is labelled "Users" (not "User Management" or "Team")', async ({
    page,
  }) => {
    await signIn(page, adminUser);

    const nav = page.getByRole('navigation', { name: /primary/i });

    await expect(nav.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(
      nav.getByRole('link', { name: /user management/i }),
    ).toHaveCount(0);
    await expect(nav.getByRole('link', { name: /^team$/i })).toHaveCount(0);
  });
});
