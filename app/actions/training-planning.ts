"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const CATEGORIES = ["WARM_UP", "APPARATUS", "PHYSICAL_PREPARATION", "CONDITIONING", "ROUTINES", "TESTING", "OTHER"] as const;
const APPARATUS = ["VAULT", "UNEVEN_BARS", "BALANCE_BEAM", "FLOOR_EXERCISE", "PHYSICAL_PREPARATION"] as const;

function validTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date + "T00:00:00.000Z"));
}

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

async function coachingContext() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  return context;
}

async function visibleGroup(groupId: string, context: Awaited<ReturnType<typeof coachingContext>>) {
  return prisma.trainingGroup.findFirst({
    where: {
      id: groupId,
      ...groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
    include: {
      programmeAssignments: { include: { programme: true, stage: true } },
      scheduleSlots: true,
      memberships: { select: { gymnastId: true } },
      facilityPreference: true,
    },
  });
}

async function visibleSession(sessionId: string, context: Awaited<ReturnType<typeof coachingContext>>) {
  return prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      organisationId: context.organisation.id,
      trainingGroup: groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
  });
}

export async function createTrainingSession(data: FormData) {
  const context = await coachingContext();
  const trainingGroupId = value(data, "groupId");
  const sessionDate = value(data, "sessionDate");
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  const scheduleSlotId = value(data, "scheduleSlotId") || null;
  const group = await visibleGroup(trainingGroupId, context);
  if (!group || !validDate(sessionDate) || !validTime(startTime) || !validTime(endTime) || minutes(endTime) <= minutes(startTime)) {
    return;
  }
  const scheduleSlot = scheduleSlotId ? group.scheduleSlots.find((slot) => slot.id === scheduleSlotId) : null;
  const programmeContext = group.programmeAssignments[0];
  const session = await prisma.trainingSession.create({
    data: {
      organisationId: context.organisation.id,
      trainingGroupId,
      scheduleSlotId: scheduleSlot?.id ?? null,
      createdByMembershipId: context.membership.id,
      sessionDate: new Date(sessionDate + "T00:00:00.000Z"),
      startTime,
      endTime,
      title: value(data, "title") || group.name + " training",
      sessionIntent: value(data, "sessionIntent") || null,
      notes: value(data, "notes") || null,
      programmeId: programmeContext?.programmeId ?? null,
      programmeStageId: programmeContext?.stageId ?? null,
      programmeNameSnapshot: programmeContext?.programme.name ?? null,
      stageNameSnapshot: programmeContext?.stage?.name ?? null,
      gymnasts: {
        create: group.memberships.map((membership) => ({
          gymnastId: membership.gymnastId,
          source: "GROUP",
        })),
      },
      facilityAssignment: group.facilityPreference
        ? { create: { locationId: group.facilityPreference.locationId } }
        : undefined,
    },
  });
  revalidatePath("/planning");
  revalidatePath("/groups/" + trainingGroupId);
  redirect("/planning/" + session.id);
}

export async function updateTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const sessionDate = value(data, "sessionDate");
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  if (!validDate(sessionDate) || !validTime(startTime) || !validTime(endTime) || minutes(endTime) <= minutes(startTime)) return;
  await prisma.trainingSession.update({
    where: { id: session.id },
    data: {
      sessionDate: new Date(sessionDate + "T00:00:00.000Z"),
      startTime,
      endTime,
      title: value(data, "title") || session.title,
      sessionIntent: value(data, "sessionIntent") || null,
      notes: value(data, "notes") || null,
    },
  });
  revalidatePath("/planning");
  revalidatePath("/planning/" + session.id);
  revalidatePath("/groups/" + session.trainingGroupId);
}

export async function deleteTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.trainingSession.delete({ where: { id: session.id } });
  revalidatePath("/planning");
  revalidatePath("/groups/" + session.trainingGroupId);
  redirect("/planning");
}

export async function createSessionBlock(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const title = value(data, "title");
  const category = value(data, "category");
  const apparatusValue = value(data, "apparatus");
  const durationRaw = value(data, "durationMin");
  const durationMin = durationRaw ? Number(durationRaw) : null;
  if (!title || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return;
  if (apparatusValue && !APPARATUS.includes(apparatusValue as (typeof APPARATUS)[number])) return;
  if (durationMin !== null && (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 480)) return;
  const last = await prisma.sessionBlock.findFirst({ where: { sessionId }, orderBy: { orderIndex: "desc" } });
  await prisma.sessionBlock.create({
    data: {
      sessionId,
      title,
      category,
      apparatus: apparatusValue || null,
      durationMin,
      groupObjective: value(data, "groupObjective") || null,
      notes: value(data, "notes") || null,
      orderIndex: (last?.orderIndex ?? -1) + 1,
    },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function updateSessionBlock(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const session = await visibleSession(sessionId, context);
  const block = session ? await prisma.sessionBlock.findFirst({ where: { id: blockId, sessionId } }) : null;
  if (!session || !block) return;
  const title = value(data, "title");
  const category = value(data, "category");
  const apparatusValue = value(data, "apparatus");
  const durationRaw = value(data, "durationMin");
  const durationMin = durationRaw ? Number(durationRaw) : null;
  if (!title || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return;
  if (apparatusValue && !APPARATUS.includes(apparatusValue as (typeof APPARATUS)[number])) return;
  if (durationMin !== null && (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 480)) return;
  await prisma.sessionBlock.update({
    where: { id: blockId },
    data: {
      title,
      category,
      apparatus: apparatusValue || null,
      durationMin,
      groupObjective: value(data, "groupObjective") || null,
      notes: value(data, "notes") || null,
    },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function deleteSessionBlock(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.sessionBlock.deleteMany({ where: { id: blockId, sessionId } });
  revalidatePath("/planning/" + sessionId);
}


export async function addGymnastToTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const gymnast = await prisma.gymnast.findFirst({
    where: {
      id: gymnastId,
      organisationId: context.organisation.id,
      groups: { some: { trainingGroupId: session.trainingGroupId } },
    },
  });
  if (!gymnast) return;
  await prisma.trainingSessionGymnast.upsert({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
    create: { sessionId, gymnastId, source: "GROUP" },
    update: {},
  });
  revalidatePath("/planning/" + sessionId);
}

export async function removeGymnastFromTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.$transaction([
    prisma.sessionRotationGymnast.deleteMany({ where: { sessionId, gymnastId } }),
    prisma.trainingSessionGymnast.deleteMany({ where: { sessionId, gymnastId } }),
  ]);
  revalidatePath("/planning/" + sessionId);
}
