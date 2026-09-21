export const COACHING_ROLES = [
  "HEAD_COACH",
  "COMPETITIVE_COACH",
  "RECREATIONAL_COACH",
  "PROGRAMME_LEAD",
  "SPECIALIST_COACH",
  "CHOREOGRAPHER",
  "JUDGE",
] as const;

export type CoachingRole = (typeof COACHING_ROLES)[number];

export const DELEGATED_CAPABILITIES = [
  "MANAGE_PEOPLE_AND_ROLES",
  "MANAGE_ROTATIONS",
  "CONFIGURE_FACILITIES",
  "MANAGE_PROGRAMMES_AND_METHODOLOGY",
] as const;

export type DelegatedCapability = (typeof DELEGATED_CAPABILITIES)[number];

type MembershipAccessSource = {
  isAdministrator: boolean;
  coachingRoles: string | null;
  delegatedCapabilities: string | null;
};

function parseList<T extends string>(value: string | null | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return Array.from(
      new Set(parsed.filter((item): item is T => typeof item === "string" && allowed.includes(item as T))),
    );
  } catch {
    return [];
  }
}

export type AccessProfile = {
  coachingRoles: CoachingRole[];
  delegatedCapabilities: DelegatedCapability[];
  isAdministrator: boolean;
  isHeadCoach: boolean;
  canUseCoachingWorkspace: boolean;
  canViewAllCoachingData: boolean;
  canManagePeopleAndRoles: boolean;
  canManageAdministratorRole: boolean;
  canManageClubSettings: boolean;
  canManageRotations: boolean;
  canConfigureFacilities: boolean;
  canManageProgrammesAndMethodology: boolean;
};

export function resolveAccessProfile(membership: MembershipAccessSource): AccessProfile {
  const coachingRoles = parseList(membership.coachingRoles, COACHING_ROLES);
  const delegatedCapabilities = parseList(
    membership.delegatedCapabilities,
    DELEGATED_CAPABILITIES,
  );
  const isAdministrator = membership.isAdministrator;
  const isHeadCoach = coachingRoles.includes("HEAD_COACH");

  return {
    coachingRoles,
    delegatedCapabilities,
    isAdministrator,
    isHeadCoach,
    canUseCoachingWorkspace: coachingRoles.length > 0,
    canViewAllCoachingData: isHeadCoach,
    canManagePeopleAndRoles:
      isAdministrator || delegatedCapabilities.includes("MANAGE_PEOPLE_AND_ROLES"),
    canManageAdministratorRole: isAdministrator,
    canManageClubSettings: isAdministrator,
    canManageRotations:
      isAdministrator || delegatedCapabilities.includes("MANAGE_ROTATIONS"),
    canConfigureFacilities:
      isAdministrator || delegatedCapabilities.includes("CONFIGURE_FACILITIES"),
    canManageProgrammesAndMethodology:
      isAdministrator ||
      delegatedCapabilities.includes("MANAGE_PROGRAMMES_AND_METHODOLOGY"),
  };
}
