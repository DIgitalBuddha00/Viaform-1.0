import type { AccessProfile } from "./access-control";
export type NavigationItem = { label: string; href: string; enabled: boolean };
export function primaryNavigation(access: AccessProfile): NavigationItem[] {
  if (!access.canUseCoachingWorkspace) {
    return [
      { label: "Home", href: "/dashboard", enabled: true },
      ...(access.canManageProgrammesAndMethodology
        ? [{ label: "More", href: "/programmes", enabled: true }]
        : []),
    ];
  }
  return [
    { label: "Home", href: "/dashboard", enabled: true },
    { label: "Calendar", href: "/calendar", enabled: true },
    { label: "My Groups", href: "/groups", enabled: true },
    { label: "Planning", href: "/planning", enabled: true },
    { label: "Training", href: "/training", enabled: true },
    { label: "Testing", href: "/testing", enabled: true },
    { label: "Routines", href: "/routines", enabled: true },
    { label: "Competitions", href: "/competitions", enabled: true },
    { label: "More", href: "/programmes", enabled: true },
  ];
}
export function coachingRoleLabel(role: string) {
  const labels: Record<string, string> = { HEAD_COACH:"Head Coach",COMPETITIVE_COACH:"Competitive Coach",RECREATIONAL_COACH:"Recreational Coach",PROGRAMME_LEAD:"Programme Lead",SPECIALIST_COACH:"Specialist Coach",CHOREOGRAPHER:"Choreographer",JUDGE:"Judge" };
  return labels[role] ?? role;
}
