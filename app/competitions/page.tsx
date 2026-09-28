import { AppShell } from "@/app/components/app-shell";
import { createCompetitionEvent } from "@/app/actions/competitions";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const dateValue = (date: Date) => date.toISOString().slice(0, 10);

export default async function CompetitionsPage() {
  const c = await requireAuthContext();
  const events = c.access.canUseCoachingWorkspace
    ? await prisma.competitionEvent.findMany({
        where: { organisationId: c.organisation.id },
        include: { entries: { select: { id: true } } },
        orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
        take: 60,
      })
    : [];

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <p className="text-sm font-semibold text-[var(--muted)]">Competitions</p>
        <h1 className="mt-2 text-3xl font-semibold">Competition workspace</h1>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          Plan external competitions and control competitions from the same gymnast-first evidence model. Planned routines, competition outcomes and coaching interpretation remain distinct.
        </p>

        <details className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <summary className="cursor-pointer font-semibold">+ New competition</summary>
          <form action={createCompetitionEvent} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input name="name" required placeholder="Competition name" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
            <select name="eventType" required defaultValue="EXTERNAL" className="rounded-xl border border-[var(--border)] px-3 py-3">
              <option value="EXTERNAL">External competition</option>
              <option value="CONTROL">Control competition</option>
            </select>
            <input name="eventDate" type="date" required className="rounded-xl border border-[var(--border)] px-3 py-3"/>
            <input name="location" placeholder="Location (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
            <textarea name="notes" placeholder="Event notes (optional)" className="min-h-20 rounded-xl border border-[var(--border)] px-3 py-3 md:col-span-2 lg:col-span-3"/>
            <button className="rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Create competition</button>
          </form>
        </details>

        <div className="mt-8 grid gap-4">
          {events.map((event) => (
            <a key={event.id} href={"/competitions/" + event.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span>{event.eventType === "CONTROL" ? "Control competition" : "External competition"}</span>
                    <span>·</span><span>{dateValue(event.eventDate)}</span>
                    {event.location && <><span>·</span><span>{event.location}</span></>}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{event.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{event.entries.length} gymnast{event.entries.length === 1 ? "" : "s"}</p>
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{event.status}</span>
              </div>
            </a>
          ))}
          {!events.length && <p className="rounded-2xl border border-dashed border-[var(--border)] p-7 text-sm text-[var(--muted)]">No competitions yet. Create an external or control competition above.</p>}
        </div>
      </section>
    </AppShell>
  );
}
