/**
 * Integration Test: RBAC (Role-Based Access Control)
 *
 * Updated for Epic 1, Story 1.1 — only two roles exist: admin and viewer.
 * Tests the complete authorization flow through withRoleProtection using the
 * 2-role BetterBond model.
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { UserRole } from '@/types/roles';
import { auth } from '@/lib/auth/auth';
import { withRoleProtection } from '@/lib/auth/auth-helpers';

type MockAuthFn = Mock<
  () => Promise<{ user: { id: string; email: string; role: UserRole } } | null>
>;

function createSession(role: UserRole) {
  return {
    user: {
      id: 'user-123',
      email:
        role === UserRole.ADMIN
          ? 'admin@betterbond.example'
          : 'viewer@agency.example',
      role,
    },
  };
}

function createMockRequest(
  url = 'http://localhost:3000/api/test',
): NextRequest {
  return new NextRequest(url);
}

describe('RBAC Integration Tests — 2-role model (admin/viewer)', () => {
  const mockAuth = auth as unknown as MockAuthFn;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withRoleProtection API wrapper', () => {
    const successHandler = async () => NextResponse.json({ success: true });

    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const protectedHandler = withRoleProtection(successHandler, {
        role: UserRole.ADMIN,
      });

      const response = await protectedHandler(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Unauthorized');
    });

    it('returns 403 when a viewer tries to reach an admin-only endpoint', async () => {
      mockAuth.mockResolvedValue(createSession(UserRole.VIEWER));

      const protectedHandler = withRoleProtection(successHandler, {
        role: UserRole.ADMIN,
      });

      const response = await protectedHandler(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Forbidden');
    });

    it('allows an admin to reach an admin-only endpoint', async () => {
      mockAuth.mockResolvedValue(createSession(UserRole.ADMIN));

      const protectedHandler = withRoleProtection(successHandler, {
        role: UserRole.ADMIN,
      });

      const response = await protectedHandler(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('allows a viewer to reach a viewer-or-admin endpoint', async () => {
      mockAuth.mockResolvedValue(createSession(UserRole.VIEWER));

      const protectedHandler = withRoleProtection(successHandler, {
        roles: [UserRole.ADMIN, UserRole.VIEWER],
      });

      const response = await protectedHandler(createMockRequest());
      expect(response.status).toBe(200);
    });
  });
});
