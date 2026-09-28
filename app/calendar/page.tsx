import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

function startOfUtcWeek(value: string | undefined) {
  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T00:00:00.000Z")
    : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const day = date.getUTCDay();
  const shift = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() + shift);
  return monday;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayHeading(date: Date) {
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const c = await requireAuthContext();
  const params = await searchParams;
  const weekStart = startOfUtcWeek(params.week);
  const weekEnd = addDays(weekStart, 7);
  const previousWeek = dateKey(addDays(weekStart, -7));
  const nextWeek = dateKey(addDays(weekStart, 7));

  const sessions = c.access.canUseCoachingWorkspace
    ? await prisma.trainingSession.findMany({
        where: {
          organisationId: c.organisation.id,
          sessionDate: { gte: weekStart, lt: weekEnd },
          trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
        },
        include: {
          trainingGroup: true,
          facilityAssignment: { include: { location: true } },
          blocks: { select: { id: true, durationMin: true } },
          gymnasts: { select: { gymnastId: true } },
          rotationGroups: { select: { id: true } },
        },
        orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
      })
    : [];

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">Calendar</p>
            <h1 className="mt-2 text-3xl font-semibold">Training week</h1>
            <p className="mt-3 text-[var(--muted)]">
              {dateKey(weekStart)} to {dateKey(addDays(weekEnd, -1))}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={"/calendar?week=" + previousWeek} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">← Previous</a>
            <a href="/calendar" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Current week</a>
            <a href={"/calendar?week=" + nextWeek} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Next →</a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">
            {sessions.length} planned {sessions.length === 1 ? "session" : "sessions"} this week
          </p>
          <a href="/planning" className="text-sm font-semibold">Plan sessions →</a>
        </div>

        <div className="mt-6 grid gap-4">
          {days.map((day) => {
            const key = dateKey(day);
            const daySessions = sessions.filter((session) => dateKey(session.sessionDate) === key);
            return (
              <article key={key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">{dayHeading(day)}</h2>
                  <span className="text-sm text-[var(--muted)]">{daySessions.length}</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {daySessions.length ? daySessions.map((session) => {
                    const plannedMinutes = session.blocks.reduce((total, block) => total + (block.durationMin ?? 0), 0);
                    return (
                      <a key={session.id} href={"/planning/" + session.id} className="rounded-xl border border-[var(--border)] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{session.startTime}–{session.endTime} · {session.title}</p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {session.trainingGroup.name}
                              {session.facilityAssignment ? " · " + session.facilityAssignment.location.name : ""}
                            </p>
                          </div>
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                            {session.gymnasts.length} gymnasts · {session.blocks.length} blocks
                            {plannedMinutes ? " · " + plannedMinutes + " min" : ""}
                            {session.rotationGroups.length ? " · " + session.rotationGroups.length + " rotations" : ""}
                          </span>
                        </div>
                      </a>
                    );
                  }) : (
                    <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                      No planned sessions.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
