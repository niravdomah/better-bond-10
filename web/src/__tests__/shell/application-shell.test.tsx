/**
 * Epic 1, Story 1.2 — Application shell and responsive layout
 *
 * Tests the BetterBond application shell (top nav, main region, footer) that
 * wraps every authenticated route in web/src/app/(protected)/layout.tsx.
 * These tests are the executable form of the acceptance criteria from:
 *   generated-docs/stories/epic-1-auth-shell-navigation/story-1-2-application-shell.md
 *   generated-docs/test-design/epic-1-auth-shell-navigation/story-2-application-shell-test-design.md
 *
 * User-resolved BA decisions that drive shell behavior:
 *  - BA-1 Option A: On 375px mobile, the collapsed nav opens an anchored
 *    dropdown below the top nav showing nav links and the user menu.
 *  - BA-2 Option B: Sign Out stays visible in the top nav bar (avatar/user
 *    menu) at all viewport sizes, even on mobile.
 *  - BA-3 Option A: The footer is pinned to the bottom of the viewport
 *    (sticky footer layout).
 *  - BA-4 Option A: During route transitions, a skeleton/loading indicator
 *    is shown in the main region.
 *
 * Coverage mapping (from test-handoff.md):
 *   AC-1, AC-2, AC-3, AC-4 — shell regions, persistence, main region
 *   AC-5, AC-7             — responsive nav collapse (matchMedia mock)
 *   AC-11, AC-12           — keyboard tab order, landmark roles
 *
 * Out-of-scope for Vitest (routed to Playwright / manual checklist):
 *   AC-5 overflow check, AC-6 tablet overflow, AC-8 real redirect flow,
 *   AC-9 post-sign-in destination, AC-10 cross-browser, AC-13 contrast.
 */

import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---------- Mocks for next-auth / next/navigation / next/headers ----------

type MockSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'viewer';
  };
  expires: string;
} | null;

const authMock: Mock<() => Promise<MockSession>> = vi.fn();
const redirectMock: Mock<(url: string) => never> = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: () => null,
    }),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: () => authMock(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// The UserMenu uses next-auth/react hooks — provide a matching session so it
// renders its trigger (and exposes the Sign Out menuitem when opened).
vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: '1',
        email: 'alice.admin@betterbond.example',
        name: 'Alice Admin',
        role: 'admin',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// ---------- matchMedia helper ----------

/**
 * Install a jsdom matchMedia mock that reports a specific viewport width.
 * Shell components read breakpoints via matchMedia('(min-width: 768px)') etc.
 */
function installMatchMedia(width: number): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList => {
      // Extract "min-width: Npx" or "max-width: Npx" from the query.
      const minMatch = /min-width:\s*(\d+)px/.exec(query);
      const maxMatch = /max-width:\s*(\d+)px/.exec(query);
      let matches = false;
      if (minMatch) {
        matches = width >= parseInt(minMatch[1]!, 10);
      } else if (maxMatch) {
        matches = width <= parseInt(maxMatch[1]!, 10);
      }
      return {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      } as unknown as MediaQueryList;
    },
  });
}

// ---------- Import the shell under test ----------
//
// The shell is expected to live in two pieces:
//   1. `(protected)/layout.tsx` — server component; calls requireAuth() then
//      renders a client AppShell wrapper around `children`.
//   2. `@/components/shell/app-shell.tsx` — client component rendering the
//      three landmarks and the responsive nav.
//
// We exercise the client AppShell directly because it holds the responsive
// behavior and is friendlier to jsdom than a React Server Component. The
// (protected)/layout.tsx server-side redirect behavior is covered by the
// existing `requireAuth` tests in auth-redirects.test.ts plus the Playwright
// spec — the shell tests focus on the rendered structure.

import { AppShell } from '@/components/shell/app-shell';

beforeEach(() => {
  vi.clearAllMocks();
  // Default viewport = desktop
  installMatchMedia(1280);
});

