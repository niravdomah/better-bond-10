/**
 * BetterBond authorization helpers — 2-role model (admin / viewer).
 *
 * No role hierarchy and no "minimum role" semantics: a route either allows a
 * role or it doesn't. Server code should use requireRole/requireAnyRole or the
 * withRoleProtection API wrapper; UI code uses the RoleGate component.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

import { UserRole } from '@/types/roles';

import { auth } from './auth';

/** Exact role match. Returns false for null/undefined users. */
export function hasRole(
  user: { role: UserRole } | null | undefined,
  role: UserRole,
): boolean {
  if (!user) return false;
  return user.role === role;
}

/** Returns true when the user's role is any of the provided roles. */
export function hasAnyRole(
  user: { role: UserRole } | null | undefined,
  roles: UserRole[],
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/** Throws if not signed in; returns the session otherwise. */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized - authentication required');
  }
  return session;
}

/** Throws unless the current user has the exact required role. */
export async function requireRole(role: UserRole): Promise<Session> {
  const session = await requireAuth();
  if (!hasRole(session.user, role)) {
    throw new Error('Forbidden - insufficient permissions');
  }
  return session;
}

/** Throws unless the current user has one of the listed roles. */
export async function requireAnyRole(roles: UserRole[]): Promise<Session> {
  const session = await requireAuth();
  if (!hasAnyRole(session.user, roles)) {
    throw new Error('Forbidden - insufficient permissions');
  }
  return session;
}

/**
 * Wrap an API route handler with authentication + exact-role/any-roles checks.
 *
 * Returns 401 if unauthenticated, 403 if the role check fails, 500 on handler error.
 */
export function withRoleProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { role?: UserRole; roles?: UserRole[] },
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized - authentication required' },
          { status: 401 },
        );
      }

      if (options.role && !hasRole(session.user, options.role)) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 },
        );
      }

      if (options.roles && !hasAnyRole(session.user, options.roles)) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 },
        );
      }

      return await handler(request);
    } catch (error) {
      console.error('Authorization error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}
