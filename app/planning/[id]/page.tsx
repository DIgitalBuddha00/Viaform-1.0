import { notFound } from "next/navigation";
import { SkillSearch } from "@/app/components/skill-search";
import { AppShell } from "@/app/components/app-shell";
import {
  addGymnastToTrainingSession,
  addSessionBlockWorkItem,
  updateSessionBlockWorkItem,
  deleteSessionBlockWorkItem,
  deleteSessionBlock,
  deleteTrainingSession,
  updateSessionBlock,
  updateTrainingSession,
  removeGymnastFromTrainingSession,
} from "@/app/actions/training-planning";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";
import { reopenTrainingSession } from "@/app/actions/live-training";
import {
  assignSessionBlockResource,
  assignSessionBlockSpace,
  assignSessionFacility,
  clearSessionBlockSpace,
  clearSessionFacility,
  removeSessionBlockResource,
} from "@/app/actions/facilities";

import {
  createSessionStation,
  deleteSessionStation,
  updateSessionStation,
} from "@/app/actions/session-stations";
import { SessionRotationEditor } from "./session-rotation-editor";
import { SessionBlockCreator } from "./session-block-creator";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  ["WARM_UP", "Warm-up"], ["COOLDOWN", "Cooldown"], ["APPARATUS", "Apparatus"], ["PHYSICAL_PREPARATION", "Physical preparation"],
  ["CONDITIONING", "Conditioning"], ["ROUTINES", "Routines"], ["TESTING", "Testing"], ["OTHER", "Other"],
] as const;
const BEHAVIOURS=[["GUIDED","Guided sequence — no evidence counters"],["EVIDENCE","Skill evidence — Made / Missed / Spotted / Balk"]] as const;
const APPARATUS = [
  ["", "No apparatus"], ["VAULT", "Vault"], ["UNEVEN_BARS", "Uneven Bars"],
  ["BALANCE_BEAM", "Balance Beam"], ["FLOOR_EXERCISE", "Floor Exercise"], ["PHYSICAL_PREPARATION", "Physical Preparation"],
] as const;
const dateValue = (date: Date) => date.toISOString().slice(0, 10);

