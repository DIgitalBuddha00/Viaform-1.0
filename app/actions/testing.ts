"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const MODES = ["COUNTDOWN_TALLY", "STOPWATCH", "REPETITION_TALLY", "MEASUREMENT"] as const;
const DIRECTIONS = ["HIGHER", "LOWER", "COACH_INTERPRETATION"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function coachingContext() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  return context;
}

async function visibleGroup(groupId: string, context: Awaited<ReturnType<typeof coachingContext>>) {
  return prisma.trainingGroup.findFirst({
    where: { id: groupId, ...groupScopeWhere(context.organisation.id, context.membership.id, context.access) },
    include: { memberships: { select: { gymnastId: true } } },
  });
}

async function visibleTestingSession(sessionId: string, context: Awaited<ReturnType<typeof coachingContext>>) {
  return prisma.testingSession.findFirst({
    where: {
      id: sessionId,
      organisationId: context.organisation.id,
      trainingGroup: groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
  });
}

export async function createTestMetric(data: FormData) {
  const context = await coachingContext();
  const name = value(data, "name");
  const captureMode = value(data, "captureMode");
  const direction = value(data, "direction") || "COACH_INTERPRETATION";
  const durationRaw = value(data, "durationSeconds");
  const durationSeconds = durationRaw ? Number(durationRaw) : null;
  if (!name || !MODES.includes(captureMode as (typeof MODES)[number])) return;
  if (!DIRECTIONS.includes(direction as (typeof DIRECTIONS)[number])) return;
  if (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 3600)) return;
  if (captureMode === "COUNTDOWN_TALLY" && durationSeconds === null) return;

  await prisma.testMetric.create({
    data: {
      organisationId: context.organisation.id,
      name,
      category: value(data, "category") || "CUSTOM",
      apparatus: value(data, "apparatus") || null,
      description: value(data, "description") || null,
      protocol: value(data, "protocol") || null,
      captureMode,
      unit: value(data, "unit") || null,
      durationSeconds,
      direction,
    },
  }).catch(() => null);
  revalidatePath("/testing");
}


export async function updateTestMetric(data: FormData) {
  const context = await coachingContext();
  const metricId = value(data, "metricId");
  const metric = await prisma.testMetric.findFirst({
    where: { id: metricId, organisationId: context.organisation.id, status: "ACTIVE" },
  });
  if (!metric) return;

  const name = value(data, "name");
  const captureMode = value(data, "captureMode");
  const direction = value(data, "direction") || "COACH_INTERPRETATION";
  const durationRaw = value(data, "durationSeconds");
  const durationSeconds = durationRaw ? Number(durationRaw) : null;
  if (!name || !MODES.includes(captureMode as (typeof MODES)[number])) return;
  if (!DIRECTIONS.includes(direction as (typeof DIRECTIONS)[number])) return;
  if (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 3600)) return;
  if (captureMode === "COUNTDOWN_TALLY" && durationSeconds === null) return;

  await prisma.testMetric.update({
    where: { id: metric.id },
    data: {
      name,
      category: value(data, "category") || "CUSTOM",
      apparatus: value(data, "apparatus") || null,
      description: value(data, "description") || null,
      protocol: value(data, "protocol") || null,
      captureMode,
      unit: value(data, "unit") || null,
      durationSeconds,
      direction,
    },
  }).catch(() => null);
  revalidatePath("/testing");
  revalidatePath("/progress");
}

export async function archiveTestMetric(data: FormData) {
  const context = await coachingContext();
  const metricId = value(data, "metricId");
  const metric = await prisma.testMetric.findFirst({
    where: { id: metricId, organisationId: context.organisation.id, status: "ACTIVE" },
  });
  if (!metric) return;
  await prisma.testMetric.update({ where: { id: metric.id }, data: { status: "ARCHIVED" } });
  revalidatePath("/testing");
  revalidatePath("/progress");
}

export async function createTestingSession(data: FormData) {
  const context = await coachingContext();
  const trainingGroupId = value(data, "groupId");
  const testedAt = value(data, "testedAt");
  const group = await visibleGroup(trainingGroupId, context);
  if (!group || !/^\d{4}-\d{2}-\d{2}$/.test(testedAt)) return;

  const session = await prisma.testingSession.create({
    data: {
      organisationId: context.organisation.id,
      trainingGroupId,
      createdByMembershipId: context.membership.id,
      name: value(data, "name") || group.name + " testing",
      testedAt: new Date(testedAt + "T00:00:00.000Z"),
      purpose: value(data, "purpose") || null,
      conditions: value(data, "conditions") || null,
      notes: value(data, "notes") || null,
      gymnasts: { create: group.memberships.map((entry) => ({ gymnastId: entry.gymnastId })) },
    },
  });
  revalidatePath("/testing");
  redirect("/testing/" + session.id);
}

export async function recordTestingResult(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const metricId = value(data, "metricId");
  const raw = value(data, "numberValue");
  const numberValue = Number(raw);
  if (!raw || !Number.isFinite(numberValue)) return;

  const session = await visibleTestingSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;
  const [assigned, metric] = await Promise.all([
    prisma.testingSessionGymnast.findUnique({ where: { sessionId_gymnastId: { sessionId, gymnastId } } }),
    prisma.testMetric.findFirst({ where: { id: metricId, organisationId: context.organisation.id, status: "ACTIVE" } }),
  ]);
  if (!assigned || !metric) return;

  await prisma.testingResult.upsert({
    where: { sessionId_gymnastId_metricId: { sessionId, gymnastId, metricId } },
    create: {
      sessionId,
      gymnastId,
      metricId,
      recordedByMembershipId: context.membership.id,
      numberValue,
      note: value(data, "note") || null,
    },
    update: {
      numberValue,
      note: value(data, "note") || null,
      recordedByMembershipId: context.membership.id,
      recordedAt: new Date(),
    },
  });
  revalidatePath("/testing/" + sessionId);
}

export async function finishTestingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleTestingSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;
  await prisma.testingSession.update({ where: { id: session.id }, data: { status: "COMPLETED" } });
  revalidatePath("/testing");
  revalidatePath("/testing/" + sessionId);
}
