/**
 * Epic 1, Story 1.1 — NextAuth session shape
 *
 * Verifies the session contract required by the story:
 *   - AC-6: session exposes an audit identity for "LastChangedUser"
 *           (BA-1 Option A: identity is always the user's email)
 *   - Only "admin" and "viewer" roles exist on the session
 *   - jwt/session callbacks round-trip the role correctly
 *   - session.maxAge is generous (no auto-timeout for POC — NFR7)
 */

import { describe, it, expect } from 'vitest';

import { authConfig } from '@/lib/auth/auth.config';

describe('NextAuth session shape (Story 1.1)', () => {
  it('session maxAge disables auto-timeout for the POC (NFR7)', () => {
    const sessionConfig = authConfig.session as
      | { strategy?: string; maxAge?: number }
      | undefined;
    expect(sessionConfig).toBeDefined();
    // At least 30 days = 30 * 24 * 60 * 60 = 2_592_000 seconds
    expect(sessionConfig?.maxAge ?? 0).toBeGreaterThanOrEqual(
      30 * 24 * 60 * 60,
    );
  });

  it('session signIn page is /auth/signin', () => {
    const pages = authConfig.pages as { signIn?: string } | undefined;
    expect(pages?.signIn).toBe('/auth/signin');
  });

  it('jwt callback stores role and email from user on the token', async () => {
    const jwtCb = authConfig.callbacks?.jwt as
      | ((args: {
          token: Record<string, unknown>;
          user?: { id: string; email: string; role: string };
          account?: unknown;
          trigger?: string;
        }) => Promise<Record<string, unknown>>)
      | undefined;
    if (!jwtCb) throw new Error('jwt callback missing');

    const token = await jwtCb({
      token: {},
      user: {
        id: '1',
        email: 'alice.admin@betterbond.example',
        role: 'admin',
      },
      account: null,
      trigger: 'signIn',
    });

    expect(token.role).toBe('admin');
    // BA-1 Option A: identity on the session is always the email address
    expect(token.email).toBe('alice.admin@betterbond.example');
  });

  it('session callback exposes role="viewer" and email as the identity', async () => {
    const sessionCb = authConfig.callbacks?.session as
      | ((args: {
          session: { user: Record<string, unknown>; expires: string };
          token: Record<string, unknown>;
          user?: unknown;
          newSession?: unknown;
          trigger?: string;
        }) => Promise<{ user: { role: string; email: string } }>)
      | undefined;
    if (!sessionCb) throw new Error('session callback missing');

    const session = await sessionCb({
      session: {
        user: { email: 'vera.viewer@agency.example' },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      token: {
        sub: '2',
        role: 'viewer',
        email: 'vera.viewer@agency.example',
      },
      user: undefined,
      newSession: undefined,
      trigger: 'update',
    });

    expect(session.user.role).toBe('viewer');
    // BA-1 Option A: session identity is the email address
    expect(session.user.email).toBe('vera.viewer@agency.example');
  });

  // The following tests exercise the credentials provider's authorize() callback
  // directly so the seeded demo users and their bcrypt hashes are actually verified
  // end-to-end. Without these, a wrong seeded hash would pass session-shape tests
  // but fail live sign-in — exactly the regression this block guards against.
  // The user-supplied authorize() in next-auth/providers/credentials lives on
  // provider.options.authorize at runtime. (provider.authorize is an internal
  // `() => null` placeholder — calling it directly would always reject.) The
  // helper below resolves the real callback so these tests exercise the same
  // code path the live NextAuth runtime runs during /api/auth/callback/credentials.
  type AuthorizeFn = (
    credentials: Record<string, unknown>,
  ) => Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null>;

  const getRealAuthorize = (): AuthorizeFn => {
    const providers = authConfig.providers as unknown as Array<
      Record<string, unknown>
    >;
    const provider = providers[0];
    const options = provider?.options as Record<string, unknown> | undefined;
    const authorize = options?.authorize as AuthorizeFn | undefined;
    if (!authorize) {
      throw new Error('credentials provider options.authorize not found');
    }
    return authorize;
  };

  it('authorize() accepts the seeded admin credentials (Admin123!)', async () => {
    const authorize = getRealAuthorize();
    const user = await authorize({
      email: 'alice.admin@betterbond.example',
      password: 'Admin123!', // scan-secrets-ignore — POC seed password, documented in QA checklist
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe('alice.admin@betterbond.example');
    expect(user?.role).toBe('admin');
  });

  it('authorize() accepts the seeded viewer credentials (Viewer123!)', async () => {
    const authorize = getRealAuthorize();
    const user = await authorize({
      email: 'vera.viewer@agency.example',
      password: 'Viewer123!', // scan-secrets-ignore — POC seed password, documented in QA checklist
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe('vera.viewer@agency.example');
    expect(user?.role).toBe('viewer');
  });

  it('authorize() rejects a valid email with a wrong password', async () => {
    const authorize = getRealAuthorize();
    const user = await authorize({
      email: 'alice.admin@betterbond.example',
      password: 'wrong-password', // scan-secrets-ignore — deliberately invalid test input
    });

    expect(user).toBeNull();
  });

  it('authorize() rejects an unknown email', async () => {
    const authorize = getRealAuthorize();
    const user = await authorize({
      email: 'stranger@example.com',
      password: 'whatever', // scan-secrets-ignore — deliberately invalid test input
    });

    expect(user).toBeNull();
  });

  it('session callback rejects template 4-role values — only admin/viewer are valid', async () => {
    const sessionCb = authConfig.callbacks?.session as
      | ((args: {
          session: { user: Record<string, unknown>; expires: string };
          token: Record<string, unknown>;
          user?: unknown;
          newSession?: unknown;
          trigger?: string;
        }) => Promise<{ user: { role: string } }>)
      | undefined;
    if (!sessionCb) throw new Error('session callback missing');

    const session = await sessionCb({
      session: {
        user: { email: 'someone@example.com' },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      token: {
        sub: '99',
        role: 'power_user',
        email: 'someone@example.com',
      },
      user: undefined,
      newSession: undefined,
      trigger: 'update',
    });

    const role = session.user.role;
    // The session callback must either normalise the role to 'admin'/'viewer' or
    // reject the login entirely — in no case should "power_user" reach a consumer.
    expect(['admin', 'viewer']).toContain(role);
  });
});
