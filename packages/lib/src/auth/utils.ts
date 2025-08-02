import type {
  OrganizationRole,
  UserWithMemberships,
} from '@superscale/crud/types';

export function getRole(user: UserWithMemberships, organizationId: string) {
  const membership = user.memberships.find(
    (membership) => membership.organization.id === organizationId
  );
  return membership?.role;
}

/**
 * Returns true if a can remove b from the organization.
 * @param a - the user who is trying to remove b
 * @param b - the user who is being removed
 * @param orgId - the organization id
 */
export function canRemove(a: OrganizationRole, b: OrganizationRole) {
  // Members cannot remove anyone
  if (a === 'member') return false;

  // Owners and admins can remove others owners and admins
  if (a === b) return true;

  // Admin cannot remove Owner
  if (a === 'admin') {
    return b !== 'owner';
  }

  return true;
}
