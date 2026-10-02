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
    include: {
      facilityAssignment: true,
      trainingGroup: { select: { name: true } },
      gymnasts: { select: { gymnastId: true } },
    },
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

  const [rotationGroup, block] = await Promise.all([
    rotationGroupInSession(params.rotationGroupId, params.sessionId),
    params.blockId ? sessionBlock(params.blockId, params.sessionId) : Promise.resolve(null),
  ]);
  if (!rotationGroup) return null;
  if (params.blockId && !block) return null;

  let trainingSpaceId = params.trainingSpaceId;
  if (!trainingSpaceId && block?.spaceAssignment) trainingSpaceId = block.spaceAssignment.trainingSpaceId;
  const space = trainingSpaceId
    ? await spaceForSession(trainingSpaceId, params.sessionId, params.organisationId)
    : null;
  if (trainingSpaceId && !space) return null;

  const [gymnastCount, clashes] = await Promise.all([
    prisma.sessionRotationGymnast.count({ where: { sessionId: params.sessionId, rotationGroupId: params.rotationGroupId } }),
    assignmentClashes({
    sessionId: params.sessionId,
    rotationGroupId: params.rotationGroupId,
    trainingSpaceId: space?.id ?? null,
    startTime: params.startTime,
    endTime: params.endTime,
    excludeId: params.excludeId,
    }),
  ]);
  if (space?.capacity && gymnastCount > space.capacity) return null;
  if (clashes) return null;

  return { blockId: block?.id ?? null, trainingSpaceId: space?.id ?? null };
}

type RotationActionResult = {
  error?: string;
  group?: { id: string; name: string };
  assignment?: {
    id: string;
    rotationGroupId: string;
    blockId: string | null;
    trainingSpaceId: string | null;
    startTime: string;
    endTime: string;
    notes: string | null;
  };
};

export async function createRotationGroup(data: FormData): Promise<RotationActionResult> {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const name = value(data, "name");
  const session = await visibleSession(sessionId, context);
  if (!session || !name || name.length > 80) return { error: "Enter a group name." };
  const last = await prisma.sessionRotationGroup.findFirst({
    where: { sessionId },
    orderBy: { orderIndex: "desc" },
  });
  const group = await prisma.sessionRotationGroup.create({
    data: { sessionId, name, orderIndex: (last?.orderIndex ?? -1) + 1 },
    select: { id: true, name: true },
  }).catch(() => null);
  if (!group) return { error: "A rotation group with that name already exists." };
  return { group };
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

export async function assignGymnastToRotationGroup(data: FormData): Promise<RotationActionResult> {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const rotationGroupId = value(data, "rotationGroupId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  const group = session ? await rotationGroupInSession(rotationGroupId, sessionId) : null;
  const sessionGymnast = session ? await prisma.trainingSessionGymnast.findUnique({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
  }) : null;
  if (!session || !group || !sessionGymnast) return { error: "Gymnast or rotation group not found." };

  const spaces = await prisma.sessionRotationAssignment.findMany({
    where: { sessionId, rotationGroupId, trainingSpaceId: { not: null } },
    include: { trainingSpace: true },
  });
  const currentCount = await prisma.sessionRotationGymnast.count({ where: { sessionId, rotationGroupId } });
  if (spaces.some((assignment) => assignment.trainingSpace?.capacity && currentCount + 1 > assignment.trainingSpace.capacity)) return { error: "That group would exceed the capacity of one of its assigned areas." };

  await prisma.sessionRotationGymnast.upsert({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
    create: { sessionId, gymnastId, rotationGroupId },
    update: { rotationGroupId },
  });
  return {};
}

export async function removeGymnastFromRotationGroup(data: FormData): Promise<RotationActionResult> {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const session = await visibleSession(sessionId, context);
  if (!session) return { error: "Session not found." };
  await prisma.sessionRotationGymnast.deleteMany({ where: { sessionId, gymnastId } });
  return {};
}

export async function createRotationAssignment(data: FormData): Promise<RotationActionResult> {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  let rotationGroupId = value(data, "rotationGroupId");
  const blockId = value(data, "blockId") || null;
  const trainingSpaceId = value(data, "spaceId") || null;
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "PLANNED") return { error: "This session can no longer be edited." };
  if (!session.facilityAssignment || !trainingSpaceId) return { error: "Choose a facility and training area first." };

  let createdGroup: { id: string; name: string } | undefined;
  if (rotationGroupId === "WHOLE_SESSION_GROUP") {
    const groupName = session.trainingGroup.name;
    const group = await prisma.sessionRotationGroup.upsert({
      where: { sessionId_name: { sessionId, name: groupName } },
      create: { sessionId, name: groupName },
      update: {},
      select: { id: true, name: true },
    });
    await prisma.$transaction(session.gymnasts.map((gymnast) => prisma.sessionRotationGymnast.upsert({
      where: { sessionId_gymnastId: { sessionId, gymnastId: gymnast.gymnastId } },
      create: { sessionId, gymnastId: gymnast.gymnastId, rotationGroupId: group.id },
      update: { rotationGroupId: group.id },
    })));
    rotationGroupId = group.id;
    createdGroup = group;
  }
  const validated = await validateRotationAssignment({
    sessionId,
    rotationGroupId,
    blockId,
    trainingSpaceId,
    startTime,
    endTime,
    organisationId: context.organisation.id,
  });
  if (!validated) return { error: "That time, group, or area conflicts with the current rotation." };
  const last = await prisma.sessionRotationAssignment.findFirst({
    where: { sessionId, rotationGroupId },
    orderBy: { orderIndex: "desc" },
  });
  const assignment = await prisma.sessionRotationAssignment.create({
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
    select: {
      id: true,
      rotationGroupId: true,
      blockId: true,
      trainingSpaceId: true,
      startTime: true,
      endTime: true,
      notes: true,
    },
  });
  return { assignment, group: createdGroup };
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

export async function deleteRotationAssignment(data: FormData): Promise<RotationActionResult> {
  const context = await rotationManager();
  const sessionId = value(data, "sessionId");
  const assignmentId = value(data, "assignmentId");
  const session = await visibleSession(sessionId, context);
  if (!session) return { error: "Session not found." };
  await prisma.sessionRotationAssignment.deleteMany({ where: { id: assignmentId, sessionId } });
  return {};
}
