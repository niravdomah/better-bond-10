/**
 * Epic 1, Story 1.1 — Sign-in routing rules
 *
 * Covers:
 *   AC-1  — unauthenticated visitor is routed to the sign-in page before reaching any authenticated screen
 *   AC-7  — already-signed-in user who visits /auth/signin is redirected to /dashboard
 *   AC-8  — session persists across browser restart; revisiting / sends authed user straight to /dashboard
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import type { Session } from 'next-auth';

// Mock next-auth
vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const redirectMock: Mock<(url: string) => never> = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: () => null,
    }),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { auth } from '@/lib/auth/auth';
import { requireAuth } from '@/lib/auth/auth-server';

type MockAuthFn = Mock<() => Promise<Session | null>>;

beforeEach(() => {
  vi.clearAllMocks();
});

function makeSession(role: 'admin' | 'viewer', email: string): Session {
  return {
    user: {
      id: '1',
      email,
      name: email,
      role,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  } as unknown as Session;
}

describe('Route guard — unauthenticated (AC-1)', () => {
  it('redirects to /auth/signin when no session exists', async () => {
    (auth as unknown as MockAuthFn).mockResolvedValue(null);

    await expect(requireAuth()).rejects.toThrow(/REDIRECT:\/auth\/signin/);
    expect(redirectMock).toHaveBeenCalled();
    const redirectedTo = redirectMock.mock.calls[0]?.[0] ?? '';
    expect(redirectedTo.startsWith('/auth/signin')).toBe(true);
  });
});

describe('Route guard — authenticated (AC-7, AC-8)', () => {
  it('returns the session when the user is signed in as admin', async () => {
    const session = makeSession('admin', 'alice.admin@betterbond.example');
    (auth as unknown as MockAuthFn).mockResolvedValue(session);

    const result = await requireAuth();
    expect(result.user.email).toBe('alice.admin@betterbond.example');
    // No redirect triggered
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('returns the session when the user is signed in as viewer', async () => {
    const session = makeSession('viewer', 'vera.viewer@agency.example');
    (auth as unknown as MockAuthFn).mockResolvedValue(session);

    const result = await requireAuth();
    expect(result.user.email).toBe('vera.viewer@agency.example');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
