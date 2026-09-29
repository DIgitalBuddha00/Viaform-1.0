"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const OUTCOMES = ["MADE", "MISSED", "SPOTTED", "BALK"] as const;
const ATTENDANCE = ["PRESENT", "ABSENT", "LATE"] as const;
const FEELINGS=["GREAT","GOOD","OKAY","LOW","NOT_WELL"] as const;
const CONFIDENCE=["CONFIDENT","OKAY","UNSURE","NERVOUS"] as const;
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

export async function pauseTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "IN_PROGRESS") return;
  await prisma.trainingSession.update({ where: { id: session.id }, data: { status: "PAUSED" } });
  revalidatePath("/training"); revalidatePath("/training/" + sessionId); revalidatePath("/planning/" + sessionId);
}

export async function resumeTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "PAUSED") return;
  await prisma.trainingSession.update({ where: { id: session.id }, data: { status: "IN_PROGRESS", endedAt: null } });
  revalidatePath("/training"); revalidatePath("/training/" + sessionId); revalidatePath("/planning/" + sessionId);
  redirect("/training/" + sessionId);
}

export async function finishTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || !["IN_PROGRESS","PAUSED"].includes(session.status)) return;
  await prisma.trainingSession.update({
    where: { id: session.id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });
  revalidatePath("/training");
  revalidatePath("/training/" + sessionId);
  revalidatePath("/planning/" + sessionId);
}

export async function reopenTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || session.status !== "COMPLETED") return;
  await prisma.trainingSession.update({
    where: { id: session.id },
    data: { status: "IN_PROGRESS", endedAt: null },
  });
  revalidatePath("/planning");
  revalidatePath("/planning/" + sessionId);
  revalidatePath("/training");
  revalidatePath("/training/" + sessionId);
  revalidatePath("/calendar");
  redirect("/training/" + sessionId);
}

export async function recordTrainingEvidence(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const blockId = value(data, "blockId");
  const gymnastId = value(data, "gymnastId");
  const stationId = value(data, "stationId") || null;
  const workItemId = value(data, "workItemId") || null;
  const routineElementId = value(data, "routineElementId") || null;
  const routineVaultId = value(data, "routineVaultId") || null;
  const routineCustomItemId = value(data, "routineCustomItemId") || null;
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
  if (!block || !gymnast || (block.targetGymnastId && block.targetGymnastId !== gymnastId)) return;
  const station = stationId
    ? await prisma.sessionStation.findFirst({ where: { id: stationId, blockId } })
    : null;
  if (stationId && !station) return;
  const workItem=workItemId?await prisma.sessionBlockWorkItem.findFirst({where:{id:workItemId,blockId},include:{trainingResource:true,landingResource:true}}):null;if(workItemId&&!workItem)return;if(workItem?.targetGymnastId&&workItem.targetGymnastId!==gymnastId)return;if(station?.workItemId&&workItemId!==station.workItemId)return;
  if ([routineElementId, routineVaultId, routineCustomItemId].filter(Boolean).length > 1) return;

  const routineApparatus: Record<string, string> = {
    VAULT: "VAULT",
    UNEVEN_BARS: "BARS",
    BALANCE_BEAM: "BEAM",
    FLOOR_EXERCISE: "FLOOR",
  };
  const expectedApparatus = block.apparatus ? routineApparatus[block.apparatus] : undefined;
  let verifiedRoutineElementId: string | null = null;
  let verifiedRoutineVaultId: string | null = null;
  let verifiedRoutineCustomItemId: string | null = null;
  if (routineElementId) {
    if (!expectedApparatus || expectedApparatus === "VAULT") return;
    const item = await prisma.gymnastRoutineElement.findFirst({
      where: {
        id: routineElementId,
        routine: { gymnastId, apparatus: expectedApparatus, status: "ACTIVE" },
      },
      select: { id: true },
    });
    if (!item) return;
    verifiedRoutineElementId = item.id;
  }
  if (routineVaultId) {
    if (expectedApparatus !== "VAULT") return;
    const item = await prisma.gymnastRoutineVault.findFirst({
      where: {
        id: routineVaultId,
        routine: { gymnastId, apparatus: "VAULT", status: "ACTIVE" },
      },
      select: { id: true },
    });
    if (!item) return;
    verifiedRoutineVaultId = item.id;
  }
  if (routineCustomItemId) {
    if (!expectedApparatus) return;
    const item = await prisma.gymnastRoutineCustomItem.findFirst({
      where: {
        id: routineCustomItemId,
        routine: { gymnastId, apparatus: expectedApparatus, status: "ACTIVE" },
      },
      select: { id: true },
    });
    if (!item) return;
    verifiedRoutineCustomItemId = item.id;
  }

  await prisma.trainingEvidence.create({
    data: {
      sessionId,
      blockId,
      stationId: station?.id ?? null,
      workItemId: workItem?.id ?? null,
      skillId: workItem?.skillId ?? station?.skillId ?? null,
      elementDefinitionId: workItem?.elementDefinitionId ?? null,
      vaultDefinitionId: workItem?.vaultDefinitionId ?? null,
      contextSnapshot: workItem ? JSON.stringify({trainingSurface:workItem.trainingSurface,landingSurface:workItem.landingSurface,takeoffEquipment:workItem.takeoffEquipment,trainingResource:workItem.trainingResource?.name??null,landingResource:workItem.landingResource?.name??null}) : null,
      gymnastId,
      routineElementId: verifiedRoutineElementId,
      routineVaultId: verifiedRoutineVaultId,
      routineCustomItemId: verifiedRoutineCustomItemId,
      recordedByMembershipId: context.membership.id,
      outcome,
      note,
    },
  });
  revalidatePath("/training/" + sessionId);
}

