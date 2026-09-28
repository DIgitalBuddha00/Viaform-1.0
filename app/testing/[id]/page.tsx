import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { finishTestingSession } from "@/app/actions/testing";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";
import { TestingCapture } from "./testing-capture";

export const dynamic = "force-dynamic";

const dateValue = (date: Date) => date.toISOString().slice(0, 10);
const modeLabel: Record<string, string> = {
  COUNTDOWN_TALLY: "Countdown + tally",
  STOPWATCH: "Stopwatch",
  REPETITION_TALLY: "Repetition tally",
  MEASUREMENT: "Measurement",
};

export default async function TestingSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ metric?: string }>;
}) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const query = await searchParams;

  const [session, metrics] = await Promise.all([
    prisma.testingSession.findFirst({
      where: {
        id,
        organisationId: c.organisation.id,
        trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
      },
      include: {
        trainingGroup: true,
        gymnasts: { include: { gymnast: true }, orderBy: { assignedAt: "asc" } },
        results: { orderBy: { recordedAt: "asc" } },
      },
    }),
    prisma.testMetric.findMany({
      where: { organisationId: c.organisation.id, status: "ACTIVE" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!session) notFound();

  const selectedMetric = metrics.find((metric) => metric.id === query.metric) ?? metrics[0] ?? null;
  const metricResults = selectedMetric ? session.results.filter((result) => result.metricId === selectedMetric.id) : [];
  const completedCount = metricResults.length;
  const isLive = session.status === "IN_PROGRESS";

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href="/testing" className="text-sm font-semibold text-[var(--muted)]">← Testing</a>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{session.trainingGroup.name} · {dateValue(session.testedAt)}</p>
            <h1 className="mt-2 text-3xl font-semibold">{session.name}</h1>
            {session.purpose && <p className="mt-2 text-sm">{session.purpose}</p>}
            {(session.conditions || session.notes) && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {[session.conditions, session.notes].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">{session.status}</span>
            {isLive && (
              <form action={finishTestingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Finish testing</button>
              </form>
            )}
          </div>
        </div>

        {metrics.length ? (
          <>
            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-2">
                {metrics.map((metric) => (
                  <a key={metric.id} href={"/testing/" + session.id + "?metric=" + metric.id} className={"rounded-xl border px-4 py-3 text-sm " + (selectedMetric?.id === metric.id ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}>
                    <span className="block">{metric.name}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{modeLabel[metric.captureMode] ?? metric.captureMode}{metric.unit ? " · " + metric.unit : ""}</span>
                  </a>
                ))}
              </div>
            </div>

            {selectedMetric && (
              <>
                <article className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Current metric</p>
                      <h2 className="mt-1 text-2xl font-semibold">{selectedMetric.name}</h2>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {modeLabel[selectedMetric.captureMode] ?? selectedMetric.captureMode}
                        {selectedMetric.unit ? " · " + selectedMetric.unit : ""}
                        {selectedMetric.durationSeconds ? " · " + selectedMetric.durationSeconds + " sec" : ""}
                      </p>
                      {selectedMetric.protocol && <p className="mt-3 text-sm">Protocol: {selectedMetric.protocol}</p>}
                    </div>
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">{completedCount}/{session.gymnasts.length} recorded</span>
                  </div>
                </article>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {session.gymnasts.map((entry) => {
                    const result = metricResults.find((item) => item.gymnastId === entry.gymnastId) ?? null;
                    return (
                      <article key={entry.gymnastId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <a href={"/gymnasts/" + entry.gymnastId} className="font-semibold hover:underline">{entry.gymnast.name}</a>
                          <span className="text-xs text-[var(--muted)]">{result ? "Recorded" : "Not yet assessed"}</span>
                        </div>
                        <TestingCapture
                          sessionId={session.id}
                          gymnastId={entry.gymnastId}
                          metricId={selectedMetric.id}
                          captureMode={selectedMetric.captureMode}
                          unit={selectedMetric.unit}
                          durationSeconds={selectedMetric.durationSeconds}
                          initialValue={result?.numberValue ?? null}
                          initialNote={result?.note ?? null}
                          disabled={!isLive}
                        />
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <h2 className="font-semibold">No test metrics yet</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Create a custom metric before recording this testing session.</p>
            <a href="/testing" className="mt-4 inline-block text-sm font-semibold">Create metric →</a>
          </div>
        )}

        <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
          Testing is evidence, not an automatic readiness or progression decision. The coach retains the context and judgement.
        </p>
      </section>
    </AppShell>
  );
}
