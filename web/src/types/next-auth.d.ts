/**
 * NextAuth type extensions for BetterBond.
 *
 * The authenticated session always exposes:
 *   - user.id     : stable identifier
 *   - user.email  : the audit identity used as LastChangedUser (BA-1 Option A)
 *   - user.role   : 'admin' | 'viewer' (BetterBond 2-role model)
 *   - user.name   : optional display name
 */

import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

import { UserRole } from './roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserRole;
    email: string;
  }
}
