import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { recordCompetitionPerformance } from "@/app/actions/competitions";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
const apparatusLabel: Record<string,string> = { VAULT:"Vault", BARS:"Uneven Bars", BEAM:"Balance Beam", FLOOR:"Floor Exercise" };

export default async function CompetitionJudgePage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const event = await prisma.competitionEvent.findFirst({
    where: { id, organisationId: c.organisation.id },
    include: {
      entries: {
        include: {
          gymnast: true,
          apparatusPlans: { include: { performance: {include:{revisions:{orderBy:{supersededAt:"desc"}}}} }, orderBy: { apparatus: "asc" } },
        },
        orderBy: { gymnast: { name: "asc" } },
      },
    },
  });
  if (!event) notFound();
  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page"><a href={"/competitions/" + event.id} className="workspace-back">← Competition workspace</a><div className="workspace-hero"><div><p className="workspace-kicker">Competition day · Judge view</p><h1>{event.name}</h1><p className="workspace-meta">{event.entries.length} gymnast{event.entries.length===1?"":"s"}</p></div></div>
        <div className="mt-6 grid gap-5">
          {event.entries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-xl font-semibold">{entry.gymnast.name}</h2><p className="mt-1 text-xs text-[var(--muted)]">{entry.rulesetProgramName && entry.rulesetLevelName ? entry.rulesetProgramName + " · " + entry.rulesetLevelName : "No ruleset snapshot"}{entry.ageDivision ? " · " + entry.ageDivision : ""}</p></div>
                {entry.sessionLabel && <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{entry.sessionLabel}</span>}
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {entry.apparatusPlans.map((plan) => (
                  <form key={plan.id} action={recordCompetitionPerformance} className="rounded-xl border border-[var(--border)] p-4">
                    <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="planId" value={plan.id}/>
                    <div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{apparatusLabel[plan.apparatus] ?? plan.apparatus}</p><p className="mt-1 text-xs text-[var(--muted)]">{plan.routineNameSnapshot || "No saved routine selected"}</p></div>{plan.performance?.finalScore != null && <strong>{plan.performance.finalScore.toFixed(3)}</strong>}</div>
                    <select name="performanceStatus" defaultValue={plan.performance?.status ?? "NOT_RECORDED"} className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><option value="NOT_RECORDED">Not recorded</option><option value="COMPETED">Competed</option><option value="SCRATCHED">Scratched</option><option value="EXHIBITION">Exhibition</option></select>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input name="difficultyScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.difficultyScore ?? ""} placeholder="D score" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <input name="executionScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.executionScore ?? ""} placeholder="E score" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <input name="penalty" type="number" min="0" step="0.001" defaultValue={plan.performance?.penalty ?? ""} placeholder="Penalty" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                      <input name="finalScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.finalScore ?? ""} placeholder="Official / observed final" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                    </div>
                    <input name="rank" type="number" min="1" step="1" defaultValue={plan.performance?.rank ?? ""} placeholder="Apparatus rank (optional)" className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                    <textarea name="judgeNote" defaultValue={plan.performance?.judgeNote ?? ""} placeholder="Judge / official-score context" className="mt-2 min-h-20 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                    <input type="hidden" name="warmupNote" value={plan.performance?.warmupNote ?? ""}/><input type="hidden" name="coachObservation" value={plan.performance?.coachObservation ?? ""}/>
                    <button className="mt-2 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save apparatus result</button>{plan.performance?.revisions.length?<p className="mt-2 text-xs text-[var(--muted)]">{plan.performance.revisions.length} previous recorded version{plan.performance.revisions.length===1?"":"s"} preserved.</p>:null}
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
