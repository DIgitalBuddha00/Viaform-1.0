import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

export default async function RoutinesPage() {
  const c = await requireAuthContext();
  const gymnasts = c.access.canUseCoachingWorkspace
    ? await prisma.gymnast.findMany({
        where: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
        include: { routines: { where: { status: "ACTIVE" }, select: { id: true, apparatus: true, purpose: true } } },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <p className="text-sm font-semibold text-[var(--muted)]">Routines & technical coaching</p>
        <h1 className="mt-2 text-3xl font-semibold">Routines</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Routine work is gymnast-first. Open a gymnast to build apparatus plans with their assigned rules context and coaching evidence kept together.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gymnasts.map((gymnast) => {
            const apparatus = new Set(gymnast.routines.map((routine) => routine.apparatus));
            return (
              <a key={gymnast.id} href={"/gymnasts/" + gymnast.id + "/routines"} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="font-semibold">{gymnast.name}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{gymnast.routines.length} saved {gymnast.routines.length === 1 ? "plan" : "plans"} · {apparatus.size}/4 apparatus</p>
              </a>
            );
          })}
          {!gymnasts.length && <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">No accessible gymnasts yet.</p>}
        </div>
      </section>
    </AppShell>
  );
}