export async function decrementTrainingEvidence(data: FormData) {
  const context=await coachingContext(); const sessionId=value(data,"sessionId"),blockId=value(data,"blockId"),gymnastId=value(data,"gymnastId");
  const stationId=value(data,"stationId")||null,workItemId=value(data,"workItemId")||null,outcome=value(data,"outcome");
  if(!OUTCOMES.includes(outcome as (typeof OUTCOMES)[number]))return;
  const session=await visibleSession(sessionId,context);if(!session||session.status!=="IN_PROGRESS")return;
  const latest=await prisma.trainingEvidence.findFirst({where:{sessionId,blockId,gymnastId,stationId,workItemId,outcome},orderBy:{recordedAt:"desc"}});
  if(!latest)return;await prisma.trainingEvidence.delete({where:{id:latest.id}});revalidatePath("/training/"+sessionId);
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
  if (!session || !["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status)) return;
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

export async function setLeavingEarly(data:FormData){const context=await coachingContext(),sessionId=value(data,"sessionId"),gymnastId=value(data,"gymnastId");const session=await visibleSession(sessionId,context);if(!session||!["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status))return;const existing=await prisma.trainingAttendance.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId}}});if(existing)await prisma.trainingAttendance.update({where:{sessionId_gymnastId:{sessionId,gymnastId}},data:{leavingEarly:!existing.leavingEarly}});else await prisma.trainingAttendance.create({data:{sessionId,gymnastId,status:"NOT_RECORDED",leavingEarly:true,recordedByMembershipId:context.membership.id}});revalidatePath("/training/"+sessionId);}

export async function setLeftSession(data:FormData){const context=await coachingContext(),sessionId=value(data,"sessionId"),gymnastId=value(data,"gymnastId");const session=await visibleSession(sessionId,context);if(!session||!["IN_PROGRESS","PAUSED"].includes(session.status))return;const assigned=await prisma.trainingSessionGymnast.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId}}});if(!assigned)return;const existing=await prisma.trainingAttendance.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId}}});if(existing)await prisma.trainingAttendance.update({where:{sessionId_gymnastId:{sessionId,gymnastId}},data:{leftSessionAt:existing.leftSessionAt?null:new Date(),recordedByMembershipId:context.membership.id}});else await prisma.trainingAttendance.create({data:{sessionId,gymnastId,status:"NOT_RECORDED",leftSessionAt:new Date(),recordedByMembershipId:context.membership.id}});revalidatePath("/training/"+sessionId);}

export async function recordTrainingCheckIn(data:FormData){const context=await coachingContext(),sessionId=value(data,"sessionId"),gymnastId=value(data,"gymnastId"),blockId=value(data,"blockId")||null,feeling=value(data,"feeling")||null,confidence=value(data,"confidence")||null;const session=await visibleSession(sessionId,context);if(!session||!["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status))return;if(feeling&&!FEELINGS.includes(feeling as any))return;if(confidence&&!CONFIDENCE.includes(confidence as any))return;const assigned=await prisma.trainingSessionGymnast.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId}}});if(!assigned)return;if(blockId&&!await prisma.sessionBlock.findFirst({where:{id:blockId,sessionId}}))return;await prisma.trainingCheckIn.create({data:{sessionId,blockId,gymnastId,feeling,confidence}});revalidatePath("/training/"+sessionId);}

export async function markAllTrainingPresent(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session || !["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status)) return;

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
