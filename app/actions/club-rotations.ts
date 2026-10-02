"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";
import { ROTATION_DAYS, minutes, monday, overlap, rotationDay, rotationVariant } from "@/app/lib/club-rotation-time";

const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value) && minutes(value) % 5 === 0;
const date = (raw: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const value = new Date(raw + "T00:00:00.000Z");
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString().slice(0, 10) === raw ? value : null;
};
const refresh = () => { revalidatePath("/rotations"); revalidatePath("/planning"); };

async function manager() {
  const c = await requireAuthContext();
  if (!c.access.canManageRotations) redirect("/more");
  return c;
}

async function plan(id: string, organisationId: string) {
  return prisma.clubRotationPlan.findFirst({ where: { id, organisationId }, include: { location: true } });
}

export async function createClubRotationPlan(data: FormData) {
  const c = await manager();
  const name = field(data, "name"), locationId = field(data, "locationId");
  const effectiveFrom = date(field(data, "effectiveFrom"));
  const effectiveTo = field(data, "effectiveTo") ? date(field(data, "effectiveTo")) : null;
  const variantCount = Number(field(data, "variantCount"));
  const weeksPerVariant = Number(field(data, "weeksPerVariant"));
  const location = await prisma.facilityLocation.findFirst({ where: { id: locationId, organisationId: c.organisation.id, status: "ACTIVE" } });
  if (!location || !name || name.length > 100 || !effectiveFrom || (field(data, "effectiveTo") && !effectiveTo) ||
    (effectiveTo && effectiveTo < effectiveFrom) || !Number.isInteger(variantCount) || variantCount < 1 || variantCount > 6 ||
    !Number.isInteger(weeksPerVariant) || weeksPerVariant < 1 || weeksPerVariant > 12) return;
  const created = await prisma.clubRotationPlan.create({ data: {
    organisationId: c.organisation.id, locationId, createdByMembershipId: c.membership.id, name,
    effectiveFrom, effectiveTo, anchorDate: monday(effectiveFrom), variantCount, weeksPerVariant,
  } });
  refresh();
  redirect("/rotations?plan=" + created.id);
}

export async function updateClubRotationPlan(data: FormData) {
  const c = await manager(), p = await plan(field(data, "planId"), c.organisation.id);
  const name = field(data, "name"), effectiveFrom = date(field(data, "effectiveFrom"));
  const effectiveTo = field(data, "effectiveTo") ? date(field(data, "effectiveTo")) : null;
  const variantCount = Number(field(data, "variantCount")), weeksPerVariant = Number(field(data, "weeksPerVariant"));
  if (!p || !name || name.length > 100 || !effectiveFrom || (field(data, "effectiveTo") && !effectiveTo) ||
    (effectiveTo && effectiveTo < effectiveFrom) || !Number.isInteger(variantCount) || variantCount < 1 || variantCount > 6 ||
    !Number.isInteger(weeksPerVariant) || weeksPerVariant < 1 || weeksPerVariant > 12) return;
  if (await prisma.clubRotationSlot.count({ where: { planId: p.id, variantIndex: { gte: variantCount } } })) return;
  await prisma.clubRotationPlan.update({ where: { id: p.id }, data: { name, effectiveFrom, effectiveTo, anchorDate: monday(effectiveFrom), variantCount, weeksPerVariant } });
  refresh();
}

export async function setClubRotationPlanStatus(data: FormData) {
  const c = await manager(), p = await plan(field(data, "planId"), c.organisation.id);
  const status = field(data, "status");
  if (!p || !["ACTIVE", "ARCHIVED"].includes(status)) return;
  await prisma.clubRotationPlan.update({ where: { id: p.id }, data: { status } });
  refresh();
}

