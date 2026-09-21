import { AppShell } from "@/app/components/app-shell";
import { createGroup, createGymnast } from "@/app/actions/core-coaching";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) return <AppShell organisationName={context.organisation.name} displayName={context.user.displayName} access={context.access}><p>Coaching workspace access is not assigned to this account.</p></AppShell>;
  const [groups, gymnasts] = await Promise.all([
    prisma.trainingGroup.findMany({ where: { organisationId: context.organisation.id }, include: { memberships: { include: { gymnast: true }, orderBy: { joinedAt: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.gymnast.findMany({ where: { organisationId: context.organisation.id }, include: { groups: { include: { trainingGroup: true } } }, orderBy: { name: "asc" } }),
  ]);
  const assigned = new Set(groups.flatMap((group) => group.memberships.map((membership) => membership.gymnastId)));
  const canManage = context.access.canManagePeopleAndRoles;

  return <AppShell organisationName={context.organisation.name} displayName={context.user.displayName} access={context.access}>
    <section>
      <p className="text-sm font-semibold text-[var(--muted)]">My Groups</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">Your coaching groups</h1><p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Groups organise the roster without owning gymnast identity. A gymnast can belong to more than one group.</p></div><p className="text-sm text-[var(--muted)]">{groups.length} groups · {gymnasts.length} gymnasts</p></div>
      {canManage && <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <form action={createGroup} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Create group</h2><div className="mt-4 flex gap-2"><input name="name" required placeholder="Group name" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] px-4 py-3"/><button className="rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Create</button></div></form>
        <form action={createGymnast} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Add gymnast</h2><div className="mt-4 grid gap-2 sm:grid-cols-3"><input name="name" required placeholder="Name" className="rounded-xl border border-[var(--border)] px-3 py-3"/><input name="dateOfBirth" type="date" className="rounded-xl border border-[var(--border)] px-3 py-3"/><select name="groupId" className="rounded-xl border border-[var(--border)] px-3 py-3"><option value="">Unassigned</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></div><button className="mt-3 rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Add gymnast</button></form>
      </div>}
      <div className="mt-8 grid gap-4">{groups.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"><h2 className="text-lg font-semibold">No groups yet</h2><p className="mt-2 text-sm text-[var(--muted)]">Create the first real coaching group when you are ready. Viaform does not add demo groups for you.</p></div> : groups.map((group) => <article key={group.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{group.name}</h2><span className="text-sm text-[var(--muted)]">{group.memberships.length} gymnasts</span></div>{group.memberships.length ? <div className="mt-4 flex flex-wrap gap-2">{group.memberships.map(({ gymnast, isPrimary }) => <span key={gymnast.id} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm">{gymnast.name}{isPrimary ? " · primary" : ""}</span>)}</div> : <p className="mt-3 text-sm text-[var(--muted)]">No gymnasts assigned.</p>}</article>)}</div>
      {gymnasts.some((g) => !assigned.has(g.id)) && <section className="mt-8"><h2 className="text-lg font-semibold">Unassigned gymnasts</h2><div className="mt-3 flex flex-wrap gap-2">{gymnasts.filter((g) => !assigned.has(g.id)).map((g) => <span key={g.id} className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-sm">{g.name}</span>)}</div></section>}
    </section>
  </AppShell>;
}
