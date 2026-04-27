'use client';

/**
 * BetterBond top-navigation link list — Epic 1, Story 1.3.
 *
 * Renders the primary-route link list inside the shell's <nav> landmark.
 * Link visibility is driven by the signed-in user's role (from useSession),
 * and the active link is derived from usePathname. The shell (Story 1.2)
 * owns the <nav> element, branding, responsive plumbing, and the mobile
 * dropdown — this component fills the empty `<ul aria-label="Primary">`.
 *
 * BA decisions:
 *   BA-1 Option C — nearest-parent active matching (deep routes highlight
 *                   their parent link; unknown routes fall back to Dashboard).
 *   BA-2 Option B — the `variant="menu"` rendering applies a menu-list
 *                   active-state treatment (leading indicator + left border)
 *                   distinct from the inline desktop variant.
 *   BA-3 Option A — the admin-only user-management link is labelled "Users".
 *
 * FRS-over-template: uses the existing `useSession` + `usePathname` helpers
 * and the 2-role model from `@/types/roles`. No second role-check mechanism.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { UserRole } from '@/types/roles';

type NavVariant = 'inline' | 'menu';

export interface NavLinkDef {
  href: string;
  label: string;
  roles: UserRole[];
}

/**
 * Link catalog. Order here is the visual order. Admin-only links list
 * `[UserRole.ADMIN]`; links visible to every signed-in user list both roles.
 * See FRS §Navigation (R4, R5, R6).
 */
export const NAV_LINKS: readonly NavLinkDef[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    roles: [UserRole.ADMIN, UserRole.VIEWER],
  },
  {
    href: '/payment-management',
    label: 'Payment Management',
    roles: [UserRole.ADMIN],
  },
  {
    href: '/payments-made',
    label: 'Payments Made',
    roles: [UserRole.ADMIN, UserRole.VIEWER],
  },
  {
    // BA-3 Option A — label reads "Users", matching FRS R5/R39 phrasing.
    href: '/users',
    label: 'Users',
    roles: [UserRole.ADMIN],
  },
] as const;

/**
 * Resolve which single link (if any) should be marked as the current page.
 *
 * BA-1 Option C — nearest-parent matching:
 *   - A link whose href is `/foo` matches the current pathname when the
 *     pathname is exactly `/foo` OR starts with `/foo/`.
 *   - Among matching links, pick the one with the longest href (deepest
 *     prefix). That handles the future case where two nav targets share
 *     a prefix (not present today — kept for robustness).
 *   - When nothing matches, fall back to Dashboard.
 *
 * Returns the index into `visibleLinks` of the active link, or `-1` if none
 * are visible (unauthenticated session — caller renders nothing).
 */
export function resolveActiveIndex(
  visibleLinks: readonly NavLinkDef[],
  pathname: string,
): number {
  if (visibleLinks.length === 0) return -1;

  let bestIndex = -1;
  let bestHrefLength = -1;

  for (let i = 0; i < visibleLinks.length; i++) {
    const { href } = visibleLinks[i]!;
    const matches =
      pathname === href ||
      pathname.startsWith(href.endsWith('/') ? href : `${href}/`);
    if (matches && href.length > bestHrefLength) {
      bestIndex = i;
      bestHrefLength = href.length;
    }
  }

  if (bestIndex !== -1) return bestIndex;

  // Fallback: Dashboard if it's visible to this user, otherwise the first
  // visible link (viewers without /dashboard would be a mis-configuration).
  const dashboardIdx = visibleLinks.findIndex((l) => l.href === '/dashboard');
  return dashboardIdx !== -1 ? dashboardIdx : 0;
}

export interface TopNavProps {
  /**
   * Visual variant.
   *
   *   - `"inline"` (default) — the desktop horizontal list. Active link uses
   *     a foreground color + underline treatment.
   *   - `"menu"` — the mobile dropdown (BA-2 Option B). Active link uses a
   *     left-border accent and a filled background, which reads naturally in
   *     a vertical list.
   */
  variant?: NavVariant;
}

export function TopNav({
  variant = 'inline',
}: TopNavProps): React.ReactElement | null {
  const { data: session } = useSession();
  const pathname = usePathname() ?? '/';

  // Unauthenticated render — shell already gates on auth, but render nothing
  // defensively so this component is safe in any context.
  if (!session?.user) return null;

  const role = session.user.role as UserRole;
  const visibleLinks = NAV_LINKS.filter((link) => link.roles.includes(role));
  const activeIndex = resolveActiveIndex(visibleLinks, pathname);

  const isMenu = variant === 'menu';

  const listClass = isMenu
    ? 'flex w-full flex-col gap-1'
    : 'flex items-center gap-4';

  return (
    <ul aria-label="Primary" className={listClass} data-nav-variant={variant}>
      {visibleLinks.map((link, idx) => {
        const isActive = idx === activeIndex;

        // BA-2 Option B: menu-list variant uses a distinctive left-border
        // stripe + filled background as the active treatment. The inline
        // (desktop) variant uses a foreground color + underline.
        const baseClass =
          'rounded-sm px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

        let className: string;
        if (isMenu) {
          className = isActive
            ? `${baseClass} nav-link-menu-active border-l-4 border-primary bg-accent text-accent-foreground`
            : `${baseClass} nav-link-menu border-l-4 border-transparent text-foreground hover:bg-accent/50`;
        } else {
          className = isActive
            ? `${baseClass} nav-link-inline-active text-primary underline underline-offset-4 decoration-2`
            : `${baseClass} nav-link-inline text-foreground hover:text-primary`;
        }

        return (
          <li key={link.href} className={isMenu ? 'w-full' : undefined}>
            <Link
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={className}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default TopNav;
