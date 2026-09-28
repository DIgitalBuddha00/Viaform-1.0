"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const APPARATUS = ["WARM_UP", "VAULT", "BARS", "BEAM", "FLOOR", "CONDITIONING", "RINGS", "POMMEL_HORSE", "PARALLEL_BARS", "HIGH_BAR", "TUMBLING", "OTHER"];

async function facilityManager() {
  const context = await requireAuthContext();
  if (!context.access.canConfigureFacilities) redirect("/facilities?error=permission");
  return context;
}

async function coachingContext() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  return context;
}

async function locationInOrganisation(id: string, organisationId: string) {
  return prisma.facilityLocation.findFirst({ where: { id, organisationId, status: "ACTIVE" } });
}

async function spaceInOrganisation(id: string, organisationId: string) {
  return prisma.trainingSpace.findFirst({
    where: { id, status: "ACTIVE", location: { organisationId, status: "ACTIVE" } },
    include: { location: true },
  });
}

async function resourceInOrganisation(id: string, organisationId: string) {
  return prisma.facilityResource.findFirst({
    where: {
      id,
      status: "ACTIVE",
      trainingSpace: { location: { organisationId, status: "ACTIVE" } },
    },
    include: { trainingSpace: { include: { location: true } } },
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

export async function createFacilityLocation(data: FormData) {
  const context = await facilityManager();
  const name = value(data, "name");
  if (!name) return;
  await prisma.facilityLocation.create({
    data: {
      organisationId: context.organisation.id,
      name,
      notes: value(data, "notes") || null,
    },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function updateFacilityLocation(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "locationId");
  const name = value(data, "name");
  const location = await locationInOrganisation(id, context.organisation.id);
  if (!location || !name) return;
  await prisma.facilityLocation.update({
    where: { id },
    data: { name, notes: value(data, "notes") || null },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function deleteFacilityLocation(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "locationId");
  const location = await locationInOrganisation(id, context.organisation.id);
  if (!location) return;
  await prisma.facilityLocation.delete({ where: { id } });
  revalidatePath("/facilities");
}

export async function createTrainingSpace(data: FormData) {
  const context = await facilityManager();
  const locationId = value(data, "locationId");
  const name = value(data, "name");
  const apparatus = value(data, "apparatus") || null;
  const capacityRaw = value(data, "capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const location = await locationInOrganisation(locationId, context.organisation.id);
  if (!location || !name || (apparatus && !APPARATUS.includes(apparatus)) || (capacity !== null && (!Number.isInteger(capacity) || capacity < 1))) return;
  const count = await prisma.trainingSpace.count({ where: { locationId } });
  await prisma.trainingSpace.create({
    data: {
      locationId,
      name,
      apparatus,
      capacity,
      shareable: value(data, "shareable") === "on",
      notes: value(data, "notes") || null,
      orderIndex: count,
    },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function updateTrainingSpace(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "spaceId");
  const name = value(data, "name");
  const apparatus = value(data, "apparatus") || null;
  const capacityRaw = value(data, "capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const space = await spaceInOrganisation(id, context.organisation.id);
  if (!space || !name || (apparatus && !APPARATUS.includes(apparatus)) || (capacity !== null && (!Number.isInteger(capacity) || capacity < 1))) return;
  await prisma.trainingSpace.update({
    where: { id },
    data: {
      name,
      apparatus,
      capacity,
      shareable: value(data, "shareable") === "on",
      notes: value(data, "notes") || null,
    },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function deleteTrainingSpace(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "spaceId");
  const space = await spaceInOrganisation(id, context.organisation.id);
  if (!space) return;
  await prisma.trainingSpace.delete({ where: { id } });
  revalidatePath("/facilities");
}

export async function createFacilityResource(data: FormData) {
  const context = await facilityManager();
  const trainingSpaceId = value(data, "spaceId");
  const name = value(data, "name");
  const category = value(data, "category") || "EQUIPMENT";
  const quantity = Number(value(data, "quantity") || "1");
  const capacity = Number(value(data, "capacity") || "1");
  const space = await spaceInOrganisation(trainingSpaceId, context.organisation.id);
  if (!space || !name || !Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(capacity) || capacity < 1) return;
  const count = await prisma.facilityResource.count({ where: { trainingSpaceId } });
  await prisma.facilityResource.create({
    data: {
      trainingSpaceId,
      name,
      category,
      quantity,
      capacity,
      setupNotes: value(data, "setupNotes") || null,
      orderIndex: count,
    },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function updateFacilityResource(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "resourceId");
  const resource = await resourceInOrganisation(id, context.organisation.id);
  const name = value(data, "name");
  const quantity = Number(value(data, "quantity") || "1");
  const capacity = Number(value(data, "capacity") || "1");
  if (!resource || !name || !Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(capacity) || capacity < 1) return;
  await prisma.facilityResource.update({
    where: { id },
    data: {
      name,
      category: value(data, "category") || "EQUIPMENT",
      quantity,
      capacity,
      availability: value(data, "availability") || "AVAILABLE",
      setupNotes: value(data, "setupNotes") || null,
    },
  }).catch(() => null);
  revalidatePath("/facilities");
}

export async function deleteFacilityResource(data: FormData) {
  const context = await facilityManager();
  const id = value(data, "resourceId");
  const resource = await resourceInOrganisation(id, context.organisation.id);
  if (!resource) return;
  await prisma.facilityResource.delete({ where: { id } });
  revalidatePath("/facilities");
}

export async function assignGroupFacility(data: FormData) {
  const context = await coachingContext();
  const trainingGroupId = value(data, "groupId");
  const locationId = value(data, "locationId");
  const group = await prisma.trainingGroup.findFirst({
    where: {
      id: trainingGroupId,
      ...groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
  });
  const location = await locationInOrganisation(locationId, context.organisation.id);
  if (!group || !location) return;
  await prisma.trainingGroupFacility.upsert({
    where: { trainingGroupId },
    create: { trainingGroupId, locationId },
    update: { locationId },
  });
  revalidatePath("/groups/" + trainingGroupId);
}

export async function clearGroupFacility(data: FormData) {
  const context = await coachingContext();
  const trainingGroupId = value(data, "groupId");
  const group = await prisma.trainingGroup.findFirst({
    where: {
      id: trainingGroupId,
      ...groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
  });
  if (!group) return;
  await prisma.trainingGroupFacility.deleteMany({ where: { trainingGroupId } });
  revalidatePath("/groups/" + trainingGroupId);
}

export async function assignSessionFacility(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const locationId = value(data, "locationId");
  const session = await visibleSession(sessionId, context);
  const location = await locationInOrganisation(locationId, context.organisation.id);
  if (!session || !location) return;
  const current = await prisma.trainingSessionFacility.findUnique({ where: { sessionId } });
  if (current && current.locationId !== locationId) {
    const blocks = await prisma.sessionBlock.findMany({ where: { sessionId }, select: { id: true } });
    const blockIds = blocks.map((block) => block.id);
    await prisma.$transaction([
      prisma.sessionBlockResource.deleteMany({ where: { blockId: { in: blockIds } } }),
      prisma.sessionBlockSpace.deleteMany({ where: { blockId: { in: blockIds } } }),
      prisma.sessionRotationAssignment.updateMany({ where: { sessionId }, data: { trainingSpaceId: null } }),
      prisma.trainingSessionFacility.update({ where: { sessionId }, data: { locationId } }),
    ]);
  } else {
    await prisma.trainingSessionFacility.upsert({
      where: { sessionId },
      create: { sessionId, locationId },
      update: { locationId },
    });
  }
  revalidatePath("/planning/" + sessionId);
}

export async function clearSessionFacility(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const blocks = await prisma.sessionBlock.findMany({ where: { sessionId }, select: { id: true } });
  const blockIds = blocks.map((block) => block.id);
  await prisma.$transaction([
    prisma.sessionBlockResource.deleteMany({ where: { blockId: { in: blockIds } } }),
    prisma.sessionBlockSpace.deleteMany({ where: { blockId: { in: blockIds } } }),
    prisma.sessionRotationAssignment.updateMany({ where: { sessionId }, data: { trainingSpaceId: null } }),
    prisma.trainingSessionFacility.deleteMany({ where: { sessionId } }),
  ]);
  revalidatePath("/planning/" + sessionId);
}

export async function assignSessionBlockSpace(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const trainingSpaceId = value(data, "spaceId");
  const session = await visibleSession(sessionId, context);
  const block = session ? await prisma.sessionBlock.findFirst({ where: { id: blockId, sessionId } }) : null;
  const space = await spaceInOrganisation(trainingSpaceId, context.organisation.id);
  if (!session || !block || !space) return;
  const sessionFacility = await prisma.trainingSessionFacility.findUnique({ where: { sessionId } });
  if (sessionFacility && sessionFacility.locationId !== space.locationId) return;
  const currentSpace = await prisma.sessionBlockSpace.findUnique({ where: { blockId } });
  if (currentSpace && currentSpace.trainingSpaceId !== trainingSpaceId) {
    await prisma.$transaction([
      prisma.sessionBlockResource.deleteMany({ where: { blockId } }),
      prisma.sessionBlockSpace.update({ where: { blockId }, data: { trainingSpaceId } }),
    ]);
  } else {
    await prisma.sessionBlockSpace.upsert({
      where: { blockId },
      create: { blockId, trainingSpaceId },
      update: { trainingSpaceId },
    });
  }
  revalidatePath("/planning/" + sessionId);
}

export async function clearSessionBlockSpace(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const block = await prisma.sessionBlock.findFirst({ where: { id: blockId, sessionId } });
  if (!block) return;
  await prisma.$transaction([
    prisma.sessionBlockResource.deleteMany({ where: { blockId } }),
    prisma.sessionBlockSpace.deleteMany({ where: { blockId } }),
  ]);
  revalidatePath("/planning/" + sessionId);
}

export async function assignSessionBlockResource(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const resourceId = value(data, "resourceId");
  const quantity = Number(value(data, "quantity") || "1");
  const session = await visibleSession(sessionId, context);
  const block = session ? await prisma.sessionBlock.findFirst({
    where: { id: blockId, sessionId },
    include: { spaceAssignment: true },
  }) : null;
  const resource = await resourceInOrganisation(resourceId, context.organisation.id);
  if (!session || !block || !resource || !Number.isInteger(quantity) || quantity < 1 || quantity > resource.quantity) return;
  if (block.spaceAssignment && block.spaceAssignment.trainingSpaceId !== resource.trainingSpaceId) return;
  await prisma.sessionBlockResource.upsert({
    where: { blockId_resourceId: { blockId, resourceId } },
    create: { blockId, resourceId, quantity },
    update: { quantity },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function removeSessionBlockResource(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const resourceId = value(data, "resourceId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.sessionBlockResource.deleteMany({ where: { blockId, resourceId, block: { sessionId } } });
  revalidatePath("/planning/" + sessionId);
}