afterEach(() => {
  // Reset any <html> class pollution from ThemeProvider side effects.
  document.documentElement.classList.remove('dark', 'light');
});

// ============================================================================
// AC-1 / AC-12: three landmark regions present
// ============================================================================

describe('Shell landmarks (AC-1, AC-12)', () => {
  it('renders exactly one navigation, main, and contentinfo landmark', () => {
    render(
      <AppShell>
        <div>page content</div>
      </AppShell>,
    );

    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
  });

  it('renders the BetterBond branding inside the top nav', () => {
    render(
      <AppShell>
        <div>page content</div>
      </AppShell>,
    );

    const nav = screen.getByRole('navigation');
    // AC-4 — branding appears in the top nav on every authenticated screen.
    expect(within(nav).getByText(/betterbond/i)).toBeInTheDocument();
  });
});

// ============================================================================
// AC-3: children render inside <main>
// ============================================================================

describe('Main region hosts children (AC-3)', () => {
  it('places the children slot inside the <main> landmark', () => {
    render(
      <AppShell>
        <h1>Dashboard content</h1>
      </AppShell>,
    );

    const main = screen.getByRole('main');
    const heading = screen.getByRole('heading', {
      name: /dashboard content/i,
    });
    expect(main).toContainElement(heading);
    expect(
      within(main).getByRole('heading', { name: /dashboard content/i }),
    ).toBeInTheDocument();
  });
});

// ============================================================================
// AC-2: shell persists when children change
// ============================================================================

describe('Shell persists across navigation (AC-2)', () => {
  it('keeps the same nav and footer DOM nodes when children change', () => {
    const { rerender } = render(
      <AppShell>
        <div>first page</div>
      </AppShell>,
    );

    const navBefore = screen.getByRole('navigation');
    const footerBefore = screen.getByRole('contentinfo');

    rerender(
      <AppShell>
        <div>second page</div>
      </AppShell>,
    );

    const navAfter = screen.getByRole('navigation');
    const footerAfter = screen.getByRole('contentinfo');

    // Stable DOM identity — React reuses these nodes because the shell wraps
    // children. (Next.js App Router preserves layout trees between route
    // changes, and this is the in-memory proxy for that behavior.)
    expect(navAfter).toBe(navBefore);
    expect(footerAfter).toBe(footerBefore);

    // Main region body updates.
    expect(screen.getByText('second page')).toBeInTheDocument();
    expect(screen.queryByText('first page')).not.toBeInTheDocument();
  });
});

// ============================================================================
// AC-4 / BA-2 Option B: user menu visible in top nav on every viewport
// ============================================================================

describe('User menu visibility (AC-4, BA-2 Option B)', () => {
  it('shows the user menu trigger in the top nav on desktop (1280px)', () => {
    installMatchMedia(1280);
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    const nav = screen.getByRole('navigation');
    // The trigger bears the signed-in user's name/email and is a <button>.
    expect(
      within(nav).getByRole('button', {
        name: /alice|alice\.admin@betterbond\.example/i,
      }),
    ).toBeInTheDocument();
  });

  it('keeps the user menu visible in the top nav on mobile (375px) — BA-2 Option B', () => {
    installMatchMedia(375);
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    const nav = screen.getByRole('navigation');
    // Even at 375px, Sign Out must be reachable without opening the hamburger.
    expect(
      within(nav).getByRole('button', {
        name: /alice|alice\.admin@betterbond\.example/i,
      }),
    ).toBeInTheDocument();
  });
});

// ============================================================================
// AC-5 / AC-7: responsive breakpoint behavior
// ============================================================================

