import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

type ViewMode = "month" | "week";

function parseDate(value: string | undefined) {
  const parsed = value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T00:00:00.000Z")
    : new Date();
  return Number.isNaN(parsed.getTime())
    ? new Date()
    : new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function startOfWeek(date: Date) {
  const day = date.getUTCDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
}

function startOfMonthGrid(date: Date) {
  return startOfWeek(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
}

function endOfMonthGrid(date: Date) {
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return addDays(startOfWeek(last), 7);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timeMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function shortDay(date: Date) {
  return new Intl.DateTimeFormat("en-IE", { weekday: "short", timeZone: "UTC" }).format(date);
}

function monthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-IE", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function weekTitle(start: Date) {
  const end = addDays(start, 6);
  const first = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", timeZone: "UTC" }).format(start);
  const last = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(end);
  return first + " – " + last;
}

function sessionHref(session: { id: string; status: string }) {
  return session.status === "IN_PROGRESS" || session.status === "COMPLETED"
    ? "/training/" + session.id
    : "/planning/" + session.id;
}

function statusLabel(status: string) {
  if (status === "IN_PROGRESS") return "Live";
  if (status === "COMPLETED") return "Completed";
  return "Planned";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const c = await requireAuthContext();
  const params = await searchParams;
  const anchor = parseDate(params.date);
  const view: ViewMode = params.view === "week" ? "week" : "month";
  const today = parseDate(undefined);

  const rangeStart = view === "week" ? startOfWeek(anchor) : startOfMonthGrid(anchor);
  const rangeEnd = view === "week" ? addDays(rangeStart, 7) : endOfMonthGrid(anchor);
  const previous = view === "week" ? addDays(anchor, -7) : addMonths(anchor, -1);
  const next = view === "week" ? addDays(anchor, 7) : addMonths(anchor, 1);

  const sessions = c.access.canUseCoachingWorkspace
    ? await prisma.trainingSession.findMany({
        where: {
          organisationId: c.organisation.id,
          sessionDate: { gte: rangeStart, lt: rangeEnd },
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

  const title = view === "week" ? weekTitle(rangeStart) : monthTitle(anchor);
  const monthDays = view === "month"
    ? Array.from({ length: Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) }, (_, index) => addDays(rangeStart, index))
    : [];
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(rangeStart, index));

  const weekSessionMinutes = view === "week"
    ? sessions.flatMap((session) => [timeMinutes(session.startTime), timeMinutes(session.endTime)])
    : [];
  const earliest = weekSessionMinutes.length ? Math.max(0, Math.floor(Math.min(...weekSessionMinutes) / 60) * 60 - 60) : 8 * 60;
  const latest = weekSessionMinutes.length ? Math.min(24 * 60, Math.ceil(Math.max(...weekSessionMinutes) / 60) * 60 + 60) : 22 * 60;
  const calendarStart = Math.min(earliest, 8 * 60);
  const calendarEnd = Math.max(latest, 22 * 60);
  const totalMinutes = calendarEnd - calendarStart;
  const hourRows = Array.from({ length: Math.ceil(totalMinutes / 60) + 1 }, (_, index) => calendarStart / 60 + index);

  const linkFor = (date: Date, targetView = view) => "/calendar?view=" + targetView + "&date=" + dateKey(date);

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">Calendar</p>
            <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{sessions.length} {sessions.length === 1 ? "session" : "sessions"} in view</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-[var(--border)] p-1">
              <a href={linkFor(anchor, "month")} className={"rounded-lg px-3 py-2 text-sm font-semibold " + (view === "month" ? "bg-[var(--foreground)] text-white" : "")}>Month</a>
              <a href={linkFor(anchor, "week")} className={"rounded-lg px-3 py-2 text-sm font-semibold " + (view === "week" ? "bg-[var(--foreground)] text-white" : "")}>Week</a>
            </div>
            <a href={linkFor(previous)} aria-label={"Previous " + view} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">←</a>
            <a href={"/calendar?view=" + view} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Today</a>
            <a href={linkFor(next)} aria-label={"Next " + view} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">→</a>
            <a href="/planning" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Planning</a>
          </div>
        </div>

        {view === "month" ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 border-b border-[var(--border)]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day, index) => {
                  const key = dateKey(day);
                  const daySessions = sessions.filter((session) => dateKey(session.sessionDate) === key);
                  const outsideMonth = day.getUTCMonth() !== anchor.getUTCMonth();
                  const isToday = key === dateKey(today);
                  return (
                    <div
                      key={key}
                      className={"min-h-[150px] border-b border-r border-[var(--border)] p-2 " + (outsideMonth ? "opacity-55 " : "") + ((index + 1) % 7 === 0 ? "border-r-0 " : "")}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <a href={linkFor(day, "week")} className={"flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold " + (isToday ? "bg-[var(--foreground)] text-white" : "")}>
                          {day.getUTCDate()}
                        </a>
                        {daySessions.length > 0 && <span className="text-[10px] text-[var(--muted)]">{daySessions.length}</span>}
                      </div>
                      <div className="grid gap-1.5">
                        {daySessions.slice(0, 4).map((session) => (
                          <a key={session.id} href={sessionHref(session)} className="rounded-lg border border-[var(--border)] px-2 py-2 text-xs leading-4 hover:border-[var(--foreground)]">
                            <span className="block font-semibold">{session.startTime} · {session.trainingGroup.name}</span>
                            <span className="mt-0.5 block truncate text-[var(--muted)]">{session.title}</span>
                            {session.status !== "PLANNED" && <span className="mt-1 block text-[10px] font-semibold">{statusLabel(session.status)}</span>}
                          </a>
                        ))}
                        {daySessions.length > 4 && (
                          <a href={linkFor(day, "week")} className="px-2 py-1 text-xs font-semibold">+ {daySessions.length - 4} more</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[64px_repeat(7,minmax(128px,1fr))] border-b border-[var(--border)]">
                <div className="border-r border-[var(--border)]" />
                {weekDays.map((day) => {
                  const key = dateKey(day);
                  const isToday = key === dateKey(today);
                  return (
                    <div key={key} className="border-r border-[var(--border)] px-2 py-3 text-center last:border-r-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{shortDay(day)}</span>
                      <span className={"mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold " + (isToday ? "bg-[var(--foreground)] text-white" : "")}>{day.getUTCDate()}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-[64px_repeat(7,minmax(128px,1fr))]">
                <div className="relative border-r border-[var(--border)]" style={{ height: totalMinutes + "px" }}>
                  {hourRows.map((hour) => (
                    <span key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] text-[var(--muted)]" style={{ top: (hour * 60 - calendarStart) + "px" }}>
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  ))}
                </div>
                {weekDays.map((day) => {
                  const key = dateKey(day);
                  const daySessions = sessions.filter((session) => dateKey(session.sessionDate) === key);
                  return (
                    <div key={key} className="relative border-r border-[var(--border)] last:border-r-0" style={{ height: totalMinutes + "px" }}>
                      {hourRows.map((hour) => (
                        <div key={hour} className="absolute left-0 right-0 border-t border-[var(--border)] opacity-60" style={{ top: (hour * 60 - calendarStart) + "px" }} />
                      ))}
                      {daySessions.map((session) => {
                        const start = timeMinutes(session.startTime);
                        const end = timeMinutes(session.endTime);
                        const top = Math.max(0, start - calendarStart);
                        const height = Math.max(38, end - start);
                        const plannedMinutes = session.blocks.reduce((sum, block) => sum + (block.durationMin ?? 0), 0);
                        return (
                          <a
                            key={session.id}
                            href={sessionHref(session)}
                            className="absolute left-1 right-1 z-10 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs shadow-sm hover:border-[var(--foreground)]"
                            style={{ top: top + "px", height: height + "px" }}
                            title={session.title + " · " + session.trainingGroup.name}
                          >
                            <span className="block font-semibold">{session.startTime}–{session.endTime}</span>
                            <span className="block truncate font-semibold">{session.trainingGroup.name}</span>
                            {height >= 58 && <span className="block truncate text-[var(--muted)]">{session.title}</span>}
                            {height >= 82 && (
                              <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">
                                {statusLabel(session.status)}
                                {session.facilityAssignment ? " · " + session.facilityAssignment.location.name : ""}
                                {plannedMinutes ? " · " + plannedMinutes + " min planned" : ""}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <p>Tap a date in Month view to open its week. Tap a session to open its plan or live/completed training record.</p>
          <a href="/planning" className="font-semibold text-[var(--foreground)]">Create or edit sessions →</a>
        </div>
      </section>
    </AppShell>
  );
}
