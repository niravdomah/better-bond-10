/**
 * BetterBond Next.js proxy — 2-role RBAC.
 *
 * Intercepts requests and enforces authentication + authorization rules based
 * on the configured route protection table below. Only two roles exist:
 * admin and viewer.
 */

import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/auth';
import { hasAnyRole, hasRole } from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types/roles';

import type { NextRequest } from 'next/server';

export type RouteProtectionConfig = {
  /** Require exact role match */
  role?: UserRole;
  /** Require one of these roles */
  roles?: UserRole[];
  /** Only require authentication (no specific role) */
  authenticated?: boolean;
};

export type ProxyConfig = {
  /** If the session has no role, deny (secure) or allow as viewer (permissive). */
  missingRoleBehavior?: 'deny' | 'viewer';
  signInUrl?: string;
  unauthorizedUrl?: string;
};

/**
 * Route protection for BetterBond.
 *
 * - /dashboard and /payments are read-only to both roles (viewer + admin).
 * - /payments/manage, /batches, /users and /api/admin/* are admin-only.
 */
export const routeProtection: Record<string, RouteProtectionConfig> = {
  '/dashboard': { roles: [UserRole.ADMIN, UserRole.VIEWER] },
  '/payments': { roles: [UserRole.ADMIN, UserRole.VIEWER] },
  '/payments/manage': { role: UserRole.ADMIN },
  '/batches': { role: UserRole.ADMIN },
  '/users': { role: UserRole.ADMIN },
  '/api/admin': { role: UserRole.ADMIN },
};

export const proxyConfig: ProxyConfig = {
  missingRoleBehavior: 'deny',
  signInUrl: '/auth/signin',
  unauthorizedUrl: '/auth/forbidden',
};

/** Public routes — accessible without authentication. */
export const publicRoutes: string[] = [
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/auth/forbidden',
  '/api/auth',
];

function findRouteConfig(pathname: string): RouteProtectionConfig | null {
  const sortedRoutes = Object.keys(routeProtection).sort(
    (a, b) => b.length - a.length,
  );
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return routeProtection[route];
    }
  }
  return null;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function checkAuthorization(
  user: { role: UserRole } | null | undefined,
  config: RouteProtectionConfig,
  missingRoleBehavior: 'deny' | 'viewer',
): boolean {
  if (config.authenticated && !config.role && !config.roles) {
    return true;
  }

  if (!user?.role) {
    if (missingRoleBehavior === 'deny') return false;
    user = { role: UserRole.VIEWER };
  }

  if (config.role) {
    return hasRole(user, config.role);
  }
  if (config.roles) {
    return hasAnyRole(user, config.roles);
  }
  return true;
}

export const proxy = auth(
  (req: NextRequest & { auth: { user?: { role: UserRole } } | null }) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;

    if (isPublicRoute(pathname)) {
      // AC-7 — if an authenticated user visits the sign-in page, redirect to /dashboard.
      if (pathname.startsWith('/auth/signin') && session?.user) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    const routeConfig = findRouteConfig(pathname);
    if (!routeConfig) {
      return NextResponse.next();
    }

    if (!session?.user) {
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { error: 'Unauthorized - authentication required' },
          { status: 401 },
        );
      }
      const signInUrl = new URL(
        proxyConfig.signInUrl || '/auth/signin',
        req.url,
      );
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const isAuthorized = checkAuthorization(
      session.user,
      routeConfig,
      proxyConfig.missingRoleBehavior || 'deny',
    );

    if (!isAuthorized) {
      if (isApiRoute(pathname)) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 },
        );
      }
      return NextResponse.redirect(
        new URL(proxyConfig.unauthorizedUrl || '/auth/forbidden', req.url),
      );
    }

    return NextResponse.next();
  },
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
