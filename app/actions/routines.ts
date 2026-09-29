"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext } from "@/app/lib/rulesets/context";

const APPARATUS = ["VAULT", "BARS", "BEAM", "FLOOR"] as const;
const PURPOSES = ["CURRENT", "ALTERNATIVE"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function context() {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  return c;
}

async function visibleGymnast(gymnastId: string, c: Awaited<ReturnType<typeof context>>) {
  return prisma.gymnast.findFirst({
    where: { id: gymnastId, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) },
  });
}

async function visibleRoutine(routineId: string, c: Awaited<ReturnType<typeof context>>) {
  return prisma.gymnastRoutine.findFirst({
    where: {
      id: routineId,
      gymnast: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
    },
  });
}

export async function createGymnastRoutine(data: FormData) {
  const c = await context();
  const gymnastId = value(data, "gymnastId");
  const apparatus = value(data, "apparatus");
  const purpose = value(data, "purpose") || "CURRENT";
  const gymnast = await visibleGymnast(gymnastId, c);
  if (!gymnast || !APPARATUS.includes(apparatus as (typeof APPARATUS)[number])) return;
  if (!PURPOSES.includes(purpose as (typeof PURPOSES)[number])) return;

  const rules = await getGymnastRulesContext(gymnast.id, c.organisation.id);
  const fallbackName = apparatus === "VAULT" ? "Current vault plan" : "Current " + apparatus.toLowerCase() + " routine";
  const routine = await prisma.gymnastRoutine.create({
    data: {
      gymnastId: gymnast.id,
      apparatus,
      name: value(data, "name") || fallbackName,
      purpose,
      rulesetProgramCode: rules?.program.code ?? null,
      rulesetProgramName: rules?.program.name ?? null,
      rulesetLevelCode: rules?.level.code ?? null,
      rulesetLevelName: rules?.level.name ?? null,
      rulesetPackageCode: rules?.package.code ?? null,
      rulesetVersionLabel: rules?.package.versionLabel ?? null,
    },
  }).catch(() => null);
  if (!routine) return;
  revalidatePath("/gymnasts/" + gymnast.id);
  revalidatePath("/gymnasts/" + gymnast.id + "/routines");
  redirect("/gymnasts/" + gymnast.id + "/routines/" + routine.id);
}

