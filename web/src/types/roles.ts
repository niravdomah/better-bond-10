/**
 * BetterBond User Role Definitions
 *
 * Per FRS (generated-docs/specs/feature-requirements.md) and Epic 1 / Story 1.1,
 * only two roles exist in the BetterBond Commission Payments POC:
 *
 *   - admin   — BetterBond payments administrators (full access to payment management)
 *   - viewer  — real estate agency staff (read-only access to dashboard and payment history)
 *
 * No 4-role template enum, no hierarchy levels, no "minimum role" semantics.
 * Authorization is a simple exact-role check.
 */

export enum UserRole {
  /** BetterBond payments administrator — full access */
  ADMIN = 'admin',

  /** Real estate agency staff — read-only access */
  VIEWER = 'viewer',
}

/**
 * Human-readable role descriptions for UI display
 */
export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'BetterBond payments administrator',
  [UserRole.VIEWER]: 'Agency staff (read-only)',
};

/**
 * Default role for newly provisioned users.
 * In the POC all sign-ups come from admin provisioning, so this is only used
 * as a defensive fall-back — never as a public registration default.
 */
export const DEFAULT_ROLE = UserRole.VIEWER;

/**
 * Type guard — returns true when the string is one of BetterBond's two roles.
 */
export function isValidRole(role: string): role is UserRole {
  return role === UserRole.ADMIN || role === UserRole.VIEWER;
}

/**
 * Get all available roles as an array
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}
