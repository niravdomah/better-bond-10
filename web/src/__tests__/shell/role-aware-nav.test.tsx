/**
 * Epic 1, Story 1.3 — Role-aware navigation links and active state.
 *
 * Tests the `TopNav` component (the role-aware link list rendered inside the
 * shell's primary <nav>). Executable form of the acceptance criteria from:
 *   generated-docs/stories/epic-1-auth-shell-navigation/story-3-role-aware-nav.md
 *   generated-docs/test-design/epic-1-auth-shell-navigation/story-3-role-aware-nav-test-design.md
 *
 * BA decisions baked in:
 *   BA-1 Option C — active state on non-matching routes highlights the nearest
 *                   parent link, falling back to Dashboard when nothing matches.
 *   BA-2 Option B — inside the mobile dropdown the active link uses a menu-list
 *                   variant (leading indicator / distinct treatment) rather
 *                   than the desktop inline style.
 *   BA-3 Option A — the Users nav link is labelled "Users".
 *
 * Coverage mapping (from test-handoff.md):
 *   AC-1..AC-4  — link visibility by role
 *   AC-5..AC-8  — active-state detection via usePathname
 *   AC-9, AC-10 — next/link renders <a href>, click-on-active is a no-op
 *   AC-11       — keyboard tab order + Enter activation (router.push)
 *   AC-12       — semantic contract: accessible names + aria-current
 *   AC-13       — coarse axe pass (authoritative contrast lives in QA manual check)
 *
 * Out-of-scope for Vitest (routed to Playwright / manual checklist):
 *   AC-9 "no full-page reload" contract (browser-only)
 *   AC-13 computed contrast against the MortgageMax palette (browser-only)
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

// ---------- Mocks ----------

type SessionRole = 'admin' | 'viewer';
type MockSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: SessionRole;
  };
  expires: string;
} | null;

const useSessionMock: Mock = vi.fn();
const usePathnameMock: Mock<() => string> = vi.fn(() => '/dashboard');
const routerPushMock: Mock<(url: string) => void> = vi.fn();

vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: () => useSessionMock(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({
    push: (url: string) => routerPushMock(url),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// next/link renders as a plain <a> in tests but honors onClick + router push
// well enough for our assertions (we assert the href is correct).
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        // Simulate client-side push: call the mock, but DO NOT actually
        // navigate (we don't want jsdom to error or reload).
        e.preventDefault();
        routerPushMock(href);
        if (rest.onClick) rest.onClick(e);
      }}
    >
      {children}
    </a>
  ),
}));

// ---------- helpers ----------

function setSession(role: SessionRole | null): void {
  if (!role) {
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' });
    return;
  }
  const data: MockSession = {
    user: {
      id: role === 'admin' ? '1' : '2',
      email:
        role === 'admin'
          ? 'alice.admin@betterbond.example'
          : 'vera.viewer@agency.example',
      name: role === 'admin' ? 'Alice Admin' : 'Vera Viewer',
      role,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  useSessionMock.mockReturnValue({ data, status: 'authenticated' });
}

function setPath(pathname: string): void {
  usePathnameMock.mockReturnValue(pathname);
}

// ---------- Import the component under test ----------

import { TopNav } from '@/components/nav/top-nav';

beforeEach(() => {
  vi.clearAllMocks();
  setSession('admin');
  setPath('/dashboard');
});

// ============================================================================
// AC-1: admin sees all four nav links in order
// ============================================================================

describe('Admin link visibility (AC-1)', () => {
  it('renders Dashboard, Payment Management, Payments Made, Users in that order', () => {
    setSession('admin');
    setPath('/dashboard');

    render(<TopNav />);

    const links = screen.getAllByRole('link');
    const names = links.map((a) => a.textContent?.trim());

    expect(names).toEqual([
      'Dashboard',
      'Payment Management',
      'Payments Made',
      'Users',
    ]);
    expect(links).toHaveLength(4);
  });

  it('each admin link points at its expected route', () => {
    setSession('admin');
    render(<TopNav />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(
      screen.getByRole('link', { name: 'Payment Management' }),
    ).toHaveAttribute('href', '/payment-management');
    expect(screen.getByRole('link', { name: 'Payments Made' })).toHaveAttribute(
      'href',
      '/payments-made',
    );
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'href',
      '/users',
    );
  });
});

// ============================================================================
// AC-2 / AC-3 / AC-4: viewer link visibility
// ============================================================================

describe('Viewer link visibility (AC-2, AC-3, AC-4)', () => {
  it('renders only Dashboard and Payments Made, in that order', () => {
    setSession('viewer');
    setPath('/dashboard');

    render(<TopNav />);

    const links = screen.getAllByRole('link');
    const names = links.map((a) => a.textContent?.trim());

    expect(names).toEqual(['Dashboard', 'Payments Made']);
    expect(links).toHaveLength(2);
  });

  it('does not render the Payment Management link at all for a viewer (AC-3)', () => {
    setSession('viewer');
    render(<TopNav />);

    expect(
      screen.queryByRole('link', { name: /payment management/i }),
    ).toBeNull();
  });

  it('does not render the Users link at all for a viewer (AC-4)', () => {
    setSession('viewer');
    render(<TopNav />);

    expect(screen.queryByRole('link', { name: /^users$/i })).toBeNull();
  });
});

// ============================================================================
// AC-5..AC-8: active-state detection (exact matches)
// ============================================================================

describe('Active-state detection — exact-match routes (AC-5, AC-6, AC-7, AC-8)', () => {
  it('AC-5: Dashboard link is the active link when on /dashboard', () => {
    setSession('admin');
    setPath('/dashboard');

    render(<TopNav />);

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard).toHaveAttribute('aria-current', 'page');

    // None of the other links carry aria-current.
    for (const name of ['Payment Management', 'Payments Made', 'Users']) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute(
        'aria-current',
      );
    }

    // Exactly one link is marked as the current page.
    const currentLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(currentLinks).toHaveLength(1);
  });

  it('AC-6: Payment Management link is active when on /payment-management (admin)', () => {
    setSession('admin');
    setPath('/payment-management');

    render(<TopNav />);

    expect(
      screen.getByRole('link', { name: 'Payment Management' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('AC-7: Payments Made link is active when on /payments-made (viewer)', () => {
    setSession('viewer');
    setPath('/payments-made');

    render(<TopNav />);

    expect(screen.getByRole('link', { name: 'Payments Made' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('AC-8: Users link is active when on /users (admin)', () => {
    setSession('admin');
    setPath('/users');

    render(<TopNav />);

    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const name of ['Dashboard', 'Payment Management', 'Payments Made']) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });

  it('renders an active-state visual class distinct from non-active links', () => {
    setSession('admin');
    setPath('/payment-management');

    render(<TopNav />);

    const active = screen.getByRole('link', { name: 'Payment Management' });
    const inactive = screen.getByRole('link', { name: 'Dashboard' });

    // We don't pin the exact class name here — we just assert the active link's
    // class set differs from the inactive link's. This is observable behavior
    // (the active link looks different) without over-specifying tokens.
    expect(active.className).not.toEqual(inactive.className);
  });
});

// ============================================================================
// BA-1 Option C: nearest-parent active match for deep / unknown routes
// ============================================================================

describe('Active-state detection — BA-1 Option C (nearest parent match)', () => {
  it('highlights Payment Management when on /payment-management/batch/123 (admin)', () => {
    setSession('admin');
    setPath('/payment-management/batch/123');

    render(<TopNav />);

    expect(
      screen.getByRole('link', { name: 'Payment Management' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );

    // Exactly one link is marked as the current page.
    const currentLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(currentLinks).toHaveLength(1);
  });

  it('highlights Payments Made when on /payments-made/42 (viewer)', () => {
    setSession('viewer');
    setPath('/payments-made/42');

    render(<TopNav />);

    expect(screen.getByRole('link', { name: 'Payments Made' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('falls back to Dashboard when the path does not match any nav target', () => {
    setSession('admin');
    setPath('/some/future/settings');

    render(<TopNav />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const name of ['Payment Management', 'Payments Made', 'Users']) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute(
        'aria-current',
      );
    }
  });
});

// ============================================================================
// AC-9: links render via next/link with the expected href (client-side nav).
// The "no full-page reload" contract is verified in Playwright.
// ============================================================================

describe('Client-side navigation shape (AC-9)', () => {
  it('each nav link is an <a> element with a same-origin href pointing at the route', () => {
    setSession('admin');
    render(<TopNav />);

    for (const { name, href } of [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Payment Management', href: '/payment-management' },
      { name: 'Payments Made', href: '/payments-made' },
      { name: 'Users', href: '/users' },
    ]) {
      const link = screen.getByRole('link', { name });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', href);
    }
  });

  it('clicking a nav link calls router.push with the link target', async () => {
    setSession('admin');
    setPath('/dashboard');
    const user = userEvent.setup();

    render(<TopNav />);

    await user.click(screen.getByRole('link', { name: 'Payments Made' }));

    expect(routerPushMock).toHaveBeenCalledWith('/payments-made');
  });
});

// ============================================================================
// AC-10: clicking the active link is a no-op (same page, no error)
// ============================================================================

describe('Clicking the active link (AC-10)', () => {
  it('stays on the same page and does not throw when the active link is clicked', async () => {
    setSession('admin');
    setPath('/dashboard');
    const user = userEvent.setup();

    render(<TopNav />);

    const dashboard = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboard).toHaveAttribute('aria-current', 'page');

    await expect(user.click(dashboard)).resolves.not.toThrow();

    // aria-current still on the same link; no other link became current.
    expect(dashboard).toHaveAttribute('aria-current', 'page');
    const currentLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(currentLinks).toHaveLength(1);
  });
});

// ============================================================================
// AC-11: keyboard tab order matches visual order; Enter activates
// ============================================================================

describe('Keyboard traversal (AC-11)', () => {
  it('tabs through all four admin links in visual order', async () => {
    setSession('admin');
    setPath('/dashboard');
    const user = userEvent.setup();

    render(<TopNav />);

    const expectedNames = [
      'Dashboard',
      'Payment Management',
      'Payments Made',
      'Users',
    ];

    const visited: string[] = [];
    for (let i = 0; i < expectedNames.length; i++) {
      await user.tab();
      const active = document.activeElement as HTMLElement | null;
      if (active && active.tagName === 'A') {
        visited.push(active.textContent?.trim() ?? '');
      }
    }

    expect(visited).toEqual(expectedNames);
  });

  it('pressing Enter on a focused nav link calls router.push with its href', async () => {
    setSession('admin');
    setPath('/dashboard');
    const user = userEvent.setup();

    render(<TopNav />);

    const payments = screen.getByRole('link', { name: 'Payments Made' });
    payments.focus();
    expect(document.activeElement).toBe(payments);

    await user.keyboard('{Enter}');

    expect(routerPushMock).toHaveBeenCalledWith('/payments-made');
  });
});

// ============================================================================
// AC-12: semantic contract (accessible names + aria-current)
// ============================================================================

describe('Screen-reader semantics (AC-12)', () => {
  it('each link exposes its visible text as its accessible name', () => {
    setSession('admin');
    render(<TopNav />);

    for (const name of [
      'Dashboard',
      'Payment Management',
      'Payments Made',
      'Users',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('only the link whose route matches usePathname has aria-current="page"', () => {
    setSession('admin');
    setPath('/payment-management');
    render(<TopNav />);

    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]!.textContent?.trim()).toBe('Payment Management');
  });
});

// ============================================================================
// AC-13 (coarse): no axe violations on the rendered nav
// ============================================================================

describe('Accessibility smoke test (AC-13)', () => {
  it('has no axe violations for an admin at /dashboard', async () => {
    setSession('admin');
    setPath('/dashboard');

    render(<TopNav />);
    const nav = screen.getAllByRole('link')[0]!.closest('ul');
    const results = await axe(nav!);
    // No color-contrast / naming / role violations in the nav subtree.
    // Real contrast against the MortgageMax palette is verified manually.
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations for a viewer at /payments-made', async () => {
    setSession('viewer');
    setPath('/payments-made');

    render(<TopNav />);
    const nav = screen.getAllByRole('link')[0]!.closest('ul');
    const results = await axe(nav!);
    expect(results.violations).toEqual([]);
  });
});

// ============================================================================
// BA-2 Option B: mobile (menu) variant still satisfies the semantic contract
// ============================================================================

describe('Mobile menu variant (BA-2 Option B)', () => {
  it('renders the same links in a menu-list variant when variant="menu"', () => {
    setSession('admin');
    setPath('/payment-management');

    render(<TopNav variant="menu" />);

    // Same four links, same accessible names, same active link via
    // aria-current. BA-2 only changes the visual highlight inside the menu
    // variant — the semantic contract is unchanged.
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(
      screen.getByRole('link', { name: 'Payment Management' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('applies a menu-list active-state class (BA-2 Option B) that differs from the inline variant', () => {
    setSession('admin');
    setPath('/payment-management');

    const { rerender } = render(<TopNav variant="inline" />);
    const inlineActive = screen.getByRole('link', {
      name: 'Payment Management',
    }).className;

    rerender(<TopNav variant="menu" />);
    const menuActive = screen.getByRole('link', {
      name: 'Payment Management',
    }).className;

    // The inline inline-nav highlight and the mobile menu-list highlight are
    // different visual treatments (BA-2 Option B). We only assert the active
    // classes differ — no token-level inspection.
    expect(menuActive).not.toEqual(inlineActive);
  });
});

// ============================================================================
// Safety: unauthenticated session renders nothing (no crash)
// ============================================================================

describe('Unauthenticated fallback', () => {
  it('renders nothing when there is no session (component is used inside the shell which already gates on auth)', () => {
    setSession(null);
    render(<TopNav />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
