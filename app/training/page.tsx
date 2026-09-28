import { AppShell } from "@/app/components/app-shell";
import { startTrainingSession } from "@/app/actions/live-training";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const dateValue = (date: Date) => date.toISOString().slice(0, 10);

export default async function TrainingPage() {
  const c = await requireAuthContext();
  const scope = groupScopeWhere(c.organisation.id, c.membership.id, c.access);
  const [active, planned, completed] = c.access.canUseCoachingWorkspace
    ? await Promise.all([
        prisma.trainingSession.findMany({
          where: { organisationId: c.organisation.id, status: "IN_PROGRESS", trainingGroup: scope },
          include: { trainingGroup: true, blocks: true, gymnasts: true, evidence: true },
          orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
        }),
        prisma.trainingSession.findMany({
          where: { organisationId: c.organisation.id, status: "PLANNED", trainingGroup: scope },
          include: { trainingGroup: true, blocks: true, gymnasts: true },
          orderBy: [{ sessionDate: "asc" }, { startTime: "asc" }],
          take: 30,
        }),
        prisma.trainingSession.findMany({
          where: { organisationId: c.organisation.id, status: "COMPLETED", trainingGroup: scope },
          include: { trainingGroup: true, blocks: true, gymnasts: true, evidence: true },
          orderBy: [{ sessionDate: "desc" }, { startTime: "desc" }],
          take: 12,
        }),
      ])
    : [[], [], []];

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <p className="text-sm font-semibold text-[var(--muted)]">Training</p>
        <h1 className="mt-2 text-3xl font-semibold">Live training</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Run the session from the plan already created in Viaform. Evidence is captured against the gymnast and planned block without creating a second copy of the session.
        </p>

        {active.length > 0 && (
          <div className="mt-8">
            <p className="text-sm font-semibold text-[var(--muted)]">In progress</p>
            <div className="mt-3 grid gap-3">
              {active.map((session) => (
                <a key={session.id} href={"/training/" + session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{session.trainingGroup.name} · {dateValue(session.sessionDate)} · {session.startTime}–{session.endTime}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">LIVE · {session.evidence.length} observations</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-semibold text-[var(--muted)]">Ready</p><h2 className="mt-1 text-2xl font-semibold">Planned sessions</h2></div>
            <a href="/planning" className="text-sm font-semibold">Planning →</a>
          </div>
          <div className="mt-4 grid gap-3">
            {planned.length ? planned.map((session) => (
              <article key={session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {session.trainingGroup.name} · {dateValue(session.sessionDate)} · {session.startTime}–{session.endTime}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{session.gymnasts.length} gymnasts · {session.blocks.length} planned blocks</p>
                  </div>
                  <form action={startTrainingSession}>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <button className="rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Start training</button>
                  </form>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
                No planned sessions waiting to start.
              </div>
            )}
          </div>
        </div>

        {completed.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold text-[var(--muted)]">Recent</p>
            <h2 className="mt-1 text-2xl font-semibold">Completed sessions</h2>
            <div className="mt-4 grid gap-3">
              {completed.map((session) => (
                <a key={session.id} href={"/training/" + session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{session.trainingGroup.name} · {dateValue(session.sessionDate)}</p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{session.evidence.length} observations</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
