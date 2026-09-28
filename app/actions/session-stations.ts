"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function coachingContext() {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  return context;
}

async function visibleBlock(sessionId: string, blockId: string, context: Awaited<ReturnType<typeof coachingContext>>) {
  return prisma.sessionBlock.findFirst({
    where: {
      id: blockId,
      sessionId,
      session: {
        organisationId: context.organisation.id,
        trainingGroup: groupScopeWhere(context.organisation.id, context.membership.id, context.access),
      },
    },
  });
}

export async function createSessionStation(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const name = value(data, "name");
  const block = await visibleBlock(sessionId, blockId, context);
  if (!block || !name) return;
  const workItemId=value(data,"workItemId")||null; if(workItemId&&!await prisma.sessionBlockWorkItem.findFirst({where:{id:workItemId,blockId}}))return;
  const last = await prisma.sessionStation.findFirst({ where: { blockId }, orderBy: { orderIndex: "desc" } });
  await prisma.sessionStation.create({
    data: {
      blockId,
      name,
      objective: value(data, "objective") || null,
      drills: value(data, "drills") || null,
      equipment: value(data, "equipment") || null,
      setup: value(data, "setup") || null,
      cues: value(data, "cues") || null,
      easierOption: value(data, "easierOption") || null,
      harderOption: value(data, "harderOption") || null,
      workItemId,
      orderIndex: (last?.orderIndex ?? -1) + 1,
    },
  }).catch(() => null);
  revalidatePath("/planning/" + sessionId);
  revalidatePath("/training/" + sessionId);
}

export async function updateSessionStation(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const stationId = value(data, "stationId");
  const name = value(data, "name");
  const block = await visibleBlock(sessionId, blockId, context);
  const station = block ? await prisma.sessionStation.findFirst({ where: { id: stationId, blockId } }) : null;
  if (!block || !station || !name) return;
  const workItemId=value(data,"workItemId")||null; if(workItemId&&!await prisma.sessionBlockWorkItem.findFirst({where:{id:workItemId,blockId}}))return;
  await prisma.sessionStation.update({
    where: { id: station.id },
    data: {
      name,
      objective: value(data, "objective") || null,
      drills: value(data, "drills") || null,
      equipment: value(data, "equipment") || null,
      setup: value(data, "setup") || null,
      cues: value(data, "cues") || null,
      easierOption: value(data, "easierOption") || null,
      harderOption: value(data, "harderOption") || null,
      workItemId,
    },
  }).catch(() => null);
  revalidatePath("/planning/" + sessionId);
  revalidatePath("/training/" + sessionId);
}

export async function deleteSessionStation(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const stationId = value(data, "stationId");
  const block = await visibleBlock(sessionId, blockId, context);
  if (!block) return;
  await prisma.sessionStation.deleteMany({ where: { id: stationId, blockId } });
  revalidatePath("/planning/" + sessionId);
  revalidatePath("/training/" + sessionId);
}
