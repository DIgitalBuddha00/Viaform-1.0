"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

function validTime(time: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function timeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function rotationManager() {
  const context = await requireAuthContext();
  if (!context.access.canManageRotations) redirect("/planning?error=permission");
  return context;
}

async function visibleSession(sessionId: string, context: Awaited<ReturnType<typeof rotationManager>>) {
  return prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      organisationId: context.organisation.id,
      trainingGroup: groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
    include: { facilityAssignment: true },
  });
}

async function rotationGroupInSession(rotationGroupId: string, sessionId: string) {
  return prisma.sessionRotationGroup.findFirst({ where: { id: rotationGroupId, sessionId } });
}

async function sessionBlock(blockId: string, sessionId: string) {
  return blockId
    ? prisma.sessionBlock.findFirst({
        where: { id: blockId, sessionId },
        include: { spaceAssignment: true },
      })
    : null;
}

async function spaceForSession(trainingSpaceId: string, sessionId: string, organisationId: string) {
  if (!trainingSpaceId) return null;
  const session = await prisma.trainingSession.findFirst({
    where: { id: sessionId, organisationId },
    include: { facilityAssignment: true },
  });
  if (!session) return null;
  return prisma.trainingSpace.findFirst({
    where: {
      id: trainingSpaceId,
      status: "ACTIVE",
      location: {
        organisationId,
        status: "ACTIVE",
        ...(session.facilityAssignment ? { id: session.facilityAssignment.locationId } : {}),
      },
    },
  });
}

async function assignmentClashes(params: {
  sessionId: string;
  rotationGroupId: string;
  trainingSpaceId: string | null;
  startTime: string;
  endTime: string;
  excludeId?: string;
}) {
  const start = timeMinutes(params.startTime);
  const end = timeMinutes(params.endTime);
  const assignments = await prisma.sessionRotationAssignment.findMany({
    where: {
      sessionId: params.sessionId,
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
    },
    include: { trainingSpace: true },
  });
  return assignments.some((assignment) => {
    const overlaps = start < timeMinutes(assignment.endTime) && end > timeMinutes(assignment.startTime);
    if (!overlaps) return false;
    if (assignment.rotationGroupId === params.rotationGroupId) return true;
    if (
      params.trainingSpaceId &&
      assignment.trainingSpaceId === params.trainingSpaceId &&
      assignment.trainingSpace &&
      !assignment.trainingSpace.shareable
    ) return true;
    return false;
  });
}

async function validateRotationAssignment(params: {
  sessionId: string;
  rotationGroupId: string;
  blockId: string | null;
  trainingSpaceId: string | null;
  startTime: string;
  endTime: string;
  organisationId: string;
  excludeId?: string;
}) {
  const session = await prisma.trainingSession.findFirst({
    where: { id: params.sessionId, organisationId: params.organisationId },
    include: { facilityAssignment: true },
  });
  if (!session || !validTime(params.startTime) || !validTime(params.endTime)) return null;
  const start = timeMinutes(params.startTime);
  const end = timeMinutes(params.endTime);
  if (
    end <= start ||
    start < timeMinutes(session.startTime) ||
    end > timeMinutes(session.endTime)
  ) return null;

  const rotationGroup = await rotationGroupInSession(params.rotationGroupId, params.sessionId);
  if (!rotationGroup) return null;

  const block = params.blockId ? await sessionBlock(params.blockId, params.sessionId) : null;
  if (params.blockId && !block) return null;

  let trainingSpaceId = params.trainingSpaceId;
  if (!trainingSpaceId && block?.spaceAssignment) trainingSpaceId = block.spaceAssignment.trainingSpaceId;
  const space = trainingSpaceId
    ? await spaceForSession(trainingSpaceId, params.sessionId, params.organisationId)
    : null;
  if (trainingSpaceId && !space) return null;

  const gymnastCount = await prisma.sessionRotationGymnast.count({
    where: { sessionId: params.sessionId, rotationGroupId: params.rotationGroupId },
  });
  if (space?.capacity && gymnastCount > space.capacity) return null;

  if (await assignmentClashes({
    sessionId: params.sessionId,
    rotationGroupId: params.rotationGroupId,
    trainingSpaceId: space?.id ?? null,
    startTime: params.startTime,
    endTime: params.endTime,
    excludeId: params.excludeId,
  })) return null;

  return { blockId: block?.id ?? null, trainingSpaceId: space?.id ?? null };
}

