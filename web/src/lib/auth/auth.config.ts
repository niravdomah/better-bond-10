import bcrypt from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';

import { isValidRole, UserRole } from '@/types/roles';

import type { NextAuthConfig } from 'next-auth';

/**
 * BetterBond NextAuth configuration.
 *
 * Per Epic 1 / Story 1.1:
 *   - No public self-signup (R41) — users are admin-provisioned.
 *   - No auto-timeout for POC (NFR7) — session lives 30 days.
 *   - Only two roles exist: 'admin' and 'viewer'.
 *   - Session identity (used as LastChangedUser audit value) = user's email (BA-1 Option A).
 *   - Sign-in page lives at /auth/signin (R1) and success redirects to /dashboard (R2).
 */

if (!process.env.NEXTAUTH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SECURITY ERROR: NEXTAUTH_SECRET is not set. Generate one with `openssl rand -base64 32`.',
    );
  }
}

/**
 * Admin-provisioned user seed for the POC.
 *
 * Two accounts so reviewers can exercise both roles end-to-end:
 *   - alice.admin@betterbond.example / Admin123!   — admin
 *   - vera.viewer@agency.example     / Viewer123!  — viewer
 *
 * Pre-hashed with bcrypt (10 rounds). Replace with a real user store before
 * production use.
 */
const provisionedUsers = [
  {
    id: '1',
    email: 'alice.admin@betterbond.example',
    name: 'Alice Admin',
    // Admin123!
    password: '$2b$10$BnJ5dN5E.qpVtgOuJYu0GOl8IuRnF5IIwhH1zjAuWEGUmiyEUxbpy',
    role: UserRole.ADMIN,
  },
  {
    id: '2',
    email: 'vera.viewer@agency.example',
    name: 'Vera Viewer',
    // Viewer123!
    password: '$2b$10$/v9rboMF3h3R6UL/.nNJbOZBTxsyQwKU5TgBGKU4rG8X0pdGVAn7W',
    role: UserRole.VIEWER,
  },
];

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
      } | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = provisionedUsers.find(
          (u) => u.email === credentials.email,
        );
        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signin',
    error: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const role = (user as { role?: string }).role;
        token.role = isValidRole(role ?? '')
          ? (role as UserRole)
          : UserRole.VIEWER;
        token.email = (user as { email?: string }).email ?? token.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub as string | undefined) ?? '';
        const tokenRole = (token.role as string | undefined) ?? '';
        session.user.role = isValidRole(tokenRole)
          ? (tokenRole as UserRole)
          : UserRole.VIEWER;
        // BA-1 Option A — identity is always the email address
        const tokenEmail = (token.email as string | undefined) ?? '';
        if (tokenEmail) {
          session.user.email = tokenEmail;
        }
      }
      return session;
    },
  },

  // NFR7 — no auto-timeout for the POC. 30-day session.
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
