"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const OUTCOMES = ["MADE", "MISSED", "SPOTTED"] as const;
const ATTENDANCE = ["PRESENT", "ABSENT", "LATE"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function coachingContext() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  return context;
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

export async function startTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status === "COMPLETED") return;
  await prisma.trainingSession.update({
    where: { id: session.id },
    data: {
      status: "IN_PROGRESS",
      startedAt: session.startedAt ?? new Date(),
      endedAt: null,
    },
  });
  revalidatePath("/training");
  revalidatePath("/training/" + sessionId);
  revalidatePath("/planning/" + sessionId);
  redirect("/training/" + sessionId);
}

export async function finishTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;
  await prisma.trainingSession.update({
    where: { id: session.id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });
  revalidatePath("/training");
  revalidatePath("/training/" + sessionId);
  revalidatePath("/planning/" + sessionId);
}

export async function recordTrainingEvidence(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const gymnastId = value(data, "gymnastId");
  const stationId = value(data, "stationId") || null;
  const outcome = value(data, "outcome");
  const note = value(data, "note") || null;
  if (!OUTCOMES.includes(outcome as (typeof OUTCOMES)[number])) return;

  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;

  const [block, gymnast] = await Promise.all([
    prisma.sessionBlock.findFirst({ where: { id: blockId, sessionId } }),
    prisma.trainingSessionGymnast.findUnique({
      where: { sessionId_gymnastId: { sessionId, gymnastId } },
    }),
  ]);
  if (!block || !gymnast) return;
  const station = stationId
    ? await prisma.sessionStation.findFirst({ where: { id: stationId, blockId } })
    : null;
  if (stationId && !station) return;

  await prisma.trainingEvidence.create({
    data: {
      sessionId,
      blockId,
      stationId: station?.id ?? null,
      gymnastId,
      recordedByMembershipId: context.membership.id,
      outcome,
      note,
    },
  });
  revalidatePath("/training/" + sessionId);
}

export async function undoLastTrainingEvidence(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const gymnastId = value(data, "gymnastId");
  const stationId = value(data, "stationId") || null;
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;

  const latest = await prisma.trainingEvidence.findFirst({
    where: { sessionId, blockId, gymnastId, stationId },
    orderBy: { recordedAt: "desc" },
  });
  if (!latest) return;
  await prisma.trainingEvidence.delete({ where: { id: latest.id } });
  revalidatePath("/training/" + sessionId);
}


export async function recordTrainingAttendance(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId");
  const status = value(data, "status");
  if (!ATTENDANCE.includes(status as (typeof ATTENDANCE)[number])) return;

  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;
  const assigned = await prisma.trainingSessionGymnast.findUnique({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
  });
  if (!assigned) return;

  await prisma.trainingAttendance.upsert({
    where: { sessionId_gymnastId: { sessionId, gymnastId } },
    create: {
      sessionId,
      gymnastId,
      status,
      recordedByMembershipId: context.membership.id,
    },
    update: {
      status,
      recordedByMembershipId: context.membership.id,
      recordedAt: new Date(),
    },
  });
  revalidatePath("/training/" + sessionId);
}

export async function markAllTrainingPresent(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;

  const assigned = await prisma.trainingSessionGymnast.findMany({
    where: { sessionId },
    select: { gymnastId: true },
  });
  const now = new Date();
  await prisma.$transaction(
    assigned.map((entry) =>
      prisma.trainingAttendance.upsert({
        where: { sessionId_gymnastId: { sessionId, gymnastId: entry.gymnastId } },
        create: {
          sessionId,
          gymnastId: entry.gymnastId,
          status: "PRESENT",
          recordedByMembershipId: context.membership.id,
          recordedAt: now,
        },
        update: {
          status: "PRESENT",
          recordedByMembershipId: context.membership.id,
          recordedAt: now,
        },
      })
    )
  );
  revalidatePath("/training/" + sessionId);
}