describe('Responsive nav (AC-5, AC-7, BA-1 Option A)', () => {
  it('at 375px mobile, renders a menu button and hides the inline nav link list', () => {
    installMatchMedia(375);
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    // The hamburger / menu button is present.
    expect(
      screen.getByRole('button', { name: /menu|open navigation/i }),
    ).toBeInTheDocument();

    // The inline nav link list (the <ul> containing primary route links) is
    // hidden on mobile — implementations may render it with hidden=true or
    // simply not render it at all. We assert that the list is NOT in the
    // accessibility tree when collapsed.
    //
    // The list has role="list" with an accessible label of "Primary".
    expect(
      screen.queryByRole('list', { name: /primary/i }),
    ).not.toBeInTheDocument();
  });

  it('at 375px mobile, clicking the menu button opens an anchored dropdown with nav links (BA-1 Option A)', async () => {
    installMatchMedia(375);
    const user = userEvent.setup();
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    const trigger = screen.getByRole('button', {
      name: /menu|open navigation/i,
    });

    // Initially the dropdown is closed.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('list', { name: /primary/i }),
    ).not.toBeInTheDocument();

    await user.click(trigger);

    // After clicking, the anchored dropdown is visible and the nav links list
    // becomes accessible.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list', { name: /primary/i })).toBeInTheDocument();
  });

  it('at 1280px desktop, renders the inline nav link list and hides the menu button', () => {
    installMatchMedia(1280);
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    expect(screen.getByRole('list', { name: /primary/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /menu|open navigation/i }),
    ).not.toBeInTheDocument();
  });
});

// ============================================================================
// AC-11: keyboard tab order is nav → main → footer
// ============================================================================

describe('Keyboard reading order (AC-11)', () => {
  it('tabs through nav items, then main content, then footer content with no traps', async () => {
    installMatchMedia(1280); // ensure inline nav is rendered so there ARE nav focusables
    const user = userEvent.setup();
    render(
      <AppShell>
        <button type="button">Main action</button>
      </AppShell>,
    );

    const nav = screen.getByRole('navigation');
    const main = screen.getByRole('main');
    const footer = screen.getByRole('contentinfo');

    // Repeatedly Tab and record the region each focused element belongs to.
    const regions: string[] = [];
    const maxSteps = 20;
    for (let i = 0; i < maxSteps; i++) {
      await user.tab();
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body) break;
      if (nav.contains(active)) regions.push('nav');
      else if (main.contains(active)) regions.push('main');
      else if (footer.contains(active)) regions.push('footer');
      else regions.push('other');
    }

    // The tab traversal must visit each region at least once…
    expect(regions).toContain('nav');
    expect(regions).toContain('main');
    expect(regions).toContain('footer');

    // …and must visit them in the correct reading order. The first nav hit
    // must come before the first main hit, which must come before the first
    // footer hit.
    const firstNav = regions.indexOf('nav');
    const firstMain = regions.indexOf('main');
    const firstFooter = regions.indexOf('footer');
    expect(firstNav).toBeLessThan(firstMain);
    expect(firstMain).toBeLessThan(firstFooter);
  });
});

// ============================================================================
// BA-3 Option A: sticky footer layout hook
// ============================================================================

describe('Sticky footer (BA-3 Option A)', () => {
  it('renders the shell with a flex column layout that pushes the footer to the viewport bottom', () => {
    render(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    // The outer shell container expresses the sticky-footer pattern via
    // Tailwind classes on the root element: min-h-screen + flex + flex-col.
    // We assert on the class list so the implementation stays free to choose
    // the exact markup — it just has to use the recognized sticky-footer
    // pattern.
    const nav = screen.getByRole('navigation');
    const shellRoot = nav.parentElement;
    expect(shellRoot).not.toBeNull();
    if (!shellRoot) return;

    expect(shellRoot.className).toMatch(/\bflex\b/);
    expect(shellRoot.className).toMatch(/\bflex-col\b/);
    expect(shellRoot.className).toMatch(/min-h-screen/);

    // Main must be able to grow to fill the space between nav and footer.
    const main = screen.getByRole('main');
    expect(main.className).toMatch(/\bflex-1\b/);
  });
});
