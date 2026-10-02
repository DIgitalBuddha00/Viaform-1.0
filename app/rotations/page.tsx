import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { ROTATION_DAYS, minutes, overlap, rotationDay, rotationVariant } from "@/app/lib/club-rotation-time";
import { createClubRotationPlan, setClubRotationPlanStatus, swapLiveClubRotations, updateClubRotationPlan, updateLiveClubRotation } from "@/app/actions/club-rotations";
import { RotationBoard } from "./rotation-board";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
const control = "min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2";
const dateValue = (date: Date) => date.toISOString().slice(0, 10);
const dateFrom = (raw?: string) => {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const value = new Date(raw + "T00:00:00.000Z");
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10) === raw ? value : null;
};

export default async function RotationsPage({ searchParams }: { searchParams: Promise<{ plan?: string; day?: string; date?: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace && !c.access.canManageRotations) redirect("/more");
  const query = await searchParams;
  const day = ROTATION_DAYS.find(d => d === query.day) ?? "MONDAY";
  const selectedDate = dateFrom(query.date) ?? new Date();
  const previewDay = rotationDay(selectedDate);
  const neededDays = day === previewDay ? [day] : [day, previewDay];
  const [plans, locations, groups, memberships] = await Promise.all([
    prisma.clubRotationPlan.findMany({ where: { organisationId: c.organisation.id }, include: {
      location: true, slots: { where: { dayOfWeek: { in: neededDays } }, include: { trainingGroup: { select: { name: true } }, trainingSpace: { select: { name: true } }, coach: { include: { user: { select: { displayName: true } } } } }, orderBy: { startTime: "asc" } },
    }, orderBy: [{ status: "asc" }, { effectiveFrom: "desc" }] }),
    prisma.facilityLocation.findMany({ where: { organisationId: c.organisation.id, status: "ACTIVE" }, include: { spaces: { where: { status: "ACTIVE" }, orderBy: [{ orderIndex: "asc" }, { name: "asc" }] } }, orderBy: { name: "asc" } }),
    prisma.trainingGroup.findMany({ where: { organisationId: c.organisation.id, status: "ACTIVE" }, include: { scheduleSlots: true }, orderBy: { name: "asc" } }),
    prisma.organisationMembership.findMany({ where: { organisationId: c.organisation.id, isActive: true }, include: { user: { select: { displayName: true } } }, orderBy: { joinedAt: "asc" } }),
  ]);
  const selected = plans.find(p => p.id === query.plan) ?? plans[0];
  const spaces = selected ? locations.find(l => l.id === selected.locationId)?.spaces ?? [] : [];
  const daySlots = selected?.slots.filter(s => s.dayOfWeek === day) ?? [];
  const daySchedules = groups.flatMap(g => g.scheduleSlots.filter(s => s.dayOfWeek === day));
  const startMinutes = Math.min(day === "SATURDAY" || day === "SUNDAY" ? 9 * 60 : 14 * 60, ...daySlots.map(s => minutes(s.startTime)), ...daySchedules.map(s => minutes(s.startTime)));
  const endMinutes = Math.max(day === "SATURDAY" || day === "SUNDAY" ? 17 * 60 : 20 * 60 + 30, ...daySlots.map(s => minutes(s.endTime)), ...daySchedules.map(s => minutes(s.endTime)));
  const clock = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const activeOnDate = plans.filter(p => p.status === "ACTIVE" && selectedDate >= p.effectiveFrom && (!p.effectiveTo || selectedDate <= p.effectiveTo));
  const preview = activeOnDate.flatMap(p => p.slots.filter(s => s.dayOfWeek === previewDay && s.variantIndex === rotationVariant(p, selectedDate)).map(s => ({ ...s, planName: p.name, locationName: p.location.name, locationId: p.locationId })));
  const liveStates = preview.length ? await prisma.clubRotationLiveState.findMany({ where: { organisationId: c.organisation.id, rotationDate: selectedDate, sourceSlotId: { in: preview.map(s=>s.id) } } }) : [];
  const liveLogs = preview.length ? await prisma.clubRotationLiveLog.findMany({ where: { organisationId: c.organisation.id, rotationDate: selectedDate, sourceSlotId: { in: preview.map(s=>s.id) } }, orderBy: { createdAt: "desc" }, take: 50 }) : [];
  const liveBySlot = new Map(liveStates.map(s=>[s.sourceSlotId,s]));
  const conflicts = new Set(preview.filter((slot, i) => preview.some((other, j) => i !== j && slot.locationId === other.locationId && overlap(slot.startTime, slot.endTime, other.startTime, other.endTime) && (
    slot.trainingGroupId === other.trainingGroupId || (slot.coachMembershipId && slot.coachMembershipId === other.coachMembershipId) || slot.trainingSpaceId === other.trainingSpaceId
  ))).map(s => s.id));

  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
    <section className="workspace-page"><a href="/more" className="workspace-back">← More</a><div className="workspace-hero"><div><p className="workspace-kicker">Club operations</p><h1>Rotations</h1><p className="workspace-meta">{plans.filter(p => p.status === "ACTIVE").length} active rotas</p></div><div className="workspace-actions"><a href="/facilities" className="workspace-button">Apparatus & spaces</a></div></div>

      {c.access.canManageRotations && locations.length > 0 && <details className="management-panel mt-6"><summary>+ Create rota</summary><form action={createClubRotationPlan} className="workspace-form-grid sm:grid-cols-2">
        <input name="name" required maxLength={100} placeholder="Rota name, e.g. Rec or WAG" className={control}/>
        <select name="locationId" required className={control}><option value="">Facility…</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <label className="grid gap-1 text-xs">Starts<input name="effectiveFrom" type="date" required className={control}/></label>
        <label className="grid gap-1 text-xs">Ends (optional)<input name="effectiveTo" type="date" className={control}/></label>
        <label className="grid gap-1 text-xs">Number of rotas<select name="variantCount" defaultValue="2" className={control}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="grid gap-1 text-xs">Change every<select name="weeksPerVariant" defaultValue="1" className={control}>{Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? "week" : "weeks"}</option>)}</select></label>
        <button className="workspace-button workspace-button-primary sm:col-span-2">Create rota</button>
      </form></details>}
      {!locations.length && <div className="empty-state mt-6">No apparatus or spaces configured. <a href="/facilities" className="font-semibold underline">Open facilities</a></div>}

      {plans.length > 0 && <><nav className="workspace-tabs" aria-label="Club rotas">{plans.map(p => <a key={p.id} href={`/rotations?plan=${p.id}&day=${day}`} className={selected?.id === p.id ? "active" : ""}>{p.name}{p.status === "ARCHIVED" ? " · archived" : ""}</a>)}</nav>
        {selected && <><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{selected.name}</h2><p className="text-sm text-[var(--muted)]">{selected.location.name} · {selected.variantCount} {selected.variantCount === 1 ? "rota" : "rotas"} · change every {selected.weeksPerVariant} {selected.weeksPerVariant === 1 ? "week" : "weeks"} · from {dateValue(selected.effectiveFrom)}{selected.effectiveTo ? " to " + dateValue(selected.effectiveTo) : ""}</p></div>
          {c.access.canManageRotations && <details className="rounded-xl border border-[var(--border)] px-3 py-2"><summary className="cursor-pointer text-sm font-semibold">Edit rota</summary><form action={updateClubRotationPlan} className="mt-3 grid gap-2 sm:grid-cols-2"><input type="hidden" name="planId" value={selected.id}/><input name="name" required defaultValue={selected.name} className={control}/><label className="grid gap-1 text-xs">Starts<input name="effectiveFrom" type="date" required defaultValue={dateValue(selected.effectiveFrom)} className={control}/></label><label className="grid gap-1 text-xs">Ends<input name="effectiveTo" type="date" defaultValue={selected.effectiveTo ? dateValue(selected.effectiveTo) : ""} className={control}/></label><label className="grid gap-1 text-xs">Rotas<select name="variantCount" defaultValue={selected.variantCount} className={control}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label><label className="grid gap-1 text-xs">Change every (weeks)<input name="weeksPerVariant" type="number" min="1" max="12" required defaultValue={selected.weeksPerVariant} className={control}/></label><button className="workspace-button">Save</button></form><form action={setClubRotationPlanStatus} className="mt-3"><input type="hidden" name="planId" value={selected.id}/><input type="hidden" name="status" value={selected.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"}/><button className="text-sm font-semibold text-[var(--muted)]">{selected.status === "ACTIVE" ? "Archive rota" : "Reactivate rota"}</button></form></details>}
        </div>
        <nav className="workspace-tabs" aria-label="Rota day">{ROTATION_DAYS.map(d => <a key={d} href={`/rotations?plan=${selected.id}&day=${d}`} className={day === d ? "active" : ""}>{d.slice(0, 3)}</a>)}</nav>
        <p className="mt-3 text-sm text-[var(--muted)]">Build each day here. A block means this group owns this apparatus/area for that time. Session Planning will inherit the applicable blocks automatically.</p><RotationBoard key={`${selected.id}:${day}`} planId={selected.id} day={day} variantCount={selected.variantCount} spaces={spaces.map(s => ({ id: s.id, name: s.name, apparatus: s.apparatus, shareable: s.shareable }))} groups={groups.map(g => ({ id: g.id, name: g.name }))} coaches={memberships.map(m => ({ id: m.id, name: m.user.displayName }))} slots={daySlots.map(s => ({ id: s.id, variantIndex: s.variantIndex, trainingSpaceId: s.trainingSpaceId, trainingGroupId: s.trainingGroupId, coachMembershipId: s.coachMembershipId, startTime: s.startTime, endTime: s.endTime, notes: s.notes }))} canManage={c.access.canManageRotations && selected.status === "ACTIVE"} start={clock(Math.floor(startMinutes / 5) * 5)} end={clock(Math.ceil(endMinutes / 5) * 5)}/>
        </>}
      </>}

      <section className="mt-8"><div className="section-heading"><h2>Club view</h2><span>{preview.length} blocks</span></div><p className="mt-2 text-sm text-[var(--muted)]">Operational changes record what actually happened without changing the planned rota. Move uses a free area; Swap exchanges two groups’ areas and records both changes.</p><form method="get" action="/rotations" className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="plan" value={selected?.id ?? ""}/><input type="hidden" name="day" value={day}/><input name="date" type="date" defaultValue={dateValue(selectedDate)} className={control}/><button className="workspace-button">Show date</button></form>
        <div className="mt-3 grid gap-3">{preview.sort((a,b) => a.startTime.localeCompare(b.startTime) || a.locationName.localeCompare(b.locationName)).map(s => {const live=liveBySlot.get(s.id);const actualSpace=live?spaces.find(x=>x.id===live.trainingSpaceId):null;return <div key={s.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong>{s.startTime}–{s.endTime} · {s.trainingSpace.name}</strong><span className="block text-sm text-[var(--muted)]">{s.trainingGroup.name} · {s.planName} · {s.locationName}{s.coach ? " · " + s.coach.user.displayName : ""}</span>{live&&<span className="mt-1 block text-sm">Actual: {live.actualStartTime||s.startTime}–{live.actualEndTime||"…"} · {actualSpace?.name??s.trainingSpace.name} · {live.status.replaceAll("_"," ")}</span>}</div>{conflicts.has(s.id) && <em>Check overlap</em>}</div>{c.access.canManageRotations&&<form action={swapLiveClubRotations} className="mt-3 flex flex-wrap gap-2"><input type="hidden" name="slotId" value={s.id}/><input type="hidden" name="rotationDate" value={dateValue(selectedDate)}/><select name="swapSlotId" required defaultValue="" className={control}><option value="" disabled>Swap with group…</option>{preview.filter(other=>other.id!==s.id&&other.locationId===s.locationId&&overlap(s.startTime,s.endTime,other.startTime,other.endTime)).map(other=><option key={other.id} value={other.id}>{other.trainingGroup.name} · {other.trainingSpace.name} · {other.startTime}–{other.endTime}</option>)}</select><input name="time" type="time" step="300" className={control}/><input name="note" placeholder="Reason for swap (optional)" className={control}/><button className="workspace-button">Swap areas</button></form>}{c.access.canManageRotations&&<form action={updateLiveClubRotation} className="mt-3 grid gap-2 sm:grid-cols-5"><input type="hidden" name="slotId" value={s.id}/><input type="hidden" name="rotationDate" value={dateValue(selectedDate)}/><select name="action" defaultValue={live?.status==="IN_PROGRESS"?"COMPLETE":"START"} className={control}><option value="START">Start</option><option value="MOVE">Move to free area</option><option value="EXTEND">Extend</option><option value="END_EARLY">Break early</option><option value="COMPLETE">Complete</option></select><select name="trainingSpaceId" defaultValue={live?.trainingSpaceId??s.trainingSpaceId} className={control}>{spaces.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><input name="time" type="time" step="300" className={control}/><input name="note" defaultValue={live?.notes??""} placeholder="Operational note" className={control}/><button className="workspace-button workspace-button-primary">Apply</button></form>}</div>})}{!preview.length && <div className="empty-state">No rotation blocks for this date.</div>}</div>
      </section>
      <section className="mt-8"><div className="section-heading"><h2>Operational history</h2><span>{liveLogs.length} changes</span></div><div className="mt-3 grid gap-2">{liveLogs.map(log=>{const source=preview.find(s=>s.id===log.sourceSlotId);const from=spaces.find(s=>s.id===log.fromSpaceId);const to=spaces.find(s=>s.id===log.toSpaceId);return <div key={log.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm"><strong>{log.action.replaceAll("_"," ")}</strong>{source&&<span> · {source.trainingGroup.name}</span>}{from&&to&&from.id!==to.id&&<span> · {from.name} → {to.name}</span>}{log.toEndTime&&<span> · until {log.toEndTime}</span>}{log.note&&<span className="block text-[var(--muted)]">{log.note}</span>}</div>})}{!liveLogs.length&&<div className="empty-state">No operational changes recorded for this date.</div>}</div></section>
    </section>
  </AppShell>;
}