type SlotResult = { error?: string };
async function writeSlot(data: FormData, existingId?: string): Promise<SlotResult> {
  const c = await manager(), p = await plan(field(data, "planId"), c.organisation.id);
  if (!p || p.status !== "ACTIVE") return { error: "Rota is unavailable." };
  const variantIndex = Number(field(data, "variantIndex")), dayOfWeek = field(data, "dayOfWeek");
  const trainingGroupId = field(data, "trainingGroupId"), trainingSpaceId = field(data, "trainingSpaceId");
  const coachMembershipId = field(data, "coachMembershipId") || null;
  const startTime = field(data, "startTime"), endTime = field(data, "endTime");
  if (!Number.isInteger(variantIndex) || variantIndex < 0 || variantIndex >= p.variantCount ||
    !ROTATION_DAYS.includes(dayOfWeek as typeof ROTATION_DAYS[number]) || !validTime(startTime) || !validTime(endTime) ||
    minutes(endTime) <= minutes(startTime) || minutes(endTime) - minutes(startTime) > 480) return { error: "Check the day and times." };
  const [group, space, coach] = await Promise.all([
    prisma.trainingGroup.findFirst({ where: { id: trainingGroupId, organisationId: c.organisation.id, status: "ACTIVE" } }),
    prisma.trainingSpace.findFirst({ where: { id: trainingSpaceId, locationId: p.locationId, status: "ACTIVE" } }),
    coachMembershipId ? prisma.organisationMembership.findFirst({ where: { id: coachMembershipId, organisationId: c.organisation.id, isActive: true } }) : null,
  ]);
  if (!group || !space || (coachMembershipId && !coach)) return { error: "Choose a group, apparatus, and available coach." };
  const boardSlots = await prisma.clubRotationSlot.findMany({ where: { planId: p.id, variantIndex, dayOfWeek, ...(existingId ? { id: { not: existingId } } : {}) } });
  const clash = boardSlots.find(s => overlap(startTime, endTime, s.startTime, s.endTime) && (
    s.trainingGroupId === trainingGroupId || (coachMembershipId && s.coachMembershipId === coachMembershipId) ||
    (!space.shareable && s.trainingSpaceId === space.id)
  ));
  if (clash) return { error: "This group, coach, or exclusive apparatus is already in use at that time." };
  const values = { variantIndex, dayOfWeek, trainingGroupId, trainingSpaceId, coachMembershipId, startTime, endTime, notes: field(data, "notes") || null };
  if (existingId) {
    const existing = await prisma.clubRotationSlot.findFirst({ where: { id: existingId, planId: p.id } });
    if (!existing) return { error: "Rotation block not found." };
    await prisma.clubRotationSlot.update({ where: { id: existing.id }, data: values });
  } else {
    await prisma.clubRotationSlot.create({ data: { planId: p.id, ...values } });
  }
  refresh();
  return {};
}

export async function createClubRotationSlot(data: FormData): Promise<SlotResult> { return writeSlot(data); }
export async function updateClubRotationSlot(data: FormData): Promise<SlotResult> { return writeSlot(data, field(data, "slotId")); }
export async function deleteClubRotationSlot(data: FormData): Promise<SlotResult> {
  const c = await manager(), p = await plan(field(data, "planId"), c.organisation.id);
  if (!p) return { error: "Rota not found." };
  await prisma.clubRotationSlot.deleteMany({ where: { id: field(data, "slotId"), planId: p.id } });
  refresh();
  return {};
}

export async function applyClubRotationToSession(data: FormData) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  const session = await prisma.trainingSession.findFirst({ where: {
    id: field(data, "sessionId"), organisationId: c.organisation.id, status: "PLANNED",
    trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
  }, include: { gymnasts: true, facilityAssignment: true } });
  const p = await plan(field(data, "planId"), c.organisation.id);
  if (!session || !p || p.status !== "ACTIVE" || session.sessionDate < p.effectiveFrom ||
    (p.effectiveTo && session.sessionDate > p.effectiveTo) ||
    (session.facilityAssignment && session.facilityAssignment.locationId !== p.locationId)) return;
  const variant = rotationVariant(p, session.sessionDate);
  const slots = await prisma.clubRotationSlot.findMany({ where: {
    planId: p.id, variantIndex: variant, dayOfWeek: rotationDay(session.sessionDate), trainingGroupId: session.trainingGroupId,
    startTime: { gte: session.startTime }, endTime: { lte: session.endTime },
  }, orderBy: { startTime: "asc" } });
  if (!slots.length) return;
  await prisma.$transaction(async tx => {
    await tx.sessionRotationGroup.deleteMany({ where: { sessionId: session.id } });
    const group = await tx.sessionRotationGroup.create({ data: {
      sessionId: session.id, name: "Session group", gymnasts: { create: session.gymnasts.map(g => ({ sessionId: session.id, gymnastId: g.gymnastId })) },
      assignments: { create: slots.map((slot, orderIndex) => ({ sessionId: session.id, trainingSpaceId: slot.trainingSpaceId, startTime: slot.startTime, endTime: slot.endTime, notes: slot.notes, orderIndex })) },
    } });
    await tx.trainingSession.update({ where: { id: session.id }, data: { clubRotationPlanId: p.id, clubRotationVariant: variant } });
    if (!session.facilityAssignment) await tx.trainingSessionFacility.create({ data: { sessionId: session.id, locationId: p.locationId } });
    void group;
  });
  revalidatePath("/planning/" + session.id);
  revalidatePath("/training/" + session.id);
}

