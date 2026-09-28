import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";
import { assignGroupProgramme, clearGroupProgramme } from "@/app/actions/programmes";
import {
  createGroupScheduleSlot,
  deleteGroupScheduleSlot,
  updateGroupScheduleSlot,
} from "@/app/actions/planning";
import { assignGroupFacility, clearGroupFacility } from "@/app/actions/facilities";

export const dynamic = "force-dynamic";

const DAYS = [
  ["MONDAY", "Monday"],
  ["TUESDAY", "Tuesday"],
  ["WEDNESDAY", "Wednesday"],
  ["THURSDAY", "Thursday"],
  ["FRIDAY", "Friday"],
  ["SATURDAY", "Saturday"],
  ["SUNDAY", "Sunday"],
] as const;

function durationMinutes(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function weeklyHours(slots: Array<{ startTime: string; endTime: string }>) {
  const minutes = slots.reduce((total, slot) => total + durationMinutes(slot.startTime, slot.endTime), 0);
  const hours = minutes / 60;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export default async function GroupOverview({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const group = await prisma.trainingGroup.findFirst({
    where: { id, ...groupScopeWhere(c.organisation.id, c.membership.id, c.access) },
    include: {
      memberships: { include: { gymnast: true }, orderBy: { joinedAt: "asc" } },
      coachAssignments: { include: { membership: { include: { user: true } } } },
      programmeAssignments: { include: { programme: true, stage: true } },
      scheduleSlots: { orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }] },
      facilityPreference: { include: { location: true } },
    },
  });
  if (!group) notFound();

  const programmeContext = group.programmeAssignments[0];
  const programmes = c.access.canManageProgrammesAndMethodology
    ? await prisma.coachingProgramme.findMany({
        where: { organisationId: c.organisation.id, status: "ACTIVE" },
        include: { stages: { where: { status: "ACTIVE" }, orderBy: { orderIndex: "asc" } } },
        orderBy: { name: "asc" },
      })
    : [];
  const canManageSchedule = c.access.canManageRotations;
  const facilities = await prisma.facilityLocation.findMany({
    where: { organisationId: c.organisation.id, status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href="/groups" className="text-sm font-semibold text-[var(--muted)]">← My Groups</a>
        <p className="mt-5 text-sm font-semibold text-[var(--muted)]">Group overview</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{group.name}</h1>
            <p className="mt-3 text-[var(--muted)]">
              {group.memberships.length} gymnasts · {group.coachAssignments.length} assigned coaches
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Weekly training</p>
            <p className="mt-1 text-xl font-semibold">{weeklyHours(group.scheduleSlots)} hours</p>
          </div>
        </div>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Recurring training schedule</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                The group’s normal weekly training times. Session planning will use these slots as its calendar foundation.
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">
              {group.scheduleSlots.length} {group.scheduleSlots.length === 1 ? "slot" : "slots"}
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {group.scheduleSlots.length ? group.scheduleSlots.map((slot) => {
              const day = DAYS.find(([value]) => value === slot.dayOfWeek)?.[1] ?? slot.dayOfWeek;
              const minutes = durationMinutes(slot.startTime, slot.endTime);
              return (
                <details key={slot.id} className="rounded-xl border border-[var(--border)] px-4 py-3">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-semibold">{day}</span>
                        <span className="ml-2 text-sm text-[var(--muted)]">{slot.startTime}–{slot.endTime}</span>
                        {slot.notes && <p className="mt-1 text-sm text-[var(--muted)]">{slot.notes}</p>}
                      </div>
                      <span className="text-sm text-[var(--muted)]">{(minutes / 60).toFixed(minutes % 60 ? 1 : 0)}h</span>
                    </div>
                  </summary>
                  {canManageSchedule && (
                    <div className="mt-4 border-t border-[var(--border)] pt-4">
                      <form action={updateGroupScheduleSlot} className="grid gap-2 md:grid-cols-[150px_120px_120px_1fr_auto]">
                        <input type="hidden" name="groupId" value={group.id} />
                        <input type="hidden" name="scheduleId" value={slot.id} />
                        <select name="dayOfWeek" defaultValue={slot.dayOfWeek} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                          {DAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <input name="startTime" type="time" required defaultValue={slot.startTime} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                        <input name="endTime" type="time" required defaultValue={slot.endTime} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                        <input name="notes" defaultValue={slot.notes ?? ""} placeholder="Optional note" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                      </form>
                      <form action={deleteGroupScheduleSlot} className="mt-3">
                        <input type="hidden" name="groupId" value={group.id} />
                        <input type="hidden" name="scheduleId" value={slot.id} />
                        <button className="text-sm text-[var(--muted)]">Delete schedule slot</button>
                      </form>
                    </div>
                  )}
                </details>
              );
            }) : (
              <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                No recurring training times have been added yet.
              </p>
            )}
          </div>

          {canManageSchedule && (
            <form action={createGroupScheduleSlot} className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] p-4 md:grid-cols-[150px_120px_120px_1fr_auto]">
              <input type="hidden" name="groupId" value={group.id} />
              <select name="dayOfWeek" required className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                {DAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input name="startTime" type="time" required className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
              <input name="endTime" type="time" required className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
              <input name="notes" placeholder="Optional note" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
              <button className="rounded-lg bg-[var(--foreground)] px-3 py-2 text-sm font-semibold text-white">Add time</button>
            </form>
          )}
        </article>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Default training facility</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {group.facilityPreference?.location.name || "No default facility assigned"}
          </p>
          {canManageSchedule && (
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={assignGroupFacility} className="flex flex-wrap gap-2">
                <input type="hidden" name="groupId" value={group.id} />
                <select name="locationId" required defaultValue={group.facilityPreference?.locationId ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2">
                  <option value="">Choose facility…</option>
                  {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
                </select>
                <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Set default</button>
              </form>
              {group.facilityPreference && (
                <form action={clearGroupFacility}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Clear</button>
                </form>
              )}
              <a href="/facilities" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Manage facilities</a>
            </div>
          )}
        </article>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Programme context</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {programmeContext
              ? programmeContext.programme.name + (programmeContext.stage ? " · " + programmeContext.stage.name : "")
              : "Not yet assigned"}
          </p>
          {c.access.canManageProgrammesAndMethodology && (
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={assignGroupProgramme} className="flex flex-wrap gap-2">
                <input type="hidden" name="groupId" value={group.id} />
                <select name="programmeId" required className="rounded-lg border border-[var(--border)] px-3 py-2">
                  <option value="">Programme…</option>
                  {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="stageId" className="rounded-lg border border-[var(--border)] px-3 py-2">
                  <option value="">No stage</option>
                  {programmes.flatMap((p) => p.stages.map((s) => <option key={s.id} value={s.id}>{p.name} · {s.name}</option>))}
                </select>
                <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Assign</button>
              </form>
              {programmeContext && (
                <form action={clearGroupProgramme}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">Clear</button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Roster</h2>
            <div className="mt-4 grid gap-2">
              {group.memberships.length ? group.memberships.map((m) => (
                <a key={m.gymnastId} href={"/gymnasts/" + m.gymnastId} className="rounded-xl border border-[var(--border)] px-4 py-3 font-medium">
                  {m.gymnast.name}
                  {m.isPrimary ? <span className="ml-2 text-xs font-normal text-[var(--muted)]">Primary group</span> : null}
                </a>
              )) : <p className="text-sm text-[var(--muted)]">No gymnasts assigned.</p>}
            </div>
          </article>
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Coaching team</h2>
            <div className="mt-4 grid gap-2">
              {group.coachAssignments.length ? group.coachAssignments.map((a) => (
                <div key={a.membershipId} className="rounded-xl border border-[var(--border)] px-4 py-3">
                  {a.membership.user.displayName}
                </div>
              )) : <p className="text-sm text-[var(--muted)]">No coaches explicitly assigned. Head Coach access remains available.</p>}
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/planning" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-semibold">Planning</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {group.scheduleSlots.length
                ? `${weeklyHours(group.scheduleSlots)} weekly hours · plan training sessions`
                : "Plan training sessions for this group."}
            </p>
          </a>
          <a href="/training" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Training</h2><p className="mt-2 text-sm text-[var(--muted)]">Run live sessions and capture coaching evidence for this group.</p></a>
          <a href="/testing" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Testing</h2><p className="mt-2 text-sm text-[var(--muted)]">Open testing sessions and club-defined metrics.</p></a>
          <a href={"/progress?group=" + group.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">Progress</h2><p className="mt-2 text-sm text-[var(--muted)]">Review longitudinal evidence for gymnasts in this group.</p></a>
        </div>
      </section>
    </AppShell>
  );
}