export async function updateRoutineContext(data: FormData) {
  const c = await context();
  const routineId = value(data, "routineId");
  const routine = await visibleRoutine(routineId, c);
  if (!routine) return;
  const purpose = value(data, "purpose") || routine.purpose;
  if (!PURPOSES.includes(purpose as (typeof PURPOSES)[number])) return;

  await prisma.gymnastRoutine.update({
    where: { id: routine.id },
    data: {
      name: value(data, "name") || routine.name,
      purpose,
      strategyNote: value(data, "strategyNote") || null,
      pathwayNote: value(data, "pathwayNote") || null,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines");
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function archiveGymnastRoutine(data: FormData) {
  const c = await context();
  const routineId = value(data, "routineId");
  const routine = await visibleRoutine(routineId, c);
  if (!routine || routine.status !== "ACTIVE") return;
  await prisma.gymnastRoutine.update({ where: { id: routine.id }, data: { status: "ARCHIVED" } });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines");
  redirect("/gymnasts/" + routine.gymnastId + "/routines");
}

const RECOGNITION = ["RECOGNISED", "NOT_RECOGNISED", "UNKNOWN"] as const;

export async function addRoutineElement(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus === "VAULT" || !routine.rulesetPackageCode) return;
  const definition = await prisma.figElementDefinition.findFirst({
    where: {
      id: value(data, "elementDefinitionId"),
      apparatus: routine.apparatus,
      verificationStatus: "VERIFIED",
      status: "ACTIVE",
      package: { code: routine.rulesetPackageCode, status: "ACTIVE" },
    },
  });
  if (!definition) return;
  const last = await prisma.gymnastRoutineElement.findFirst({
    where: { routineId: routine.id },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  await prisma.gymnastRoutineElement.create({
    data: {
      routineId: routine.id,
      elementDefinitionId: definition.id,
      orderIndex: (last?.orderIndex ?? -1) + 1,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function updateRoutineElement(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  const item = await prisma.gymnastRoutineElement.findFirst({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  const recognition = value(data, "recognition") || "UNKNOWN";
  if (!item || !RECOGNITION.includes(recognition as (typeof RECOGNITION)[number])) return;
  await prisma.gymnastRoutineElement.update({
    where: { id: item.id },
    data: {
      recognition,
      isDismount: value(data, "isDismount") === "true",
      coachNote: value(data, "coachNote") || null,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function removeRoutineElement(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  await prisma.gymnastRoutineElement.deleteMany({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function moveRoutineElement(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  const item = await prisma.gymnastRoutineElement.findFirst({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  if (!item) return;
  const direction = value(data, "direction");
  const other = await prisma.gymnastRoutineElement.findFirst({
    where: {
      routineId: routine.id,
      orderIndex: direction === "UP" ? { lt: item.orderIndex } : { gt: item.orderIndex },
    },
    orderBy: { orderIndex: direction === "UP" ? "desc" : "asc" },
  });
  if (!other) return;
  await prisma.$transaction([
    prisma.gymnastRoutineElement.update({ where: { id: item.id }, data: { orderIndex: -1 } }),
    prisma.gymnastRoutineElement.update({ where: { id: other.id }, data: { orderIndex: item.orderIndex } }),
    prisma.gymnastRoutineElement.update({ where: { id: item.id }, data: { orderIndex: other.orderIndex } }),
  ]);
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function addRoutineVault(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus !== "VAULT" || !routine.rulesetPackageCode) return;
  const definition = await prisma.figVaultDefinition.findFirst({
    where: {
      id: value(data, "vaultDefinitionId"),
      status: "ACTIVE",
      package: { code: routine.rulesetPackageCode, status: "ACTIVE" },
    },
  });
  if (!definition) return;
  const last = await prisma.gymnastRoutineVault.findFirst({
    where: { routineId: routine.id },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  await prisma.gymnastRoutineVault.create({
    data: {
      routineId: routine.id,
      vaultDefinitionId: definition.id,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      role: (last?.orderIndex ?? -1) < 0 ? "PRIMARY" : "SECONDARY",
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function updateRoutineVault(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  const item = await prisma.gymnastRoutineVault.findFirst({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  if (!item) return;
  const role = value(data, "role");
  if (!["PRIMARY", "SECONDARY"].includes(role)) return;
  await prisma.gymnastRoutineVault.update({
    where: { id: item.id },
    data: { role, coachNote: value(data, "coachNote") || null },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function removeRoutineVault(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  await prisma.gymnastRoutineVault.deleteMany({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}


async function routineHasCanonicalCatalogue(routine: Awaited<ReturnType<typeof visibleRoutine>>) {
  if (!routine?.rulesetPackageCode) return false;
  if (routine.apparatus === "VAULT") {
    return (await prisma.figVaultDefinition.count({
      where: { status: "ACTIVE", package: { code: routine.rulesetPackageCode, status: "ACTIVE" } },
    })) > 0;
  }
  return (await prisma.figElementDefinition.count({
    where: {
      apparatus: routine.apparatus,
      verificationStatus: "VERIFIED",
      status: "ACTIVE",
      package: { code: routine.rulesetPackageCode, status: "ACTIVE" },
    },
  })) > 0;
}

export async function addRoutineCustomItem(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  const label = value(data, "label");
  if (!routine || !label || await routineHasCanonicalCatalogue(routine)) return;
  const last = await prisma.gymnastRoutineCustomItem.findFirst({
    where: { routineId: routine.id },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  await prisma.gymnastRoutineCustomItem.create({
    data: {
      routineId: routine.id,
      label,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      role: routine.apparatus === "VAULT" ? ((last?.orderIndex ?? -1) < 0 ? "PRIMARY" : "SECONDARY") : null,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function updateRoutineCustomItem(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  const item = await prisma.gymnastRoutineCustomItem.findFirst({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  if (!item) return;
  const role = routine.apparatus === "VAULT" ? value(data, "role") : null;
  if (role && !["PRIMARY", "SECONDARY"].includes(role)) return;
  await prisma.gymnastRoutineCustomItem.update({
    where: { id: item.id },
    data: {
      label: value(data, "label") || item.label,
      role,
      coachNote: value(data, "coachNote") || null,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function removeRoutineCustomItem(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  await prisma.gymnastRoutineCustomItem.deleteMany({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function moveRoutineCustomItem(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus === "VAULT") return;
  const item = await prisma.gymnastRoutineCustomItem.findFirst({
    where: { id: value(data, "itemId"), routineId: routine.id },
  });
  if (!item) return;
  const direction = value(data, "direction");
  if (!["UP", "DOWN"].includes(direction)) return;
  const other = await prisma.gymnastRoutineCustomItem.findFirst({
    where: {
      routineId: routine.id,
      orderIndex: direction === "UP" ? { lt: item.orderIndex } : { gt: item.orderIndex },
    },
    orderBy: { orderIndex: direction === "UP" ? "desc" : "asc" },
  });
  if (!other) return;
  await prisma.$transaction([
    prisma.gymnastRoutineCustomItem.update({ where: { id: item.id }, data: { orderIndex: -1 } }),
    prisma.gymnastRoutineCustomItem.update({ where: { id: other.id }, data: { orderIndex: item.orderIndex } }),
    prisma.gymnastRoutineCustomItem.update({ where: { id: item.id }, data: { orderIndex: other.orderIndex } }),
  ]);
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}


const SECTION_TYPES: Record<string, string[]> = {
  FLOOR: ["DANCE_PASSAGE", "ACRO_LINE", "CHOREOGRAPHY", "TRANSITION", "OTHER"],
  BEAM: ["ACRO_SERIES", "DANCE_SERIES", "MIXED_SERIES", "CHOREOGRAPHY", "TRANSITION", "DISMOUNT", "OTHER"],
  BARS: ["SEQUENCE", "CONNECTION", "TRANSITION", "FLIGHT", "DISMOUNT", "OTHER"],
};

export async function addRoutineSection(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus === "VAULT") return;
  const sectionType = value(data, "sectionType") || "OTHER";
  if (!(SECTION_TYPES[routine.apparatus] ?? ["OTHER"]).includes(sectionType)) return;
  const last = await prisma.routineSection.findFirst({ where: { routineId: routine.id }, orderBy: { orderIndex: "desc" }, select: { orderIndex: true } });
  await prisma.routineSection.create({ data: {
    routineId: routine.id,
    sectionType,
    title: value(data, "title") || sectionType.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase()),
    orderIndex: (last?.orderIndex ?? -1) + 1,
  } });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function updateRoutineSection(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus === "VAULT") return;
  const section = await prisma.routineSection.findFirst({ where: { id: value(data, "sectionId"), routineId: routine.id } });
  const sectionType = value(data, "sectionType") || section?.sectionType;
  if (!section || !sectionType || !(SECTION_TYPES[routine.apparatus] ?? ["OTHER"]).includes(sectionType)) return;
  const numberOrNull = (key: string) => {
    const raw = value(data, key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };
  await prisma.routineSection.update({ where: { id: section.id }, data: {
    sectionType,
    title: value(data, "title") || section.title,
    startTimeSec: numberOrNull("startTimeSec"),
    endTimeSec: numberOrNull("endTimeSec"),
    startX: numberOrNull("startX"),
    startY: numberOrNull("startY"),
    endX: numberOrNull("endX"),
    endY: numberOrNull("endY"),
    startRail: value(data, "startRail") || null,
    endRail: value(data, "endRail") || null,
    startPosition: value(data, "startPosition") || null,
    endPosition: value(data, "endPosition") || null,
    facing: value(data, "facing") || null,
    direction: value(data, "direction") || null,
    rhythm: value(data, "rhythm") || null,
    musicCue: value(data, "musicCue") || null,
    notes: value(data, "notes") || null,
  } });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function moveRoutineSection(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  const section = await prisma.routineSection.findFirst({ where: { id: value(data, "sectionId"), routineId: routine.id } });
  const direction = value(data, "direction");
  if (!section || !["UP", "DOWN"].includes(direction)) return;
  const other = await prisma.routineSection.findFirst({
    where: { routineId: routine.id, orderIndex: direction === "UP" ? { lt: section.orderIndex } : { gt: section.orderIndex } },
    orderBy: { orderIndex: direction === "UP" ? "desc" : "asc" },
  });
  if (!other) return;
  await prisma.$transaction([
    prisma.routineSection.update({ where: { id: section.id }, data: { orderIndex: -1 } }),
    prisma.routineSection.update({ where: { id: other.id }, data: { orderIndex: section.orderIndex } }),
    prisma.routineSection.update({ where: { id: section.id }, data: { orderIndex: other.orderIndex } }),
  ]);
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function removeRoutineSection(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine) return;
  await prisma.routineSection.deleteMany({ where: { id: value(data, "sectionId"), routineId: routine.id } });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function assignRoutineItemSection(data: FormData) {
  const c = await context();
  const routine = await visibleRoutine(value(data, "routineId"), c);
  if (!routine || routine.apparatus === "VAULT") return;
  const sectionId = value(data, "sectionId") || null;
  if (sectionId && !await prisma.routineSection.findFirst({ where: { id: sectionId, routineId: routine.id } })) return;
  const itemId = value(data, "itemId");
  const itemType = value(data, "itemType");
  if (itemType === "ELEMENT") {
    await prisma.gymnastRoutineElement.updateMany({ where: { id: itemId, routineId: routine.id }, data: { sectionId } });
  } else if (itemType === "CUSTOM") {
    await prisma.gymnastRoutineCustomItem.updateMany({ where: { id: itemId, routineId: routine.id }, data: { sectionId } });
  } else return;
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}
