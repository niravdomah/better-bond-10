/**
 * Integration Test: RoleGate Component
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

import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/types/roles';
import { RoleGate } from '@/components/RoleGate';

function createMockSession(role: UserRole): Session {
  return {
    user: {
      id: '1',
      email:
        role === UserRole.ADMIN
          ? 'admin@betterbond.example'
          : 'viewer@agency.example',
      name: `${role} User`,
      role,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  } as unknown as Session;
}

describe('RoleGate (2-role model)', () => {
  const mockAuth = auth as unknown as MockAuthFn;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when user is admin and admin is allowed', async () => {
    mockAuth.mockResolvedValue(createMockSession(UserRole.ADMIN));

    const result = await RoleGate({
      allowedRoles: [UserRole.ADMIN],
      children: <div>Admin Panel</div>,
    });

    expect(result).toEqual(<div>Admin Panel</div>);
  });

  it('renders children when user is viewer and viewer is in allowedRoles', async () => {
    mockAuth.mockResolvedValue(createMockSession(UserRole.VIEWER));

    const result = await RoleGate({
      allowedRoles: [UserRole.ADMIN, UserRole.VIEWER],
      children: <div>Dashboard</div>,
    });

    expect(result).toEqual(<div>Dashboard</div>);
  });

  it('returns fallback when a viewer hits an admin-only gate', async () => {
    mockAuth.mockResolvedValue(createMockSession(UserRole.VIEWER));
    const fallback = <div>Access Denied</div>;

    const result = await RoleGate({
      allowedRoles: [UserRole.ADMIN],
      children: <div>Admin Panel</div>,
      fallback,
    });

    expect(result).toEqual(fallback);
  });

  it('returns null for unauthenticated user with no fallback', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await RoleGate({
      allowedRoles: [UserRole.ADMIN],
      children: <div>Admin Panel</div>,
    });

    expect(result).toBeNull();
  });
});
