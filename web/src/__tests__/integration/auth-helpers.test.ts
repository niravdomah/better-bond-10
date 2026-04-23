/**
 * Integration Test: Auth Helpers & Role-Based Access Control
 *
 * Updated for Epic 1, Story 1.1 — only two roles (admin / viewer).
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Session } from 'next-auth';

type MockAuthFn = ReturnType<typeof vi.fn<() => Promise<Session | null>>>;

vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import {
  hasRole,
  hasAnyRole,
  withRoleProtection,
} from '@/lib/auth/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UserRole, isValidRole } from '@/types/roles';

describe('Role utilities (2-role model)', () => {
  it('validates the two supported role strings', () => {
    expect(isValidRole('admin')).toBe(true);
    expect(isValidRole('viewer')).toBe(true);
    expect(isValidRole('invalid')).toBe(false);
    // Retired template roles must be rejected
    expect(isValidRole('power_user')).toBe(false);
    expect(isValidRole('standard_user')).toBe(false);
    expect(isValidRole('read_only')).toBe(false);
  });
});

describe('Auth helper functions (2-role model)', () => {
  it('hasRole — exact role match only', () => {
    const adminUser = { role: UserRole.ADMIN };
    const viewerUser = { role: UserRole.VIEWER };

    expect(hasRole(adminUser, UserRole.ADMIN)).toBe(true);
    expect(hasRole(adminUser, UserRole.VIEWER)).toBe(false);
    expect(hasRole(viewerUser, UserRole.VIEWER)).toBe(true);
    expect(hasRole(viewerUser, UserRole.ADMIN)).toBe(false);
  });

  it('hasAnyRole — matches when user role is in the list', () => {
    const viewerUser = { role: UserRole.VIEWER };
    expect(hasAnyRole(viewerUser, [UserRole.ADMIN, UserRole.VIEWER])).toBe(
      true,
    );
    expect(hasAnyRole(viewerUser, [UserRole.ADMIN])).toBe(false);
  });

  it('returns false for null/undefined users', () => {
    expect(hasRole(null, UserRole.ADMIN)).toBe(false);
    expect(hasAnyRole(undefined, [UserRole.ADMIN])).toBe(false);
  });
});

describe('withRoleProtection — API Route Wrapper (2-role model)', () => {
  const mockAuth = auth as unknown as MockAuthFn;
  const mockRequest = new NextRequest('http://localhost/api/test');

  const createMockHandler = () =>
    vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const handler = createMockHandler();
    const protectedHandler = withRoleProtection(handler, {
      role: UserRole.ADMIN,
    });

    const response = await protectedHandler(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized - authentication required');
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 403 when a viewer tries to reach an admin-only route', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: '1',
        email: 'viewer@agency.example',
        role: UserRole.VIEWER,
      },
      expires: new Date().toISOString(),
    } as unknown as Session);

    const handler = createMockHandler();
    const protectedHandler = withRoleProtection(handler, {
      role: UserRole.ADMIN,
    });

    const response = await protectedHandler(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden - insufficient permissions');
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler when admin accesses an admin-only route', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@betterbond.example',
        role: UserRole.ADMIN,
      },
      expires: new Date().toISOString(),
    } as unknown as Session);

    const handler = createMockHandler();
    const protectedHandler = withRoleProtection(handler, {
      role: UserRole.ADMIN,
    });

    const response = await protectedHandler(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(handler).toHaveBeenCalledWith(mockRequest);
  });

  it('returns 500 when the handler throws', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@betterbond.example',
        role: UserRole.ADMIN,
      },
      expires: new Date().toISOString(),
    } as unknown as Session);

    const handler = vi.fn().mockRejectedValue(new Error('Database error'));
    const protectedHandler = withRoleProtection(handler, {
      role: UserRole.ADMIN,
    });

    const response = await protectedHandler(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal server error');
  });
});
