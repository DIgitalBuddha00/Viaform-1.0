import type { AccessProfile } from "./access-control";

export type NavigationItem = { label: string; href: string; enabled: boolean };

export function primaryNavigation(access: AccessProfile): NavigationItem[] {
  if (!access.canUseCoachingWorkspace) return [{ label: "Home", href: "/dashboard", enabled: true }];
  return [
    { label: "Home", href: "/dashboard", enabled: true },
    { label: "Calendar", href: "/calendar", enabled: false },
    { label: "My Groups", href: "/groups", enabled: false },
    { label: "Planning", href: "/planning", enabled: false },
    { label: "Training", href: "/training", enabled: false },
    { label: "Testing", href: "/testing", enabled: false },
    { label: "Routines", href: "/routines", enabled: false },
    { label: "Competitions", href: "/competitions", enabled: false },
    { label: "More", href: "/more", enabled: false },
  ];
}

export function coachingRoleLabel(role: string) {
  const labels: Record<string, string> = {
    HEAD_COACH: "Head Coach", COMPETITIVE_COACH: "Competitive Coach",
    RECREATIONAL_COACH: "Recreational Coach", PROGRAMME_LEAD: "Programme Lead",
    SPECIALIST_COACH: "Specialist Coach", CHOREOGRAPHER: "Choreographer", JUDGE: "Judge",
  };
  return labels[role] ?? role;
}
