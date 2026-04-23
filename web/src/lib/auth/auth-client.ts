'use client';

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';

export { useSession } from 'next-auth/react';

export type SignInResult = {
  ok: boolean;
  error?: string;
  networkError?: boolean;
};

/**
 * Sign in via NextAuth credentials provider.
 *
 * Returns:
 *   - { ok: true }                                  — success
 *   - { ok: false, error: string }                   — credentials rejected
 *   - { ok: false, error: string, networkError: true } — network / server unreachable
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  try {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: 'Invalid credentials', ok: false };
    }

    return { ok: true };
  } catch {
    return {
      error: 'Sign-in could not be completed',
      ok: false,
      networkError: true,
    };
  }
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirect: true, callbackUrl: '/auth/signin' });
}