export async function clearClubRotationFromSession(data: FormData) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  const session = await prisma.trainingSession.findFirst({ where: {
    id: field(data, "sessionId"), organisationId: c.organisation.id, status: "PLANNED", clubRotationPlanId: { not: null },
    trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
  } });
  if (!session) return;
  await prisma.$transaction([
    prisma.sessionRotationGroup.deleteMany({ where: { sessionId: session.id } }),
    prisma.trainingSession.update({ where: { id: session.id }, data: { clubRotationPlanId: null, clubRotationVariant: null } }),
  ]);
  revalidatePath("/planning/" + session.id);
}


const LIVE_ROTATION_STATUS=["PLANNED","IN_PROGRESS","COMPLETED","ENDED_EARLY"] as const;

export async function updateLiveClubRotation(data: FormData) {
  const c=await manager(),slotId=field(data,"slotId"),rotationDate=date(field(data,"rotationDate"));
  const slot=await prisma.clubRotationSlot.findFirst({where:{id:slotId,plan:{organisationId:c.organisation.id,status:"ACTIVE"}},include:{plan:true}});
  if(!slot||!rotationDate||rotationDate<slot.plan.effectiveFrom||(slot.plan.effectiveTo&&rotationDate>slot.plan.effectiveTo)||slot.dayOfWeek!==rotationDay(rotationDate)||slot.variantIndex!==rotationVariant(slot.plan,rotationDate))return;
  const action=field(data,"action"),current=await prisma.clubRotationLiveState.findUnique({where:{sourceSlotId_rotationDate:{sourceSlotId:slot.id,rotationDate}}});
  let status=current?.status??"PLANNED",spaceId=current?.trainingSpaceId??slot.trainingSpaceId,actualStart=current?.actualStartTime??null,actualEnd=current?.actualEndTime??null,note=field(data,"note")||current?.notes||null;
  const now=field(data,"time");
  if(now&&!validTime(now))return;
  const fromSpaceId=spaceId,fromEnd=current?.actualEndTime??slot.endTime;
  if(action==="START"){status="IN_PROGRESS";actualStart=now||slot.startTime;}
  else if(action==="MOVE"){const target=field(data,"trainingSpaceId");const space=await prisma.trainingSpace.findFirst({where:{id:target,locationId:slot.plan.locationId,status:"ACTIVE"}});if(!space)return;spaceId=space.id;if(status==="PLANNED"){status="IN_PROGRESS";actualStart=now||slot.startTime;}}
  else if(action==="EXTEND"){if(!now||minutes(now)<=minutes(actualStart||slot.startTime))return;actualEnd=now;}
  else if(action==="END_EARLY"){if(!now||minutes(now)<=minutes(actualStart||slot.startTime))return;status="ENDED_EARLY";actualEnd=now;}
  else if(action==="COMPLETE"){status="COMPLETED";actualEnd=now||actualEnd||slot.endTime;}
  else return;
  await prisma.$transaction([
    prisma.clubRotationLiveState.upsert({where:{sourceSlotId_rotationDate:{sourceSlotId:slot.id,rotationDate}},create:{organisationId:c.organisation.id,planId:slot.planId,rotationDate,sourceSlotId:slot.id,trainingGroupId:slot.trainingGroupId,trainingSpaceId:spaceId,coachMembershipId:slot.coachMembershipId,plannedStartTime:slot.startTime,plannedEndTime:slot.endTime,actualStartTime:actualStart,actualEndTime:actualEnd,status,notes:note,updatedByMembershipId:c.membership.id},update:{trainingSpaceId:spaceId,actualStartTime:actualStart,actualEndTime:actualEnd,status,notes:note,updatedByMembershipId:c.membership.id}}),
    prisma.clubRotationLiveLog.create({data:{organisationId:c.organisation.id,planId:slot.planId,rotationDate,sourceSlotId:slot.id,authorMembershipId:c.membership.id,action,fromSpaceId,toSpaceId:spaceId,fromEndTime:fromEnd,toEndTime:actualEnd,note:field(data,"note")||null}})
  ]);
  revalidatePath("/rotations");
}