export default async function PlannedSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const session = await prisma.trainingSession.findFirst({
    where: {
      id,
      organisationId: c.organisation.id,
      trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
    },
    include: {
      trainingGroup: { include: { memberships: { include: { gymnast: { select: { id: true, name: true } } }, orderBy: { joinedAt: "asc" } } } },
      blocks: {
        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
        include: {
          targetGymnast: { select: { name: true } },
          spaceAssignment: true,
          resourceAssignments: { include: { resource: { select: { id: true, name: true } } } },
          stations: { include: { workItem: true, skill: true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] },
          workItems: { include: { targetGymnast: { select: { name: true } }, elementDefinition: { select: { package: { select: { program: { select: { name: true } } } } } }, vaultDefinition: { select: { package: { select: { program: { select: { name: true } } } } } }, trainingPlanItem: { select: { id: true, planId: true } } }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] },
        },
      },
      gymnasts: { include: { gymnast: { select: { id: true, name: true } } }, orderBy: { assignedAt: "asc" } },
      _count: { select: { evidence: true, attendance: true } },
      facilityAssignment: { include: { location: true } },
      clubRotationPlan: true,
      rotationGroups: {
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        include: {
          gymnasts: { include: { gymnast: { select: { id: true, name: true } } }, orderBy: { assignedAt: "asc" } },
          assignments: {
            include: { block: true, trainingSpace: true },
            orderBy: [{ startTime: "asc" }, { orderIndex: "asc" }],
          },
        },
      },
    },
  });
  if (!session) notFound();

  const sessionMinutes = (() => {
    const [sh, sm] = session.startTime.split(":").map(Number);
    const [eh, em] = session.endTime.split(":").map(Number);
    return Math.max(0, eh * 60 + em - (sh * 60 + sm));
  })();
  const plannedMinutes = session.blocks.reduce((sum, block) => sum + (block.durationMin ?? 0), 0);
  const assignedIds = new Set(session.gymnasts.map((entry) => entry.gymnastId));
  const availableGymnasts = session.trainingGroup.memberships.filter((membership) => !assignedIds.has(membership.gymnastId));
  const [facilities, trainingPlans] = await Promise.all([
    prisma.facilityLocation.findMany({
      where: { organisationId: c.organisation.id, status: "ACTIVE" },
      include: {
        spaces: {
          where: { status: "ACTIVE" },
          include: { resources: { where: { status: "ACTIVE" }, orderBy: [{ orderIndex: "asc" }, { name: "asc" }] } },
          orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.trainingPlan.findMany({ where: { organisationId: c.organisation.id, trainingGroupId: session.trainingGroupId, status: "ACTIVE", startDate: { lte: session.sessionDate }, endDate: { gte: session.sessionDate } }, include: { items: { orderBy: { orderIndex: "asc" } } }, orderBy: { startDate: "desc" } }),
  ]);
  const activeFacility = session.facilityAssignment?.locationId
    ? facilities.find((facility) => facility.id === session.facilityAssignment?.locationId)
    : null;
  const availablePlanItems = trainingPlans.flatMap(plan => plan.items.map(item => ({ ...item, planName: plan.name })));

  const normalizeApparatus=(apparatus:string|null)=>{const key=(apparatus??"").trim().toUpperCase().replaceAll(" ","_");if(key==="VAULT")return "VAULT";if(key==="UNEVEN_BARS"||key==="BARS")return "BARS";if(key==="BALANCE_BEAM"||key==="BEAM")return "BEAM";if(key==="FLOOR_EXERCISE"||key==="FLOOR")return "FLOOR";return key;};
  const contextOptionsForApparatus=(apparatus:string|null)=>{const key=normalizeApparatus(apparatus);const landing=["Competition landing","Soft mat","Resi / soft landing","Pit"];if(key==="VAULT")return {training:["Vault table"],landing,takeoff:["Springboard","Soft board","Hard board","Trampette"]};if(key==="BARS")return {training:["Full bars set","Single rail","Single loop","Loop set"],landing,takeoff:[] as string[]};if(key==="BEAM")return {training:["High beam","Low beam","Floor beam"],landing,takeoff:[] as string[]};if(key==="FLOOR")return {training:["Competition floor","Tumble track","Air floor","Rod floor"],landing,takeoff:[] as string[]};return {training:[] as string[],landing:[] as string[],takeoff:[] as string[]};};

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page"><a href="/planning?view=sessions" className="workspace-back">← Sessions</a><div className="workspace-hero"><div><p className="workspace-kicker">{session.status === "COMPLETED" ? "Completed" : session.status === "IN_PROGRESS" ? "In progress" : "Planned"} · {session.trainingGroup.name}</p><h1>{session.title}</h1><p className="workspace-meta">{dateValue(session.sessionDate)} · {session.startTime}–{session.endTime}</p></div><div className="workspace-actions">
            <span className="workspace-button">{session.status}</span>
            <a href={"/training/" + session.id} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">
              {session.status === "PLANNED" ? "Open live training" : session.status === "IN_PROGRESS" ? "Return to live training" : "View training record"}
            </a>
            {session.status === "COMPLETED" && <form action={reopenTrainingSession}><input type="hidden" name="sessionId" value={session.id}/><button className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold">Reopen session</button></form>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Session time</p>
            <p className="mt-2 text-2xl font-semibold">{sessionMinutes} min</p>
          </article>
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Planned blocks</p>
            <p className="mt-2 text-2xl font-semibold">{plannedMinutes} min</p>
          </article>
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Group</p>
            <p className="mt-2 text-2xl font-semibold">{session.gymnasts.length}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">gymnasts assigned to session</p>
          </article>
        </div>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Facility</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {session.facilityAssignment?.location.name || "No facility assigned to this session"}
              </p>
            </div>
            <a href="/facilities" className="text-sm font-semibold">Facilities & equipment →</a>
          </div>
          {session.clubRotationPlan ? <p className="mt-4 text-sm font-semibold">Set by {session.clubRotationPlan.name}. Change the club rota from Rotations, not from this session.</p> : <div className="mt-4 flex flex-wrap gap-2">
            <form action={assignSessionFacility} className="flex flex-wrap gap-2">
              <input type="hidden" name="sessionId" value={session.id} />
              <select name="locationId" required defaultValue={session.facilityAssignment?.locationId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2">
                <option value="">Choose facility…</option>
                {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Assign facility</button>
            </form>
            {session.facilityAssignment && (
              <form action={clearSessionFacility}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Clear</button>
              </form>
            )}
          </div>}
        </article>

        {(session.programmeNameSnapshot || session.stageNameSnapshot) && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Programme context at planning</p>
            <p className="mt-2 font-semibold">
              {session.programmeNameSnapshot}{session.stageNameSnapshot ? " · " + session.stageNameSnapshot : ""}
            </p>
          </div>
        )}

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Session gymnasts</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                This roster is specific to the planned session. Removing someone here does not change their group membership.
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">{session.gymnasts.length} assigned</span>
          </div>
          <div className="mt-4 grid gap-2">
            {session.gymnasts.length ? session.gymnasts.map((entry) => (
              <div key={entry.gymnastId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                <a href={"/gymnasts/" + entry.gymnastId} className="font-medium hover:underline">{entry.gymnast.name}</a>
                <form action={removeGymnastFromTrainingSession}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <input type="hidden" name="gymnastId" value={entry.gymnastId} />
                  <button className="text-sm text-[var(--muted)]">Remove from session</button>
                </form>
              </div>
            )) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                No gymnasts are currently assigned to this session.
              </p>
            )}
          </div>
          {availableGymnasts.length > 0 && (
            <form action={addGymnastToTrainingSession} className="mt-4 flex flex-wrap gap-2">
              <input type="hidden" name="sessionId" value={session.id} />
              <select name="gymnastId" required className="min-w-56 rounded-lg border border-[var(--border)] px-3 py-2">
                <option value="">Add from group roster…</option>
                {availableGymnasts.map((membership) => (
                  <option key={membership.gymnastId} value={membership.gymnastId}>{membership.gymnast.name}</option>
                ))}
              </select>
              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add to session</button>
            </form>
          )}
        </article>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Session intent</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{session.sessionIntent || "No intent recorded yet."}</p>
          {session.notes && <p className="mt-3 text-sm leading-6">{session.notes}</p>}
          <details className="mt-4 border-t border-[var(--border)] pt-4">
            <summary className="cursor-pointer text-sm font-semibold">Edit session details</summary>
            <form action={updateTrainingSession} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="sessionId" value={session.id} />
              <input name="title" defaultValue={session.title} required className="rounded-xl border border-[var(--border)] px-3 py-3" />
              <input name="sessionIntent" defaultValue={session.sessionIntent ?? ""} placeholder="Session intent" className="rounded-xl border border-[var(--border)] px-3 py-3" />
              <input name="sessionDate" type="date" required disabled={Boolean(session.clubRotationPlanId)} defaultValue={dateValue(session.sessionDate)} className="rounded-xl border border-[var(--border)] px-3 py-3" />
              <div className="grid grid-cols-2 gap-2">
                <input name="startTime" type="time" required disabled={Boolean(session.clubRotationPlanId)} defaultValue={session.startTime} className="rounded-xl border border-[var(--border)] px-3 py-3" />
                <input name="endTime" type="time" required disabled={Boolean(session.clubRotationPlanId)} defaultValue={session.endTime} className="rounded-xl border border-[var(--border)] px-3 py-3" />
              </div>
              <textarea name="notes" defaultValue={session.notes ?? ""} placeholder="Planning notes" className="min-h-24 rounded-xl border border-[var(--border)] px-3 py-3 md:col-span-2" />
              <button className="rounded-xl border border-[var(--border)] px-4 py-3 font-semibold md:w-fit">Save session</button>
            </form>
          </details>
        </article>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-[var(--muted)]">Structure</p><h2 className="mt-1 text-2xl font-semibold">Training blocks</h2></div>
          <p className="text-sm text-[var(--muted)]">
            {plannedMinutes <= sessionMinutes ? sessionMinutes - plannedMinutes + " min unallocated" : plannedMinutes - sessionMinutes + " min over session time"}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {session.blocks.map((block, index) => (
            <details key={block.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Block {index + 1} · {block.category.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 font-semibold">{block.title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{block.targetGymnast?.name??"Whole group"}</p>
                    {block.groupObjective && <p className="mt-2 text-sm">{block.groupObjective}</p>}
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                    {block.apparatus ? block.apparatus.replaceAll("_", " ") + " · " : ""}{block.durationMin ? block.durationMin + " min" : "Open time"}
                  </span>
                </div>
              </summary>
              <form action={updateSessionBlock} className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4 md:grid-cols-2">
                <input type="hidden" name="sessionId" value={session.id} />
                <input type="hidden" name="blockId" value={block.id} />
                <input name="title" required defaultValue={block.title} className="rounded-lg border border-[var(--border)] px-3 py-2" />
                <select name="category" defaultValue={block.category} className="rounded-lg border border-[var(--border)] px-3 py-2">
                  {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select name="behaviour" defaultValue={block.behaviour} className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Choose block behaviour…</option>{BEHAVIOURS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select name="apparatus" defaultValue={block.apparatus ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2">
                  {APPARATUS.map(([value, label]) => <option key={value || "none"} value={value}>{label}</option>)}
                </select>
                <input name="durationMin" type="number" min="1" max="480" defaultValue={block.durationMin ?? ""} placeholder="Minutes" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                <select name="targetGymnastId" defaultValue={block.targetGymnastId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Whole group</option>{session.gymnasts.map(entry => <option key={entry.gymnastId} value={entry.gymnastId}>{entry.gymnast.name}</option>)}</select>
                <input name="groupObjective" defaultValue={block.groupObjective ?? ""} placeholder="Group objective" className="rounded-lg border border-[var(--border)] px-3 py-2 md:col-span-2" />
                <textarea name="notes" defaultValue={block.notes ?? ""} placeholder="Block notes" className="min-h-20 rounded-lg border border-[var(--border)] px-3 py-2 md:col-span-2" />
                <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Save block</button>
              </form>
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Skill work</p><p className="mt-1 text-sm text-[var(--muted)]">What will be trained in this area. Repetition targets belong to the work, not the block.</p></div><span className="text-sm text-[var(--muted)]">{block.workItems.length} items</span></div>
                <div className="mt-3 grid gap-2">{block.workItems.map(item => <details key={item.id} className="rounded-xl border border-[var(--border)] p-3"><summary className="cursor-pointer text-sm font-semibold">{item.title}{item.elementDefinition?" · "+item.elementDefinition.package.program.name:item.vaultDefinition?" · "+item.vaultDefinition.package.program.name:" · coach-authored"}{item.targetGymnast ? " · " + item.targetGymnast.name : " · whole group"}{item.targetCount ? " · target " + item.targetCount : ""}</summary><form action={updateSessionBlockWorkItem} className="mt-3 grid gap-2 md:grid-cols-2"><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={block.id}/><input type="hidden" name="workItemId" value={item.id}/><input name="title" required defaultValue={item.title} className="rounded-lg border border-[var(--border)] px-3 py-2"/><select name="targetGymnastId" defaultValue={item.targetGymnastId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Whole group</option>{session.gymnasts.map(entry => <option key={entry.gymnastId} value={entry.gymnastId}>{entry.gymnast.name}</option>)}</select><input name="targetCount" type="number" min="1" max="1000" defaultValue={item.targetCount ?? ""} placeholder="Target repetitions (optional)" className="rounded-lg border border-[var(--border)] px-3 py-2"/><input name="notes" defaultValue={item.notes ?? ""} placeholder="Drill, sequence, or coaching notes" className="rounded-lg border border-[var(--border)] px-3 py-2"/><button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Save work</button></form><form action={deleteSessionBlockWorkItem} className="mt-2"><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={block.id}/><input type="hidden" name="workItemId" value={item.id}/><button className="text-xs text-[var(--muted)]">Remove work</button></form></details>)}</div>
                {availablePlanItems.length > 0 && <form action={addSessionBlockWorkItem} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={block.id}/><select name="trainingPlanItemId" required className="min-w-64 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"><option value="">Add from training plan…</option>{availablePlanItems.map(item => <option key={item.id} value={item.id}>{item.planName} · {item.title}{item.gymnastId ? " · individual" : ""}</option>)}</select><button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add planned work</button></form>}
                <details className="mt-3 rounded-xl border border-dashed border-[var(--border)] p-3"><summary className="cursor-pointer text-sm font-semibold">Add skill / work</summary>{(()=>{const contextOptions=contextOptionsForApparatus(block.apparatus);return <form action={addSessionBlockWorkItem} className="mt-3 grid gap-2 md:grid-cols-2"><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={block.id}/><SkillSearch name="canonicalSkillId" apparatus={block.apparatus}/><input name="title" maxLength={160} placeholder="Or coach-authored skill / task" className="rounded-lg border border-[var(--border)] px-3 py-2"/><select name="targetGymnastId" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Whole group</option>{session.gymnasts.map(entry=><option key={entry.gymnastId} value={entry.gymnastId}>{entry.gymnast.name}</option>)}</select><input name="targetCount" type="number" min="1" max="1000" placeholder="Target repetitions (optional)" className="rounded-lg border border-[var(--border)] px-3 py-2"/>{block.spaceAssignment&&<select name="trainingResourceId" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Configured training equipment (optional)…</option>{(activeFacility?.spaces.find(space=>space.id===block.spaceAssignment?.trainingSpaceId)?.resources??[]).map(resource=><option key={resource.id} value={resource.id}>{resource.name}</option>)}</select>}{block.spaceAssignment&&<select name="landingResourceId" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Configured landing surface (optional)…</option>{(activeFacility?.spaces.find(space=>space.id===block.spaceAssignment?.trainingSpaceId)?.resources??[]).map(resource=><option key={resource.id} value={resource.id}>{resource.name}</option>)}</select>}<select name="trainingSurface" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Training setup / surface…</option>{(contextOptions.training).map(option=><option key={option} value={option}>{option}</option>)}</select><select name="landingSurface" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Landing surface…</option>{(contextOptions.landing).map(option=><option key={option} value={option}>{option}</option>)}</select>{(contextOptions.takeoff.length)>0&&<select name="takeoffEquipment" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Take-off equipment…</option>{contextOptions.takeoff.map(option=><option key={option} value={option}>{option}</option>)}</select>}<input name="notes" placeholder="Drill, sequence, or coaching notes" className="rounded-lg border border-[var(--border)] px-3 py-2"/><button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Add work</button></form>})()}</details>
              </div>
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Space & resources</p>
                {session.clubRotationPlan && <p className="mt-2 text-sm text-[var(--muted)]">The club rota fixes the apparatus/area and time window. Add the training work and equipment you will use inside that rotation rather than changing the space here.</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {!session.clubRotationPlan && <form action={assignSessionBlockSpace} className="flex flex-wrap gap-2">
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <select name="spaceId" required defaultValue={block.spaceAssignment?.trainingSpaceId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                      <option value="">Choose training space…</option>
                      {(activeFacility?.spaces ?? []).map((space) => (
                        <option key={space.id} value={space.id}>
                          {space.name}{space.shareable ? " · shareable" : " · exclusive"}{space.capacity ? " · cap " + space.capacity : ""}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Set space</button>
                  </form>}
                  {!session.clubRotationPlan && block.spaceAssignment && (
                    <form action={clearSessionBlockSpace}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="blockId" value={block.id} />
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Clear space</button>
                    </form>
                  )}
                </div>
                <div className="mt-3 grid gap-2">
                  {block.resourceAssignments.map((assignment) => (
                    <div key={assignment.resourceId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2">
                      <span className="text-sm">{assignment.resource.name} · qty {assignment.quantity}</span>
                      <form action={removeSessionBlockResource}>
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="resourceId" value={assignment.resourceId} />
                        <button className="text-xs text-[var(--muted)]">Remove</button>
                      </form>
                    </div>
                  ))}
                </div>
                {block.spaceAssignment && (() => {
                  const space = activeFacility?.spaces.find((candidate) => candidate.id === block.spaceAssignment?.trainingSpaceId);
                  const assigned = new Set(block.resourceAssignments.map((assignment) => assignment.resourceId));
                  const resources = (space?.resources ?? []).filter((resource) => resource.availability !== "UNAVAILABLE" && !assigned.has(resource.id));
                  return resources.length ? (
                    <form action={assignSessionBlockResource} className="mt-3 flex flex-wrap gap-2">
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="blockId" value={block.id} />
                      <select name="resourceId" required className="min-w-56 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                        <option value="">Add equipment/resource…</option>
                        {resources.map((resource) => (
                          <option key={resource.id} value={resource.id}>{resource.name} · available {resource.quantity}</option>
                        ))}
                      </select>
                      <input name="quantity" type="number" min="1" defaultValue="1" className="w-24 rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add</button>
                    </form>
                  ) : null;
                })()}
              </div>
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Circuit / stations</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Optional tasks within this block. Live evidence can be captured against a specific station.</p>
                  </div>
                  <span className="text-sm text-[var(--muted)]">{block.stations.length} stations</span>
                </div>
                <div className="mt-3 grid gap-3">
                  {block.stations.map((station, stationIndex) => (
                    <details key={station.id} className="rounded-xl border border-[var(--border)] p-3">
                      <summary className="cursor-pointer list-none">
                        <span className="font-semibold">{stationIndex + 1}. {station.name}</span>
                        {station.objective && <span className="ml-2 text-sm text-[var(--muted)]">· {station.objective}</span>}
                      </summary>
                      <form action={updateSessionStation} className="mt-3 grid gap-2 md:grid-cols-2">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="stationId" value={station.id} />
                        <input name="name" required defaultValue={station.name} placeholder="Station name" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <input name="objective" defaultValue={station.objective ?? ""} placeholder="Objective" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <textarea name="drills" defaultValue={station.drills ?? ""} placeholder="Skills / drills" className="min-h-20 rounded-lg border border-[var(--border)] px-3 py-2" />
                        <textarea name="setup" defaultValue={station.setup ?? ""} placeholder="Setup" className="min-h-20 rounded-lg border border-[var(--border)] px-3 py-2" />
                        <input name="equipment" defaultValue={station.equipment ?? ""} placeholder="Equipment" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <input name="cues" defaultValue={station.cues ?? ""} placeholder="Key coaching cues" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <input name="easierOption" defaultValue={station.easierOption ?? ""} placeholder="Easier option" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <div className="grid gap-2"><select name="stationLinkMode" defaultValue={station.skillId?"LIBRARY":station.workItemId?"SESSION":"NONE"} className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="NONE">No linked skill</option><option value="SESSION">Session skill</option><option value="LIBRARY">Find another skill</option></select><select name="workItemId" defaultValue={station.workItemId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Choose session skill…</option>{block.workItems.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><SkillSearch name="stationSkillId" apparatus={block.apparatus} initialSelection={station.skill ? { id: station.skill.id, name: station.skill.name } : null} canonicalOnly/><p className="text-xs text-[var(--muted)]">Use Session skill for today’s planned work, or Find another skill for future/developmental work.</p></div><input name="harderOption" defaultValue={station.harderOption ?? ""} placeholder="Harder option" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Save station</button>
                      </form>
                      <form action={deleteSessionStation} className="mt-2">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="stationId" value={station.id} />
                        <button className="text-sm text-[var(--muted)]">Delete station</button>
                      </form>
                    </details>
                  ))}
                </div>
                <details className="mt-3 rounded-xl border border-dashed border-[var(--border)] p-3">
                  <summary className="cursor-pointer text-sm font-semibold">Add station</summary>
                  <form action={createSessionStation} className="mt-3 grid gap-2 md:grid-cols-2">
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="blockId" value={block.id} />
                    <input name="name" required placeholder="Station name" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <input name="objective" placeholder="Objective" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <textarea name="drills" placeholder="Skills / drills" className="min-h-20 rounded-lg border border-[var(--border)] px-3 py-2" />
                    <textarea name="setup" placeholder="Setup" className="min-h-20 rounded-lg border border-[var(--border)] px-3 py-2" />
                    <input name="equipment" placeholder="Equipment" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <input name="cues" placeholder="Key coaching cues" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <input name="easierOption" placeholder="Easier option" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <div className="grid gap-2"><select name="stationLinkMode" defaultValue="NONE" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="NONE">No linked skill</option><option value="SESSION">Session skill</option><option value="LIBRARY">Find another skill</option></select><select name="workItemId" defaultValue="" className="rounded-lg border border-[var(--border)] px-3 py-2"><option value="">Choose session skill…</option>{block.workItems.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select><SkillSearch name="stationSkillId" apparatus={block.apparatus} canonicalOnly/><p className="text-xs text-[var(--muted)]">Session skills stay quick to select. Search the full apparatus library for future/developmental work.</p></div><input name="harderOption" placeholder="Harder option" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Add station</button>
                  </form>
                </details>
              </div>
              <form action={deleteSessionBlock} className="mt-3">
                <input type="hidden" name="sessionId" value={session.id} />
                <input type="hidden" name="blockId" value={block.id} />
                <button className="text-sm text-[var(--muted)]">Delete block</button>
              </form>
            </details>
          ))}
          {!session.blocks.length && (
            <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              No blocks yet. Add the first part of the session below.
            </p>
          )}
        </div>

        <SessionBlockCreator sessionId={session.id} spaces={(activeFacility?.spaces ?? []).map(space => ({ id: space.id, name: space.name, apparatus: space.apparatus }))} gymnasts={session.gymnasts.map(entry => ({ id: entry.gymnastId, name: entry.gymnast.name }))}/>

        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-xl font-semibold">Session rotation</h2><p className="mt-1 text-sm text-[var(--muted)]">{session.clubRotationPlan ? "This session follows the club rotation for this group and date. Plan the training work inside these fixed apparatus and time windows." : "No club rotation applies to this session, so you can set apparatus, areas and time ranges here."}</p></div>
            <a href="/rotations" className="text-sm font-semibold underline">Reusable club rotas</a>
          </div>
          {session.clubRotationPlan && <p className="mt-3 text-sm font-semibold">Using {session.clubRotationPlan.name} · Rota {(session.clubRotationVariant ?? 0) + 1}</p>}
          <SessionRotationEditor
            sessionId={session.id}
            trainingGroupName={session.trainingGroup.name}
            sessionStart={session.startTime}
            sessionEnd={session.endTime}
            spaces={(activeFacility?.spaces ?? []).map(space => ({ id: space.id, name: space.name }))}
            blocks={session.blocks.map(block => ({ id: block.id, name: block.title }))}
            gymnasts={session.gymnasts.map(entry => ({ id: entry.gymnastId, name: entry.gymnast.name }))}
            initialGroups={session.rotationGroups.map(group => ({ id: group.id, name: group.name, gymnastIds: group.gymnasts.map(entry => entry.gymnastId) }))}
            initialAssignments={session.rotationGroups.flatMap(group => group.assignments.map(assignment => ({ id: assignment.id, rotationGroupId: group.id, blockId: assignment.blockId, trainingSpaceId: assignment.trainingSpaceId, startTime: assignment.startTime, endTime: assignment.endTime, notes: assignment.notes })))}
            canEdit={session.status === "PLANNED" && !session.clubRotationPlanId}
          />

        </section>

        <details className="mt-8 rounded-2xl border border-[var(--border)] p-4">
          <summary className="cursor-pointer text-sm font-semibold">Remove session</summary>
          <p className="mt-2 text-sm text-[var(--muted)]">{session._count.evidence || session._count.attendance ? `Also removes ${session._count.evidence} observations and ${session._count.attendance} attendance records.` : "This session will be deleted."}</p>
          <form action={deleteTrainingSession} className="mt-3">
            <input type="hidden" name="sessionId" value={session.id} />
            <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Confirm delete</button>
          </form>
        </details>
      </section>
    </AppShell>
  );
}
