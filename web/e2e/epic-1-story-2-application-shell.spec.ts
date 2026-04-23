/**
 * Epic 1, Story 1.2 — Application shell and responsive layout
 *
 * End-to-end verification of the authenticated shell in a real Chromium
 * browser. Covers runtime-only scenarios that jsdom cannot exercise:
 *   AC-5  — no horizontal overflow at 375px mobile (matchMedia mocking in
 *           jsdom cannot assert computed overflow on <body>)
 *   AC-6  — no horizontal overflow at 768px tablet
 *   AC-7  — inline nav at 1280px desktop
 *   AC-8  — unauthenticated visit to /dashboard redirects to /auth/signin
 *           (Next.js server-side redirect — requires the full routing stack)
 *   AC-9  — post-sign-in destination is the Dashboard, even when the user
 *           was sent to /auth/signin from a DIFFERENT protected URL. This is
 *           the FRS-over-template check: the sign-in page currently honors
 *           the callbackUrl query parameter, and we verify R2 overrides it.
 *   BA-1  — mobile menu button opens an anchored dropdown (vs full-screen
 *           sheet or persistent icon row)
 *   BA-2  — Sign Out is reachable on mobile without opening the hamburger
 */

import { test, expect } from '@playwright/test';
import { adminUser } from './fixtures/credentials';

test.describe('Epic 1, Story 1.2: Application shell', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('AC-8: unauthenticated visitor to /dashboard is redirected to the sign-in page', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/signin/);

    // AC-8 also requires no flash of Dashboard content — the sign-in form
    // (BetterBond branding + password field) is what the user sees.
    await expect(page.getByText(/betterbond/i).first()).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('AC-9: signing in lands on /dashboard even when a callbackUrl query param points elsewhere', async ({
    page,
  }) => {
    // Simulate "the user was redirected to sign-in from a different protected
    // URL" by visiting the sign-in page with a callbackUrl query parameter.
    // This mirrors what the route guard (requireAuth) produces — it appends
    // the originally requested path as ?callbackUrl=<path>. Per FRS R2, the
    // landing page after successful sign-in is ALWAYS /dashboard, regardless
    // of what callbackUrl says.
    await page.goto('/auth/signin?callbackUrl=%2Fpayment-management');

    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // FRS R2 wins: the user lands on /dashboard, not /payment-management.
    await expect(page).toHaveURL('/dashboard');
  });

  test('AC-1 / AC-12: signed-in admin sees the three shell landmarks on /dashboard', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    // AC-4: BetterBond branding is inside the top nav on the left.
    const nav = page.getByRole('navigation');
    await expect(nav.getByText(/betterbond/i).first()).toBeVisible();
  });

  test('AC-7 / AC-5: desktop 1280px shows inline nav; mobile 375px collapses to a menu button', async ({
    page,
  }) => {
    // Sign in first (shell is only rendered on authenticated routes).
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');

    // Desktop breakpoint — inline nav visible, no hamburger.
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.getByRole('button', { name: /menu|open navigation/i }),
    ).toHaveCount(0);

    // Mobile breakpoint — hamburger visible, inline list hidden.
    await page.setViewportSize({ width: 375, height: 700 });
    await expect(
      page.getByRole('button', { name: /menu|open navigation/i }),
    ).toBeVisible();
  });

  test('AC-5: at 375px mobile, the body does not scroll horizontally', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.setViewportSize({ width: 375, height: 700 });

    // scrollWidth <= clientWidth means no horizontal overflow on <body>.
    const overflow = await page.evaluate(() => {
      const body = document.body;
      return {
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth,
      };
    });
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('AC-6: at 768px tablet, the body does not scroll horizontally', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.setViewportSize({ width: 768, height: 900 });

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });

  test('BA-2 Option B: Sign Out is reachable from the top nav at 375px without opening the hamburger', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.setViewportSize({ width: 375, height: 700 });

    // The user menu trigger (avatar/name) lives in the top nav and is
    // visible at 375px — the user does NOT need to open the hamburger first.
    const nav = page.getByRole('navigation');
    const userMenuTrigger = nav.getByRole('button', {
      name: /alice|alice\.admin@betterbond\.example/i,
    });
    await expect(userMenuTrigger).toBeVisible();

    // Open the user menu and click Sign Out — this ends the session.
    await userMenuTrigger.click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();

    // Successful sign-out lands on /auth/signin.
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('BA-1 Option A: tapping the mobile menu button opens an anchored dropdown with nav links', async ({
    page,
  }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill(adminUser.email);
    await page.getByLabel('Password').fill(adminUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.setViewportSize({ width: 375, height: 700 });

    const menuButton = page.getByRole('button', {
      name: /menu|open navigation/i,
    });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await menuButton.click();

    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    // The anchored dropdown below the top nav is visible — its menu role
    // labels it as the primary navigation affordance (BA-1 Option A).
    await expect(
      page.getByRole('menu', { name: /primary navigation/i }),
    ).toBeVisible();
  });
});
