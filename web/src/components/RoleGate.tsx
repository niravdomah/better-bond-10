/**
 * RoleGate — server-side conditional rendering for BetterBond's 2-role model.
 *
 * Renders children when the current user's role is in allowedRoles. When the
 * user is unauthenticated or lacks the role, renders the fallback (or null).
 */

import { auth } from '@/lib/auth/auth';
import { hasAnyRole } from '@/lib/auth/auth-helpers';
import { UserRole } from '@/types/roles';

export type RoleGateProps = {
  children: React.ReactNode;
  /** The user must have at least one of these roles to see the children. */
  allowedRoles?: UserRole[];
  /** If true, any signed-in user can see the children regardless of role. */
  requireAuth?: boolean;
  /** Content to render when the user is not authorized. */
  fallback?: React.ReactNode;
};

export async function RoleGate({
  children,
  allowedRoles,
  requireAuth = false,
  fallback = null,
}: RoleGateProps): Promise<React.ReactNode> {
  const session = await auth();

  if (!session?.user) {
    return fallback;
  }

  if (requireAuth && !allowedRoles) {
    return children;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (hasAnyRole(session.user, allowedRoles)) {
      return children;
    }
    return fallback;
  }

  return children;
}

export default RoleGate;
