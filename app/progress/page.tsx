import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const dateValue = (date: Date) => date.toISOString().slice(0, 10);
const apparatusLabel: Record<string, string> = {
  VAULT: "Vault",
  UNEVEN_BARS: "Uneven Bars",
  BALANCE_BEAM: "Balance Beam",
  FLOOR_EXERCISE: "Floor Exercise",
  PHYSICAL_PREPARATION: "Physical Preparation",
};
const directionLabel: Record<string, string> = {
  HIGHER: "Higher value indicates more",
  LOWER: "Lower value indicates less",
  COACH_INTERPRETATION: "Coach interpretation",
};

function number(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ gymnast?: string; metric?: string }>;
}) {
  const c = await requireAuthContext();
  const query = await searchParams;
  const gymnasts = c.access.canUseCoachingWorkspace
    ? await prisma.gymnast.findMany({
        where: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      })
    : [];
  const selectedGymnast = gymnasts.find((gymnast) => gymnast.id === query.gymnast) ?? gymnasts[0] ?? null;

  const metrics = selectedGymnast
    ? await prisma.testMetric.findMany({
        where: {
          organisationId: c.organisation.id,
          results: { some: { gymnastId: selectedGymnast.id } },
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      })
    : [];
  const selectedMetric = metrics.find((metric) => metric.id === query.metric) ?? metrics[0] ?? null;

  const [metricResults, trainingEvidence, testingSessions] = selectedGymnast
    ? await Promise.all([
        selectedMetric
          ? prisma.testingResult.findMany({
              where: { gymnastId: selectedGymnast.id, metricId: selectedMetric.id },
              include: { session: true },
              orderBy: [{ recordedAt: "desc" }],
              take: 50,
            })
          : Promise.resolve([]),
        prisma.trainingEvidence.findMany({
          where: {
            gymnastId: selectedGymnast.id,
            session: { organisationId: c.organisation.id },
          },
          include: {
            session: { select: { title: true, sessionDate: true } },
            block: { select: { title: true, apparatus: true } },
            station: { select: { name: true } },
          },
          orderBy: { recordedAt: "desc" },
          take: 100,
        }),
        prisma.testingSession.findMany({
          where: {
            organisationId: c.organisation.id,
            gymnasts: { some: { gymnastId: selectedGymnast.id } },
          },
          include: {
            results: { where: { gymnastId: selectedGymnast.id }, select: { id: true } },
          },
          orderBy: [{ testedAt: "desc" }, { createdAt: "desc" }],
          take: 20,
        }),
      ])
    : [[], [], []];

  const latest = metricResults[0] ?? null;
  const previous = metricResults[1] ?? null;
  const delta = latest && previous ? latest.numberValue - previous.numberValue : null;
  const outcomeCounts = trainingEvidence.reduce(
    (counts, entry) => {
      if (entry.outcome === "MADE") counts.made += 1;
      if (entry.outcome === "MISSED") counts.missed += 1;
      if (entry.outcome === "SPOTTED") counts.spotted += 1;
      return counts;
    },
    { made: 0, missed: 0, spotted: 0 },
  );

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">Testing & progress</p>
            <h1 className="mt-2 text-3xl font-semibold">Progress Hub</h1>
            <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
              Review evidence across time without turning a result into an automatic judgement. Context stays visible and the coach decides what it means.
            </p>
          </div>
          <a href="/testing" className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Open Testing</a>
        </div>

        <form method="get" className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <label className="text-sm font-medium">Gymnast
            <select name="gymnast" defaultValue={selectedGymnast?.id ?? ""} className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-3">
              <option value="">Choose gymnast…</option>
              {gymnasts.map((gymnast) => <option key={gymnast.id} value={gymnast.id}>{gymnast.name}</option>)}
            </select>
          </label>
          <button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">View progress</button>
        </form>

        {!selectedGymnast ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">No accessible gymnasts yet.</div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--muted)]">Evidence snapshot</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedGymnast.name}</h2>
              </div>
              <a href={"/gymnasts/" + selectedGymnast.id} className="text-sm font-semibold">Gymnast overview →</a>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-sm text-[var(--muted)]">Testing sessions</p><strong className="mt-2 block text-2xl">{testingSessions.length}</strong></article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-sm text-[var(--muted)]">Training observations</p><strong className="mt-2 block text-2xl">{trainingEvidence.length}</strong></article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-sm text-[var(--muted)]">Made</p><strong className="mt-2 block text-2xl">{outcomeCounts.made}</strong></article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-sm text-[var(--muted)]">Spotted / missed</p><strong className="mt-2 block text-2xl">{outcomeCounts.spotted} / {outcomeCounts.missed}</strong></article>
            </div>

            <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--muted)]">Longitudinal testing evidence</p>
                  <h2 className="mt-1 text-xl font-semibold">Metric history</h2>
                </div>
                {metrics.length > 0 && (
                  <form method="get" className="flex flex-wrap gap-2">
                    <input type="hidden" name="gymnast" value={selectedGymnast.id} />
                    <select name="metric" defaultValue={selectedMetric?.id ?? ""} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                      {metrics.map((metric) => <option key={metric.id} value={metric.id}>{metric.name}</option>)}
                    </select>
                    <button className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Show</button>
                  </form>
                )}
              </div>

              {selectedMetric && latest ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-[var(--border)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Latest</p>
                      <strong className="mt-2 block text-3xl">{number(latest.numberValue)}{selectedMetric.unit ? " " + selectedMetric.unit : ""}</strong>
                      <span className="mt-1 block text-xs text-[var(--muted)]">{dateValue(latest.session.testedAt)}</span>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Previous</p>
                      {previous ? (
                        <><strong className="mt-2 block text-3xl">{number(previous.numberValue)}{selectedMetric.unit ? " " + selectedMetric.unit : ""}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{dateValue(previous.session.testedAt)}</span></>
                      ) : <strong className="mt-2 block text-lg">Not yet assessed twice</strong>}
                    </div>
                    <div className="rounded-xl border border-[var(--border)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Change since previous</p>
                      <strong className="mt-2 block text-3xl">{delta === null ? "—" : (delta > 0 ? "+" : "") + number(delta)}{delta !== null && selectedMetric.unit ? " " + selectedMetric.unit : ""}</strong>
                      <span className="mt-1 block text-xs text-[var(--muted)]">{directionLabel[selectedMetric.direction] ?? "Coach interpretation"}</span>
                    </div>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead><tr className="border-b border-[var(--border)] text-[var(--muted)]"><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Result</th><th className="py-2 pr-4">Session</th><th className="py-2">Coach context</th></tr></thead>
                      <tbody>
                        {metricResults.map((result) => (
                          <tr key={result.id} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-3 pr-4">{dateValue(result.session.testedAt)}</td>
                            <td className="py-3 pr-4 font-semibold">{number(result.numberValue)}{selectedMetric.unit ? " " + selectedMetric.unit : ""}</td>
                            <td className="py-3 pr-4">{result.session.name}</td>
                            <td className="py-3 text-[var(--muted)]">{result.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No testing results recorded for this gymnast yet.</p>
              )}
            </article>

            <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Training context</p>
              <h2 className="mt-1 text-xl font-semibold">Recent observations</h2>
              <div className="mt-4 grid gap-2">
                {trainingEvidence.slice(0, 20).map((entry) => (
                  <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--border)] p-3 text-sm">
                    <div>
                      <p className="font-semibold">{entry.outcome} · {entry.station?.name ?? entry.block.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {dateValue(entry.session.sessionDate)} · {entry.session.title}
                        {entry.block.apparatus ? " · " + (apparatusLabel[entry.block.apparatus] ?? entry.block.apparatus) : ""}
                      </p>
                    </div>
                    {entry.note && <p className="max-w-md text-[var(--muted)]">{entry.note}</p>}
                  </div>
                ))}
                {!trainingEvidence.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No live-training observations recorded yet.</p>}
              </div>
            </article>

            <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
              Evidence snapshot → context → coach judgement. A change in a metric or training outcome is not, by itself, a readiness or progression decision.
            </p>
          </>
        )}
      </section>
    </AppShell>
  );
}
