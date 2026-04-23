'use client';

/**
 * BetterBond application shell — Epic 1, Story 1.2.
 *
 * The shared frame for every authenticated page. Provides three landmarks:
 *   <nav>    — BetterBond branding on the left, a primary link list in the
 *              middle, and the user menu on the right. Collapses to a menu
 *              button on mobile.
 *   <main>   — hosts the current page's content.
 *   <footer> — pinned to the bottom of the viewport (BA-3 Option A — sticky
 *              footer layout).
 *
 * Populated by later stories:
 *   Story 1.3 — role-aware nav links
 *   Story 1.5 — theme switcher
 *   Story 1.6 — toast container
 *   Story 1.7 — Reset Demo in footer
 *
 * BA decisions baked in:
 *   BA-1 Option A — mobile menu button opens an anchored dropdown below the
 *                   nav bar.
 *   BA-2 Option B — Sign Out lives in the user menu in the top nav, always
 *                   visible (even at 375px).
 *   BA-4 Option A — main region shows a route-transition skeleton when a
 *                   Suspense boundary is pending.
 */

import { Menu } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';

// Breakpoint boundary — below this width the inline nav list collapses to
// a menu button. Matches NFR4 (tablet at 768px).
const MOBILE_MAX_WIDTH = 767;

/**
 * React hook that watches a `(max-width: Npx)` media query and returns the
 * current match state. Uses React 18+ `useSyncExternalStore` semantics via
 * manual matchMedia subscription, which gives us a synchronous read during
 * render (so tests that mock matchMedia before mount observe the correct
 * initial value) without triggering cascading setState calls.
 *
 * SSR-safe: returns `false` during server render via the `getServerSnapshot`
 * path (the shell doesn't render on the server until after auth anyway).
 */
function useIsMobile(maxWidth: number = MOBILE_MAX_WIDTH): boolean {
  const query = `(max-width: ${maxWidth}px)`;

  const subscribe = (onChange: () => void): (() => void) => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }
    const mql = window.matchMedia(query);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Older Safari fallback
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  };

  const getSnapshot = (): boolean => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = (): boolean => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close the mobile dropdown when clicking outside of it.
  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // When we're no longer in the mobile breakpoint, the dropdown is never
  // rendered — derive the effective open state instead of tracking it in a
  // separate effect (keeps state consistent without cascading renders).
  const mobileDropdownOpen = isMobile && menuOpen;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <nav
        aria-label="Primary"
        className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6"
      >
        <div className="flex items-center gap-3" ref={containerRef}>
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Menu aria-hidden="true" />
            </Button>
          )}

          <span className="text-lg font-semibold tracking-tight">
            BetterBond
          </span>

          {/* Inline nav list — visible from the tablet breakpoint up. On
              mobile it's conditionally rendered inside the anchored
              dropdown below. */}
          {!isMobile && (
            <ul
              aria-label="Primary"
              className="ml-4 hidden items-center gap-4 md:flex"
            >
              {/* Populated by Story 1.3 (role-aware nav). Rendered as an empty
                  list now so the landmark and role=list node exist for
                  downstream tests and for the shell structure itself. */}
            </ul>
          )}

          {/* BA-1 Option A — anchored dropdown below the top nav */}
          {mobileDropdownOpen && (
            <div
              role="menu"
              aria-label="Primary navigation"
              className="absolute left-0 top-full mt-1 w-full border-b border-border bg-background p-4 shadow-md"
            >
              <ul aria-label="Primary" className="flex flex-col gap-3">
                {/* Populated by Story 1.3 — role-aware links go here. */}
              </ul>
            </div>
          )}
        </div>

        {/* BA-2 Option B — user menu is always visible in the top nav, even
            at 375px. Sign Out lives inside this menu (Story 1.1 BA-4). */}
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </nav>

      <main
        id="main-content"
        className="flex flex-1 flex-col px-4 py-6 md:px-6"
      >
        {children}
      </main>

      <footer
        aria-label="Site footer"
        className="border-t border-border bg-background px-4 py-3 text-sm text-muted-foreground md:px-6"
      >
        {/* Populated by Story 1.7 (Reset Demo) — that story will place the
            Reset Demo button as the primary focusable element in the footer.
            For now, the footer's About link keeps a focusable element in the
            reading-order chain so keyboard tests (AC-11) have a footer-local
            tab stop. */}
        <div className="flex items-center justify-between gap-4">
          <span>&copy; BetterBond Commission Payments POC</span>
          <a
            href="#main-content"
            className="text-sm underline-offset-4 hover:underline focus-visible:underline"
          >
            Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
