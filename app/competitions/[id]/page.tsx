import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import {
  addCompetitionEntry,
  recordCompetitionAthleteReflection,
  recordCompetitionPerformance,
  removeCompetitionEntry,
  selectCompetitionRoutine,
  updateCompetitionEntryContext,
  updateCompetitionEvent,
} from "@/app/actions/competitions";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";
const apparatusLabel: Record<string, string> = { VAULT: "Vault", BARS: "Uneven Bars", BEAM: "Balance Beam", FLOOR: "Floor Exercise" };

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const event = await prisma.competitionEvent.findFirst({
    where: { id, organisationId: c.organisation.id },
    include: {
      entries: {
        include: {
          gymnast: true,
          apparatusPlans: { include: { routine: true, performance: { include: { athleteReflection: true } } }, orderBy: { apparatus: "asc" } },
        },
        orderBy: { gymnast: { name: "asc" } },
      },
    },
  });
  if (!event) notFound();

  const [visibleGymnasts, routines] = await Promise.all([
    prisma.gymnast.findMany({
      where: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
      orderBy: { name: "asc" },
    }),
    prisma.gymnastRoutine.findMany({
      where: {
        gymnast: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
        status: "ACTIVE",
      },
      orderBy: [{ gymnastId: "asc" }, { apparatus: "asc" }, { updatedAt: "desc" }],
    }),
  ]);
  const entered = new Set(event.entries.map((entry) => entry.gymnastId));
  const available = visibleGymnasts.filter((gymnast) => !entered.has(gymnast.id));
  const eventDate = event.eventDate.toISOString().slice(0, 10);

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href="/competitions" className="text-sm font-semibold text-[var(--muted)]">← Competitions</a>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{event.eventType === "CONTROL" ? "Control competition" : "External competition"}</p>
            <h1 className="mt-1 text-3xl font-semibold">{event.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{eventDate}{event.location ? " · " + event.location : ""} · {event.entries.length} entered</p>
          </div>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{event.status}</span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            {event.entries.map((entry) => {
              const gymnastRoutines = routines.filter((routine) => routine.gymnastId === entry.gymnastId);
              return (
                <article key={entry.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <a href={"/gymnasts/" + entry.gymnastId} className="text-lg font-semibold">{entry.gymnast.name}</a>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {entry.rulesetProgramName && entry.rulesetLevelName ? entry.rulesetProgramName + " · " + entry.rulesetLevelName : "Ruleset not assigned at entry"}
                      </p>
                      {entry.rulesetVersionLabel && <p className="mt-1 text-xs text-[var(--muted)]">Entry snapshot · {entry.rulesetVersionLabel}</p>}
                    </div>
                    {event.status === "PLANNED" && <form action={removeCompetitionEntry}><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="entryId" value={entry.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove entry</button></form>}
                  </div>

                  <details className="mt-4 rounded-xl border border-[var(--border)] p-3">
                    <summary className="cursor-pointer text-sm font-semibold">Entry context</summary>
                    <form action={updateCompetitionEntryContext} className="mt-3 grid gap-2 md:grid-cols-2">
                      <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="entryId" value={entry.id}/>
                      <input name="ageDivision" defaultValue={entry.ageDivision ?? ""} placeholder="Age division" className="rounded-lg border border-[var(--border)] px-3 py-2"/>
                      <input name="sessionLabel" defaultValue={entry.sessionLabel ?? ""} placeholder="Session / flight" className="rounded-lg border border-[var(--border)] px-3 py-2"/>
                      <input name="squadLabel" defaultValue={entry.squadLabel ?? ""} placeholder="Squad / team" className="rounded-lg border border-[var(--border)] px-3 py-2"/>
                      <input name="coachNote" defaultValue={entry.coachNote ?? ""} placeholder="Coach entry note" className="rounded-lg border border-[var(--border)] px-3 py-2"/>
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:col-span-2">Save entry context</button>
                    </form>
                  </details>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {entry.apparatusPlans.map((plan) => {
                      const choices = gymnastRoutines.filter((routine) => routine.apparatus === plan.apparatus);
                      return (
                        <div key={plan.id} className="rounded-xl border border-[var(--border)] p-4">
                          <p className="font-semibold">{apparatusLabel[plan.apparatus] ?? plan.apparatus}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">{plan.routineNameSnapshot ? "Planned · " + plan.routineNameSnapshot : "No routine selected yet"}</p>
                          <form action={selectCompetitionRoutine} className="mt-3 grid gap-2">
                            <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="planId" value={plan.id}/>
                            <select name="routineId" defaultValue={plan.routineId ?? ""} disabled={event.status !== "PLANNED"} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-60">
                              <option value="">No saved routine selected</option>
                              {choices.map((routine) => <option key={routine.id} value={routine.id}>{routine.name} · {routine.purpose === "CURRENT" ? "Current" : "Alternative"}</option>)}
                            </select>
                            <input name="planNote" defaultValue={plan.planNote ?? ""} placeholder="Plan note" disabled={event.status !== "PLANNED"} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:opacity-60"/>
                            {event.status === "PLANNED" && <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save apparatus plan</button>}
                          </form>
                          <details className="mt-3 border-t border-[var(--border)] pt-3">
                            <summary className="cursor-pointer text-xs font-semibold">{plan.performance?.status === "COMPETED" ? "Recorded outcome" : "Record outcome & perspectives"}</summary>
                            <form action={recordCompetitionPerformance} className="mt-3 grid gap-2">
                              <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="planId" value={plan.id}/>
                              <select name="performanceStatus" defaultValue={plan.performance?.status ?? "NOT_RECORDED"} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                                <option value="NOT_RECORDED">Not recorded</option><option value="COMPETED">Competed</option><option value="SCRATCHED">Scratched</option><option value="EXHIBITION">Exhibition</option>
                              </select>
                              <div className="grid grid-cols-2 gap-2">
                                <input name="difficultyScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.difficultyScore ?? ""} placeholder="D score" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                                <input name="executionScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.executionScore ?? ""} placeholder="E score" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                                <input name="penalty" type="number" min="0" step="0.001" defaultValue={plan.performance?.penalty ?? ""} placeholder="Penalty" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                                <input name="finalScore" type="number" min="0" step="0.001" defaultValue={plan.performance?.finalScore ?? ""} placeholder="Final score" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              </div>
                              <input name="rank" type="number" min="1" step="1" defaultValue={plan.performance?.rank ?? ""} placeholder="Apparatus rank (optional)" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <textarea name="warmupNote" defaultValue={plan.performance?.warmupNote ?? ""} placeholder="Warm-up context" className="min-h-16 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <textarea name="judgeNote" defaultValue={plan.performance?.judgeNote ?? ""} placeholder={event.eventType === "EXTERNAL" ? "Judge / official-score context" : "Judge observation"} className="min-h-16 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <textarea name="coachObservation" defaultValue={plan.performance?.coachObservation ?? ""} placeholder="Coach observation" className="min-h-16 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save outcome</button>
                            </form>
                            <form action={recordCompetitionAthleteReflection} className="mt-4 grid gap-2 border-t border-[var(--border)] pt-3">
                              <input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="planId" value={plan.id}/>
                              <p className="text-xs font-semibold">Athlete reflection</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input name="rating" type="number" min="1" max="5" step="1" defaultValue={plan.performance?.athleteReflection?.rating ?? ""} placeholder="Feel 1–5" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                                <input name="confidence" type="number" min="1" max="10" step="1" defaultValue={plan.performance?.athleteReflection?.confidence ?? ""} placeholder="Confidence 1–10" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              </div>
                              <select name="feltPrepared" defaultValue={plan.performance?.athleteReflection?.feltPrepared == null ? "" : plan.performance.athleteReflection.feltPrepared ? "YES" : "NO"} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><option value="">Felt prepared? —</option><option value="YES">Yes</option><option value="NO">No</option></select>
                              <input name="whatFeltGood" defaultValue={plan.performance?.athleteReflection?.whatFeltGood ?? ""} placeholder="What felt good?" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <input name="whatFeltHard" defaultValue={plan.performance?.athleteReflection?.whatFeltHard ?? ""} placeholder="What felt difficult?" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <textarea name="athleteNote" defaultValue={plan.performance?.athleteReflection?.athleteNote ?? ""} placeholder="Athlete note" className="min-h-16 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"/>
                              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save athlete reflection</button>
                            </form>
                            {(plan.performance?.judgeNote || plan.performance?.coachObservation || plan.performance?.athleteReflection) && (
                              <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-3 lg:grid-cols-3">
                                <div className="rounded-lg border border-[var(--border)] p-3"><p className="text-[11px] font-semibold text-[var(--muted)]">Judge</p><p className="mt-2 text-xs">{plan.performance?.judgeNote || "No judge note."}</p></div>
                                <div className="rounded-lg border border-[var(--border)] p-3"><p className="text-[11px] font-semibold text-[var(--muted)]">Coach</p><p className="mt-2 text-xs">{plan.performance?.coachObservation || "No coach observation."}</p></div>
                                <div className="rounded-lg border border-[var(--border)] p-3"><p className="text-[11px] font-semibold text-[var(--muted)]">Athlete</p><p className="mt-2 text-xs">{plan.performance?.athleteReflection?.athleteNote || plan.performance?.athleteReflection?.whatFeltGood || "No athlete comment."}</p></div>
                              </div>
                            )}
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
            {!event.entries.length && <p className="rounded-2xl border border-dashed border-[var(--border)] p-7 text-sm text-[var(--muted)]">No gymnasts entered yet.</p>}
          </div>

          <aside className="grid content-start gap-4">
            {event.status === "PLANNED" && (
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="font-semibold">Add gymnast</p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Their current verified ruleset is snapshotted at entry. Routine choices remain coach-selected.</p>
                <form action={addCompetitionEntry} className="mt-3 grid gap-3">
                  <input type="hidden" name="eventId" value={event.id}/>
                  <select name="gymnastId" required className="rounded-xl border border-[var(--border)] px-3 py-3">
                    <option value="">Choose gymnast…</option>
                    {available.map((gymnast) => <option key={gymnast.id} value={gymnast.id}>{gymnast.name}</option>)}
                  </select>
                  <input name="ageDivision" placeholder="Age division (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
                  <input name="sessionLabel" placeholder="Session / flight (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
                  <input name="squadLabel" placeholder="Squad / team (optional)" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
                  <button className="rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white">Add entry</button>
                </form>
              </article>
            )}

            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="font-semibold">Event context</p>
              <form action={updateCompetitionEvent} className="mt-3 grid gap-3">
                <input type="hidden" name="eventId" value={event.id}/>
                <input name="location" defaultValue={event.location ?? ""} placeholder="Location" className="rounded-xl border border-[var(--border)] px-3 py-3"/>
                <select name="status" defaultValue={event.status} className="rounded-xl border border-[var(--border)] px-3 py-3">
                  <option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
                </select>
                <textarea name="notes" defaultValue={event.notes ?? ""} placeholder="Event notes" className="min-h-24 rounded-xl border border-[var(--border)] px-3 py-3"/>
                <button className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save event</button>
              </form>
            </article>

            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="font-semibold">Evidence boundary</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                The pre-competition plan stays frozen as context. Recorded scores, judge notes, coach observations and athlete reflections are separate evidence streams. Differences between perspectives are prompts for review, not automatic conclusions.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