export async function createRotationGroup(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const name = value(data, "name");
  const session = await visibleSession(sessionId, context);
  if (!session || !name) return;
  const last = await prisma.sessionRotationGroup.findFirst({
    where: { sessionId },
    orderBy: { orderIndex: "desc" },
  });
  await prisma.sessionRotationGroup.create({
    data: { sessionId, name, orderIndex: (last?.orderIndex ?? -1) + 1 },
  }).catch(() => null);
  revalidatePath("/planning/" + sessionId);
}

export async function deleteRotationGroup(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const rotationGroupId = value(data, "rotationGroupId");
  const session = await visibleSession(sessionId, context);
  const group = session ? await rotationGroupInSession(rotationGroupId, sessionId) : null;
  if (!session || !group) return;
  await prisma.sessionRotationGroup.delete({ where: { id: group.id } });
  revalidatePath("/planning/" + sessionId);
}

export async function assignGymnastToRotationGroup(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const rotationGroupId = value(data, "rotationGroupId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  const group = session ? await rotationGroupInSession(rotationGroupId, sessionId) : null;
  const sessionGymnast = session ? await prisma.trainingSessionGymnast.findUnique({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
  }) : null;
  if (!session || !group || !sessionGymnast) return;

  const spaces = await prisma.sessionRotationAssignment.findMany({
    where: { sessionId, rotationGroupId, trainingSpaceId: { not: null } },
    include: { trainingSpace: true },
  });
  const currentCount = await prisma.sessionRotationGymnast.count({ where: { sessionId, rotationGroupId } });
  if (spaces.some((assignment) => assignment.trainingSpace?.capacity && currentCount + 1 > assignment.trainingSpace.capacity)) return;

  await prisma.sessionRotationGymnast.upsert({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
    create: { sessionId, gymnastId, rotationGroupId },
    update: { rotationGroupId },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function removeGymnastFromRotationGroup(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.sessionRotationGymnast.deleteMany({ where: { sessionId, gymnastId } });
  revalidatePath("/planning/" + sessionId);
}

export async function createRotationAssignment(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const rotationGroupId = value(data, "rotationGroupId");
  const blockId = value(data, "blockId") || null;
  const trainingSpaceId = value(data, "spaceId") || null;
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const validated = await validateRotationAssignment({
    sessionId,
    rotationGroupId,
    blockId,
    trainingSpaceId,
    startTime,
    endTime,
    organisationId: context.organisation.id,
  });
  if (!validated) return;
  const last = await prisma.sessionRotationAssignment.findFirst({
    where: { sessionId, rotationGroupId },
    orderBy: { orderIndex: "desc" },
  });
  await prisma.sessionRotationAssignment.create({
    data: {
      sessionId,
      rotationGroupId,
      blockId: validated.blockId,
      trainingSpaceId: validated.trainingSpaceId,
      startTime,
      endTime,
      notes: value(data, "notes") || null,
      orderIndex: (last?.orderIndex ?? -1) + 1,
    },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function updateRotationAssignment(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const assignmentId = value(data, "assignmentId");
  const rotationGroupId = value(data, "rotationGroupId");
  const blockId = value(data, "blockId") || null;
  const trainingSpaceId = value(data, "spaceId") || null;
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  const session = await visibleSession(sessionId, context);
  const existing = session ? await prisma.sessionRotationAssignment.findFirst({ where: { id: assignmentId, sessionId } }) : null;
  if (!session || !existing) return;
  const validated = await validateRotationAssignment({
    sessionId,
    rotationGroupId,
    blockId,
    trainingSpaceId,
    startTime,
    endTime,
    organisationId: context.organisation.id,
    excludeId: assignmentId,
  });
  if (!validated) return;
  await prisma.sessionRotationAssignment.update({
    where: { id: assignmentId },
    data: {
      rotationGroupId,
      blockId: validated.blockId,
      trainingSpaceId: validated.trainingSpaceId,
      startTime,
      endTime,
      notes: value(data, "notes") || null,
    },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function deleteRotationAssignment(data: FormData) {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const assignmentId = value(data, "assignmentId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.sessionRotationAssignment.deleteMany({ where: { id: assignmentId, sessionId } });
  revalidatePath("/planning/" + sessionId);
}
