import { AppShell } from "@/app/components/app-shell";
import { createTrainingSession } from "@/app/actions/training-planning";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const dayLabel: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
  FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

const dateValue = (date: Date) => date.toISOString().slice(0, 10);

export default async function PlanningPage() {
  const c = await requireAuthContext();
  const groups = c.access.canUseCoachingWorkspace
    ? await prisma.trainingGroup.findMany({
        where: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
        include: { scheduleSlots: { orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }] } },
        orderBy: { name: "asc" },
      })
    : [];
  const sessions = c.access.canUseCoachingWorkspace
    ? await prisma.trainingSession.findMany({
        where: {
          organisationId: c.organisation.id,
          trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
          status: "PLANNED",
        },
        include: { trainingGroup: true, blocks: { select: { id: true, durationMin: true } } },
        orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
        take: 100,
      })
    : [];

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <p className="text-sm font-semibold text-[var(--muted)]">Planning</p>
        <h1 className="mt-2 text-3xl font-semibold">Training sessions</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Turn the weekly group schedule into deliberate sessions. A planned session becomes the source for Live Training rather than a separate copy of the plan.
        </p>

        <form action={createTrainingSession} className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Plan a session</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium">Group
              <select name="groupId" required className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3">
                <option value="">Choose group…</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Date
              <input name="sessionDate" type="date" required className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
            </label>
            <label className="text-sm font-medium">Start
              <input name="startTime" type="time" required className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
            </label>
            <label className="text-sm font-medium">End
              <input name="endTime" type="time" required className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
            </label>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input name="title" placeholder="Session title (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <input name="sessionIntent" placeholder="Session intent — what matters today?" className="rounded-xl border border-[var(--border)] px-3 py-3" />
          </div>
          <textarea name="notes" placeholder="Planning notes (optional)" className="mt-3 min-h-24 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
          <button className="mt-3 rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Create session</button>
        </form>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-semibold text-[var(--muted)]">Planned</p><h2 className="mt-1 text-2xl font-semibold">Sessions</h2></div>
              <span className="text-sm text-[var(--muted)]">{sessions.length}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {sessions.length ? sessions.map((session) => {
                const plannedMinutes = session.blocks.reduce((sum, block) => sum + (block.durationMin ?? 0), 0);
                return (
                  <a key={session.id} href={"/planning/" + session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{session.title}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {session.trainingGroup.name} · {dateValue(session.sessionDate)} · {session.startTime}–{session.endTime}
                        </p>
                        {session.sessionIntent && <p className="mt-2 text-sm">{session.sessionIntent}</p>}
                      </div>
                      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                        {session.blocks.length} blocks{plannedMinutes ? " · " + plannedMinutes + " min" : ""}
                      </span>
                    </div>
                  </a>
                );
              }) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
                  <h3 className="font-semibold">No sessions planned yet</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">Create the first session above. No demo sessions are inserted automatically.</p>
                </div>
              )}
            </div>
          </div>

          <aside>
            <p className="text-sm font-semibold text-[var(--muted)]">Weekly schedule</p>
            <div className="mt-3 grid gap-3">
              {groups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="font-semibold">{group.name}</p>
                  <div className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
                    {group.scheduleSlots.length ? group.scheduleSlots.map((slot) => (
                      <span key={slot.id}>{dayLabel[slot.dayOfWeek] ?? slot.dayOfWeek} · {slot.startTime}–{slot.endTime}</span>
                    )) : <span>No recurring times</span>}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
