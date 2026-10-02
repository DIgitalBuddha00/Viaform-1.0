import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { OverviewWidgets, type OverviewWidget } from "@/app/components/overview-widgets";
import {
  addCompetitionEntry,
  recordCompetitionAthleteReflection,
  recordCompetitionPerformance,
  removeCompetitionEntry,
  selectCompetitionRoutine,
  updateCompetitionEntryContext,
  updateCompetitionEvent,
  assignCompetitionOperationsStaff,
  removeCompetitionOperationsStaff,
  saveCompetitionAthleteOperations,
  addCompetitionOperationsSlot,
  updateCompetitionOperationsSlot,
  addCompetitionOperationsLog,
} from "@/app/actions/competitions";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { readOverviewLayout } from "@/app/lib/widget-layout";

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

  const [visibleGymnasts, routines, preference, operationsStaff, operationsAthletes, operationsSlots, operationsLog, activeMembers] = await Promise.all([
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
    prisma.membershipPresentationPreference.findUnique({ where: { membershipId: c.membership.id } }),
    prisma.competitionOperationsStaff.findMany({where:{eventId:id},orderBy:[{role:"asc"},{createdAt:"asc"}]}),
    prisma.competitionOperationsAthlete.findMany({where:{eventId:id}}),
    prisma.competitionOperationsSlot.findMany({where:{eventId:id},orderBy:[{orderIndex:"asc"},{createdAt:"asc"}]}),
    prisma.competitionOperationsLog.findMany({where:{eventId:id},orderBy:{createdAt:"desc"},take:30}),
    prisma.organisationMembership.findMany({where:{organisationId:c.organisation.id,isActive:true},include:{user:{select:{displayName:true}}},orderBy:{joinedAt:"asc"}}),
  ]);
  const entered = new Set(event.entries.map((entry) => entry.gymnastId));
  const available = visibleGymnasts.filter((gymnast) => !entered.has(gymnast.id));
  const entrantIds=event.entries.map(e=>e.gymnastId);
  const [testingCount,previousEntryCount]=await Promise.all([
    entrantIds.length?prisma.testingResult.count({where:{gymnastId:{in:entrantIds},session:{organisationId:c.organisation.id}}}):Promise.resolve(0),
    entrantIds.length?prisma.competitionEntry.count({where:{gymnastId:{in:entrantIds},event:{organisationId:c.organisation.id,id:{not:event.id}}}}):Promise.resolve(0)
  ]);
  const plans=event.entries.flatMap(e=>e.apparatusPlans),performances=plans.map(p=>p.performance).filter(Boolean),recorded=performances.filter(p=>p?.status!=="NOT_RECORDED"),reflections=performances.filter(p=>p?.athleteReflection),routineSelected=plans.filter(p=>p.routineId),missingRoutines=plans.length-routineSelected.length;
  const eventDate = event.eventDate.toISOString().slice(0, 10);
  const staffName=new Map(activeMembers.map(m=>[m.id,m.user.displayName]));
  const athleteOps=new Map(operationsAthletes.map(o=>[o.entryId,o]));

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page">
        <a href="/competitions" className="workspace-back">← Competitions</a>
        <div className="workspace-hero competition-hero"><div><p className="workspace-kicker">{event.eventType === "CONTROL" ? "Control competition" : "External competition"}</p><h1>{event.name}</h1><p className="workspace-meta">{eventDate}{event.location ? " · " + event.location : ""} · {event.entries.length} entered · {event.status}</p></div><div className="workspace-actions"><a href={"/competitions/" + event.id + "/judge"} className="workspace-button">Judge view</a><a href={"/competitions/" + event.id + "/reflection"} className="workspace-button">Athlete reflection</a></div></div>
        <div className="mt-4 flex justify-end"><a href={"/mentor?contextType=COMPETITION&contextRef="+event.id} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Ask Mentor about this competition →</a></div>{(()=>{const small=(label:string,value:string|number,href:string)=><a href={href} className="overview-data-card"><p>{label}</p><strong>{value}</strong></a>;const widgets:OverviewWidget[]=[
          {id:"SNAPSHOT",title:"Competition snapshot",category:"Competition",default:true,defaultSize:"L",small:small("Competition snapshot",event.status,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Competition snapshot</p><strong>{event.name}</strong><div><span>{eventDate}{event.location?" · "+event.location:""}</span><span>{event.entries.length} entered · {event.status}</span></div></a>},
          {id:"ENTRIES",title:"Entries",category:"People",default:true,small:small("Entries",event.entries.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Entries</p><strong>{event.entries.length} gymnasts</strong><div>{event.entries.slice(0,4).map(e=><span key={e.id}>{e.gymnast.name}</span>)}</div></a>},
          {id:"SCHEDULE",title:"Schedule",category:"Competition",default:true,small:small("Schedule",eventDate,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Schedule</p><strong>{eventDate}</strong><div>{Array.from(new Set(event.entries.map(e=>e.sessionLabel).filter(Boolean))).slice(0,4).map(x=><span key={x!}>{x}</span>)}</div></a>},
          {id:"ROUTINES",title:"Routines",category:"Technical",default:true,small:small("Routines",routineSelected.length+"/"+plans.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Routines</p><strong>{routineSelected.length} of {plans.length} selected</strong><div><span>{missingRoutines} apparatus plan{missingRoutines===1?"":"s"} without a selected routine</span></div></a>},
          {id:"PREPARATION",title:"Preparation evidence",category:"Evidence",default:true,small:small("Preparation evidence",testingCount,"/testing"),medium:<a href="/testing" className="overview-data-card"><p>Preparation evidence</p><strong>{testingCount} testing results</strong><div><span>Across entered gymnasts</span></div></a>},
          {id:"RESULTS",title:"Results",category:"Evidence",default:true,small:small("Results",recorded.length+"/"+plans.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Results</p><strong>{recorded.length} recorded</strong><div><span>{plans.length-recorded.length} apparatus outcomes not recorded</span></div></a>},
          {id:"ATTENTION",title:"Worth your attention",category:"Evidence",default:true,small:small("Worth your attention",missingRoutines+(plans.length-recorded.length),"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Worth your attention</p><strong>{missingRoutines+(event.status==="COMPLETED"?plans.length-recorded.length:0)}</strong><div><span>{missingRoutines} routine selection{missingRoutines===1?"":"s"} outstanding</span>{event.status==="COMPLETED"&&<span>{plans.length-recorded.length} outcomes not recorded</span>}</div></a>},
          {id:"ACTIVITY",title:"Recent activity",category:"Evidence",default:true,small:small("Recent activity",recorded.length+" outcomes","#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Recent activity</p><strong>{recorded.length?"Competition evidence":"No outcomes recorded"}</strong><div><span>{reflections.length} athlete reflection{reflections.length===1?"":"s"}</span></div></a>},
          {id:"GROUPS",title:"Groups",category:"People",default:false,small:small("Groups",event.entries.length+" entries","/groups"),medium:<a href="/groups" className="overview-data-card"><p>Groups</p><strong>{event.entries.length} entered gymnasts</strong></a>},
          {id:"TESTING",title:"Testing",category:"Evidence",default:false,small:small("Testing",testingCount,"/testing"),medium:<a href="/testing" className="overview-data-card"><p>Testing</p><strong>{testingCount} results</strong><div><span>Across entered gymnasts</span></div></a>},
          {id:"ENTRY_STATUS",title:"Entry status",category:"Competition",default:false,small:small("Entry status",event.entries.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Entry status</p><strong>{event.entries.length} entries</strong><div>{event.entries.slice(0,4).map(e=><span key={e.id}>{e.gymnast.name} · {e.status}</span>)}</div></a>},
          {id:"APPARATUS",title:"Apparatus overview",category:"Technical",default:false,small:small("Apparatus",plans.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Apparatus overview</p><strong>{plans.length} plans</strong><div>{Object.entries(plans.reduce<Record<string,number>>((a,p)=>(a[p.apparatus]=(a[p.apparatus]??0)+1,a),{})).map(([a,n])=><span key={a}>{apparatusLabel[a]??a} · {n}</span>)}</div></a>},
          {id:"ROUTINE_CHANGES",title:"Routine changes",category:"Technical",default:false,small:small("Routine changes",missingRoutines+" open","#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Routine changes</p><strong>{missingRoutines?"Selections still open":"All plans selected"}</strong></a>},
          {id:"EVIDENCE_COVERAGE",title:"Evidence coverage",category:"Evidence",default:false,small:small("Evidence coverage",recorded.length+"/"+plans.length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Evidence coverage</p><strong>{recorded.length} of {plans.length} outcomes</strong><div><span>{reflections.length} athlete reflections</span></div></a>},
          {id:"COACH_TEAM",title:"Coach team",category:"Coaching",default:false,small:small("Coach team","Event context","#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Coach team</p><strong>Competition workspace</strong></a>},
          {id:"ATHLETE_PERSPECTIVE",title:"Athlete perspective",category:"Perspectives",default:false,small:small("Athlete perspective",reflections.length,"/competitions/"+event.id+"/reflection"),medium:<a href={"/competitions/"+event.id+"/reflection"} className="overview-data-card"><p>Athlete perspective</p><strong>{reflections.length} reflections</strong></a>},
          {id:"JUDGE_PERSPECTIVE",title:"Judge perspective",category:"Perspectives",default:false,small:small("Judge perspective",recorded.length,"/competitions/"+event.id+"/judge"),medium:<a href={"/competitions/"+event.id+"/judge"} className="overview-data-card"><p>Judge perspective</p><strong>{recorded.length} recorded outcomes</strong></a>},
          {id:"COACH_CONTEXT",title:"Coach notes / context",category:"Perspectives",default:false,small:small("Coach context",event.entries.filter(e=>e.coachNote).length,"#competition-workspace"),medium:<a href="#competition-workspace" className="overview-data-card"><p>Coach notes / context</p><strong>{event.entries.filter(e=>e.coachNote).length} entry notes</strong></a>},
          {id:"PREVIOUS",title:"Previous competitions",category:"Competition",default:false,small:small("Previous competitions",previousEntryCount,"/competitions"),medium:<a href="/competitions" className="overview-data-card"><p>Previous competitions</p><strong>{previousEntryCount} prior entries</strong><div><span>Across the current entrants</span></div></a>}
        ];return <div className="mt-7"><OverviewWidgets surface="COMPETITION" initialLayout={readOverviewLayout(preference,"COMPETITION")} widgets={widgets}/></div>})()}
        <div id="competition-workspace" className="mt-7 grid gap-4 lg:grid-cols-[1fr_340px]">
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
                          <p className="mt-1 text-xs text-[var(--muted)]">{plan.routineNameSnapshot ? "Planned · " + plan.routineNameSnapshot : "No routine selected yet"}</p>{plan.routineSnapshot && <p className="mt-1 text-[11px] text-[var(--muted)]">Frozen competition copy · later routine edits will not rewrite this selection.</p>}
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
                            <form action={recordCompetitionPerformance} className="mt-3 grid gap-2"><p className="text-[11px] text-[var(--muted)]">{event.eventType === "EXTERNAL" ? "Score source: official external result." : "Score source: observed control-competition result; kept separate from official external results."}</p>
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

          <section className="lg:col-span-2 mt-2 grid gap-5">
            <div className="section-heading"><h2>Competition operations</h2><span>Whole-event view</span></div>
            <p className="text-sm text-[var(--muted)]">Operational planning sits alongside competition evidence without changing scores, routines or athlete records.</p>
            <div className="grid gap-4 xl:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="font-semibold">Coach team & responsibilities</p><form action={assignCompetitionOperationsStaff} className="mt-3 grid gap-2 sm:grid-cols-2"><input type="hidden" name="eventId" value={event.id}/><select name="membershipId" required className="rounded-xl border border-[var(--border)] px-3 py-2"><option value="">Staff member…</option>{activeMembers.map(m=><option key={m.id} value={m.id}>{m.user.displayName}</option>)}</select><select name="role" defaultValue="COACH" className="rounded-xl border border-[var(--border)] px-3 py-2"><option value="HEAD_COACH">Head Coach</option><option value="COACH">Coach</option><option value="WARM_UP_COACH">Warm-up coach</option><option value="JUDGE">Judge</option><option value="HEAD_JUDGE">Head judge</option><option value="RECORDER">Recorder</option><option value="FLOOR_MANAGER">Floor manager</option><option value="CHOREOGRAPHER">Choreographer</option><option value="OTHER">Other</option></select><input name="notes" placeholder="Responsibility / notes" className="rounded-xl border border-[var(--border)] px-3 py-2 sm:col-span-2"/><button className="workspace-button workspace-button-primary sm:col-span-2">Assign</button></form><div className="mt-4 grid gap-2">{operationsStaff.map(s=><div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><div><strong>{staffName.get(s.membershipId)??"Staff"}</strong><span className="ml-2 text-[var(--muted)]">{s.role.replaceAll("_"," ")}{s.notes?" · "+s.notes:""}</span></div><form action={removeCompetitionOperationsStaff}><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="staffId" value={s.id}/><button className="text-xs font-semibold">Remove</button></form></div>)}</div></article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="font-semibold">Event itinerary</p><form action={addCompetitionOperationsSlot} className="mt-3 grid gap-2 sm:grid-cols-3"><input type="hidden" name="eventId" value={event.id}/><input name="label" required placeholder="Block / activity" className="rounded-xl border border-[var(--border)] px-3 py-2"/><select name="slotType" defaultValue="OTHER" className="rounded-xl border border-[var(--border)] px-3 py-2"><option value="ARRIVAL">Arrival</option><option value="WARM_UP">Warm-up</option><option value="COMPETITION">Competition</option><option value="HANDOFF">Handoff</option><option value="BREAK">Break</option><option value="OTHER">Other</option></select><input name="plannedTime" type="time" className="rounded-xl border border-[var(--border)] px-3 py-2"/><textarea name="notes" placeholder="Notes" className="rounded-xl border border-[var(--border)] px-3 py-2 sm:col-span-3"/><button className="workspace-button workspace-button-primary sm:col-span-3">Add itinerary block</button></form><div className="mt-4 grid gap-2">{operationsSlots.map(slot=><form key={slot.id} action={updateCompetitionOperationsSlot} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-4"><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="slotId" value={slot.id}/><div className="text-sm"><strong>{slot.label}</strong><span className="block text-xs text-[var(--muted)]">{slot.slotType.replaceAll("_"," ")} · planned {slot.plannedTime||"—"}</span></div><input name="actualTime" type="time" defaultValue={slot.actualTime??""} className="rounded-lg border border-[var(--border)] px-2 py-1 text-sm"/><select name="status" defaultValue={slot.status} className="rounded-lg border border-[var(--border)] px-2 py-1 text-sm"><option value="PLANNED">Planned</option><option value="READY">Ready</option><option value="IN_PROGRESS">In progress</option><option value="DELAYED">Delayed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select><button className="workspace-button">Update</button><input name="notes" defaultValue={slot.notes??""} placeholder="Change / delay note" className="rounded-lg border border-[var(--border)] px-2 py-1 text-sm sm:col-span-4"/></form>)}</div></article>
            </div>
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="font-semibold">Athlete operations</p><div className="mt-4 grid gap-3">{event.entries.map(entry=>{const o=athleteOps.get(entry.id);return <form key={entry.id} action={saveCompetitionAthleteOperations} className="grid gap-2 rounded-xl border border-[var(--border)] p-3 md:grid-cols-6"><input type="hidden" name="eventId" value={event.id}/><input type="hidden" name="entryId" value={entry.id}/><strong className="text-sm md:col-span-6">{entry.gymnast.name}</strong><label className="text-xs">Arrival<input name="arrivalTime" type="time" defaultValue={o?.arrivalTime??""} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2"/></label><label className="text-xs">Warm-up<input name="warmupTime" type="time" defaultValue={o?.warmupTime??""} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2"/></label><label className="text-xs">Compete<input name="competitionTime" type="time" defaultValue={o?.competitionTime??""} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2"/></label><select name="status" defaultValue={o?.status??"PLANNED"} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="PLANNED">Planned</option><option value="READY">Ready</option><option value="IN_PROGRESS">In progress</option><option value="DELAYED">Delayed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select><input name="handoffNote" defaultValue={o?.handoffNote??""} placeholder="Handoff" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><button className="workspace-button">Save</button><input name="operationalNote" defaultValue={o?.operationalNote??""} placeholder="Operational note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm md:col-span-6"/></form>})}</div></article>
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="font-semibold">Live event log</p><form action={addCompetitionOperationsLog} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="eventId" value={event.id}/><select name="kind" defaultValue="UPDATE" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"><option value="UPDATE">Update</option><option value="DELAY">Delay</option><option value="CHANGE">Change</option><option value="HANDOFF">Handoff</option></select><input name="message" required placeholder="What changed?" className="min-w-60 flex-1 rounded-xl border border-[var(--border)] px-3 py-2"/><button className="workspace-button workspace-button-primary">Log</button></form>{operationsLog.length>0&&<div className="mt-4 grid gap-2">{operationsLog.map(l=><div key={l.id} className="rounded-xl border border-[var(--border)] p-3 text-sm"><strong>{l.kind}</strong><span className="ml-2">{l.message}</span><small className="ml-2 text-[var(--muted)]">{l.createdAt.toISOString().slice(0,16).replace("T"," ")}</small></div>)}</div>}</article>
          </section>

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
