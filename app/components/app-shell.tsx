import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import type { AccessProfile } from "@/app/lib/access-control";
import { coachingRoleLabel, primaryNavigation } from "@/app/lib/navigation";

type Props = {
  children: ReactNode;
  organisationName: string;
  displayName: string;
  access: AccessProfile;
};

export function AppShell({ children, organisationName, displayName, access }: Props) {
  const navigation = primaryNavigation(access);
  const roles = [...(access.isAdministrator ? ["Administrator"] : []), ...access.coachingRoles.map(coachingRoleLabel)];
  return <div className="min-h-screen pb-24 md:pb-8">
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Viaform</p><p className="mt-1 text-lg font-semibold">{organisationName}</p></div>
        <div className="flex items-center gap-3 text-right"><div className="hidden sm:block"><p className="text-sm font-semibold">{displayName}</p><p className="text-xs text-[var(--muted)]">{roles.join(" · ")}</p></div><form action={signOut}><button className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold">Sign out</button></form></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl md:grid-cols-[190px_minmax(0,1fr)]">
      <nav className="hidden border-r border-[var(--border)] px-4 py-6 md:block" aria-label="Primary">
        <div className="grid gap-1">{navigation.map((item) => item.enabled ? <a key={item.label} href={item.href} className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-white">{item.label}</a> : <span key={item.label} className="rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] opacity-55">{item.label}</span>)}</div>
      </nav>
      <main className="min-w-0 px-5 py-7 md:px-8 md:py-9">{children}</main>
    </div>
    {access.canUseCoachingWorkspace && <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2 md:hidden" aria-label="Mobile primary">
      {["Home","My Groups","Planning","Training","More"].map((label) => { const item = navigation.find((entry) => entry.label === label)!; return item.enabled ? <a key={label} href={item.href} className="rounded-lg px-1 py-2 text-center text-xs font-semibold">{label}</a> : <span key={label} className="px-1 py-2 text-center text-xs text-[var(--muted)] opacity-50">{label}</span>; })}
    </nav>}
  </div>;
}
