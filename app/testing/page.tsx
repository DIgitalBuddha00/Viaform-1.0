import { AppShell } from "@/app/components/app-shell";
import { createTestMetric, createTestingSession } from "@/app/actions/testing";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const dateValue = (date: Date) => date.toISOString().slice(0, 10);
const modeLabel: Record<string, string> = {
  COUNTDOWN_TALLY: "Countdown + tally",
  STOPWATCH: "Stopwatch",
  REPETITION_TALLY: "Repetition tally",
  MEASUREMENT: "Measurement",
};

export default async function TestingPage() {
  const c = await requireAuthContext();
  const groups = c.access.canUseCoachingWorkspace
    ? await prisma.trainingGroup.findMany({
        where: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
        include: { memberships: { select: { gymnastId: true } } },
        orderBy: { name: "asc" },
      })
    : [];
  const metrics = c.access.canUseCoachingWorkspace
    ? await prisma.testMetric.findMany({
        where: { organisationId: c.organisation.id, status: "ACTIVE" },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      })
    : [];
  const sessions = c.access.canUseCoachingWorkspace
    ? await prisma.testingSession.findMany({
        where: {
          organisationId: c.organisation.id,
          trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
        },
        include: { trainingGroup: true, gymnasts: true, results: { select: { id: true } } },
        orderBy: [{ testedAt: "desc" }, { createdAt: "desc" }],
        take: 30,
      })
    : [];

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <p className="text-sm font-semibold text-[var(--muted)]">Testing & progress</p>
        <h1 className="mt-2 text-3xl font-semibold">Testing</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Capture repeatable evidence quickly on the gym floor. Raw results are retained; Viaform does not turn a test result into a progression decision.
        </p>

        <form action={createTestingSession} className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Start a group testing session</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">The current group roster is snapshotted into the testing session.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <select name="groupId" required className="rounded-xl border border-[var(--border)] px-3 py-3">
              <option value="">Choose group…</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name} · {group.memberships.length}</option>)}
            </select>
            <input name="testedAt" type="date" required className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <input name="name" placeholder="Session name (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <input name="purpose" placeholder="Testing purpose (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input name="conditions" placeholder="Conditions / preparation (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <input name="notes" placeholder="Session notes (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3" />
          </div>
          <button className="mt-3 rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Start testing</button>
        </form>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-semibold text-[var(--muted)]">History</p><h2 className="mt-1 text-2xl font-semibold">Testing sessions</h2></div>
              <span className="text-sm text-[var(--muted)]">{sessions.length}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {sessions.length ? sessions.map((session) => (
                <a key={session.id} href={"/testing/" + session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{session.trainingGroup.name} · {dateValue(session.testedAt)}</p>
                      {session.purpose && <p className="mt-2 text-sm">{session.purpose}</p>}
                    </div>
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                      {session.status} · {session.results.length} results
                    </span>
                  </div>
                </a>
              )) : (
                <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">No testing sessions yet.</p>
              )}
            </div>
          </div>

          <aside>
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-semibold text-[var(--muted)]">Club metrics</p><h2 className="mt-1 text-2xl font-semibold">Custom tests</h2></div>
              <span className="text-sm text-[var(--muted)]">{metrics.length}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="font-semibold">{metric.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {metric.category} · {modeLabel[metric.captureMode] ?? metric.captureMode}
                    {metric.unit ? " · " + metric.unit : ""}
                    {metric.durationSeconds ? " · " + metric.durationSeconds + " sec" : ""}
                  </p>
                </div>
              ))}
              {!metrics.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">No custom metrics yet.</p>}
            </div>

            <details className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <summary className="cursor-pointer font-semibold">Create custom metric</summary>
              <form action={createTestMetric} className="mt-4 grid gap-3">
                <input name="name" required placeholder="Metric name" className="rounded-xl border border-[var(--border)] px-3 py-3" />
                <input name="category" placeholder="Category, e.g. Physical preparation" className="rounded-xl border border-[var(--border)] px-3 py-3" />
                <select name="apparatus" className="rounded-xl border border-[var(--border)] px-3 py-3">
                  <option value="">No apparatus</option>
                  <option value="VAULT">Vault</option><option value="UNEVEN_BARS">Uneven Bars</option>
                  <option value="BALANCE_BEAM">Balance Beam</option><option value="FLOOR_EXERCISE">Floor Exercise</option>
                  <option value="PHYSICAL_PREPARATION">Physical Preparation</option>
                </select>
                <select name="captureMode" required className="rounded-xl border border-[var(--border)] px-3 py-3">
                  <option value="COUNTDOWN_TALLY">Countdown + tally</option>
                  <option value="STOPWATCH">Stopwatch</option>
                  <option value="REPETITION_TALLY">Repetition tally</option>
                  <option value="MEASUREMENT">Measurement</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input name="unit" placeholder="Unit, e.g. sec, cm, reps" className="rounded-xl border border-[var(--border)] px-3 py-3" />
                  <input name="durationSeconds" type="number" min="1" max="3600" placeholder="Countdown seconds" className="rounded-xl border border-[var(--border)] px-3 py-3" />
                </div>
                <select name="direction" defaultValue="COACH_INTERPRETATION" className="rounded-xl border border-[var(--border)] px-3 py-3">
                  <option value="COACH_INTERPRETATION">Coach interpretation</option>
                  <option value="HIGHER">Higher value indicates more</option>
                  <option value="LOWER">Lower value indicates less</option>
                </select>
                <textarea name="protocol" placeholder="Protocol / how to run this test" className="min-h-20 rounded-xl border border-[var(--border)] px-3 py-3" />
                <textarea name="description" placeholder="What this metric records" className="min-h-20 rounded-xl border border-[var(--border)] px-3 py-3" />
                <button className="rounded-xl border border-[var(--border)] px-4 py-3 font-semibold">Create metric</button>
              </form>
            </details>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
