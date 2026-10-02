import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { finishTestingSession, pauseTestingSession, reopenTestingSession, resumeTestingSession } from "@/app/actions/testing";
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
  searchParams: Promise<{ metric?: string; edit?: string }>;
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
        results: { orderBy: { recordedAt: "asc" }, include: { revisions: { orderBy: { supersededAt: "desc" } } } },
      },
    }),
    prisma.testMetric.findMany({
      where: {
        organisationId: c.organisation.id,
        OR: [
          { status: "ACTIVE" },
          { results: { some: { sessionId: id } } },
        ],
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!session) notFound();
  const capturedBattery=session.batteryDefinitionSnapshot?(()=>{try{return JSON.parse(session.batteryDefinitionSnapshot) as Array<{metricId:string;name:string;protocolVersion:number}>}catch{return []}})():[];const batteryMetricIds=capturedBattery.map(i=>i.metricId);const availableMetrics=session.singleMetricId?metrics.filter(m=>m.id===session.singleMetricId):session.batteryId?(batteryMetricIds.length?batteryMetricIds.map(id=>metrics.find(m=>m.id===id)).filter((m):m is (typeof metrics)[number]=>!!m):(await prisma.testBatteryItem.findMany({where:{batteryId:session.batteryId},orderBy:{orderIndex:"asc"}})).map(i=>metrics.find(m=>m.id===i.metricId)).filter((m):m is (typeof metrics)[number]=>!!m)):metrics;

  const selectedMetric = availableMetrics.find((metric) => metric.id === query.metric) ?? availableMetrics[0] ?? null;
  const metricResults = selectedMetric ? session.results.filter((result) => result.metricId === selectedMetric.id) : [];
  const completedCount = metricResults.length;
  const gymnastPointTotals=new Map<string,number>();session.results.forEach(r=>{if(r.pointsValue!==null)gymnastPointTotals.set(r.gymnastId,(gymnastPointTotals.get(r.gymnastId)??0)+r.pointsValue)});
  const editingCompleted=session.status==="COMPLETED"&&query.edit==="1";
  const isLive = session.status === "IN_PROGRESS";
  const canEditResults=isLive||editingCompleted;
  const canFinish = session.status === "IN_PROGRESS" || session.status === "PAUSED";

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page"><a href="/testing" className="workspace-back">← Testing</a><div className="workspace-hero"><div><p className="workspace-kicker">{session.trainingGroup.name} · {dateValue(session.testedAt)}</p><h1>{session.name}</h1>
            {session.purpose && <p className="workspace-meta">{session.purpose}</p>}{session.batteryNameSnapshot&&<p className="mt-1 text-xs text-[var(--muted)]">{session.batteryNameSnapshot} · battery v{session.batteryVersionSnapshot??1}</p>}
            {(session.conditions || session.notes) && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {[session.conditions, session.notes].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">{session.status==="IN_PROGRESS"?"In progress":session.status.charAt(0)+session.status.slice(1).toLowerCase()}</span>
            {session.status==="IN_PROGRESS" && <form action={pauseTestingSession}><input type="hidden" name="sessionId" value={session.id}/><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Pause testing</button></form>}
            {session.status==="PAUSED"&&<form action={resumeTestingSession}><input type="hidden" name="sessionId" value={session.id}/><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Resume testing</button></form>}
            {session.status==="COMPLETED"&&!editingCompleted&&<a href={"/testing/"+session.id+"?metric="+(selectedMetric?.id??"")+"&edit=1"} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Edit results</a>}
            {editingCompleted&&<form action={reopenTestingSession}><input type="hidden" name="sessionId" value={session.id}/><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Reopen session</button></form>}
            {canFinish && (
              <form action={finishTestingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Finish testing</button>
              </form>
            )}
          </div>
        </div>

        {availableMetrics.length ? (
          <>
            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-2">
                {availableMetrics.map((metric) => (
                  <a key={metric.id} href={"/testing/" + session.id + "?metric=" + metric.id} className={"rounded-xl border px-4 py-3 text-sm " + (selectedMetric?.id === metric.id ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}>
                    <span className="block">{capturedBattery.find(i=>i.metricId===metric.id)?.name??metric.name}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{modeLabel[metric.captureMode] ?? metric.captureMode}{metric.unit ? " · " + metric.unit : ""}{metric.status !== "ACTIVE" ? " · archived" : ""}</span>
                  </a>
                ))}
              </div>
            </div>

            {selectedMetric && (
              <>
                <article className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{session.status==="COMPLETED"?"Recorded test":"Current test"}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{metricResults[0]?.metricNameSnapshot??capturedBattery.find(i=>i.metricId===selectedMetric.id)?.name??selectedMetric.name}</h2>
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
                          <span className="text-xs text-[var(--muted)]">{result ? (result.pointsValue!==null?result.numberValue+" · "+result.pointsValue+" pts":"Recorded") : "Not yet assessed"}</span>
                        </div>
                        {result && <details className="mb-3 rounded-xl border border-[var(--border)] p-3 text-sm"><summary className="cursor-pointer font-semibold">Recorded context{result.revisions.length ? " · " + result.revisions.length + " previous observation" + (result.revisions.length===1?"":"s") : ""}</summary><div className="mt-2 grid gap-1 text-[var(--muted)]"><span>{result.metricNameSnapshot ?? selectedMetric.name} · protocol v{result.protocolVersionSnapshot ?? 1}{result.unitSnapshot ? " · " + result.unitSnapshot : ""}</span>{result.protocolSnapshot && <span>Protocol used: {result.protocolSnapshot}</span>}{result.revisions.map((revision,index)=><div key={revision.id} className="mt-2 border-t border-[var(--border)] pt-2"><strong className="text-[var(--foreground)]">Previous observation {result.revisions.length-index}</strong><span className="block">{revision.numberValue}{revision.unitSnapshot ? " " + revision.unitSnapshot : ""}{revision.pointsValue!==null ? " · " + revision.pointsValue + " pts" : ""} · protocol v{revision.protocolVersionSnapshot ?? 1}</span>{revision.note&&<span className="block">{revision.note}</span>}<span className="block">Superseded {new Intl.DateTimeFormat("en-IE",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(revision.supersededAt)}</span></div>)}</div></details>}
                        <TestingCapture
                          sessionId={session.id}
                          gymnastId={entry.gymnastId}
                          metricId={selectedMetric.id}
                          captureMode={result?.captureModeSnapshot??selectedMetric.captureMode}
                          unit={result?.unitSnapshot??selectedMetric.unit}
                          durationSeconds={selectedMetric.durationSeconds}
                          initialValue={result?.numberValue ?? null}
                          initialNote={result?.note ?? null}
                          scoringMode={selectedMetric.scoringMode}
                          initialPoints={result?.pointsValue ?? null}
                          batteryPoints={session.batteryId?gymnastPointTotals.get(entry.gymnastId)??0:null}
                          disabled={!canEditResults || selectedMetric.status !== "ACTIVE"}
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
