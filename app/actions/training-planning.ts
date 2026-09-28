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

function weekdayOffset(dayOfWeek: string) {
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  return days.indexOf(dayOfWeek);
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function createSessionFromGroup(params: {
  context: Awaited<ReturnType<typeof coachingContext>>;
  group: Awaited<ReturnType<typeof visibleGroup>>;
  sessionDate: Date;
  startTime: string;
  endTime: string;
  scheduleSlotId?: string | null;
  title?: string | null;
  sessionIntent?: string | null;
  notes?: string | null;
}) {
  if (!params.group) return null;
  const programmeContext = params.group.programmeAssignments[0];
  return prisma.trainingSession.create({
    data: {
      organisationId: params.context.organisation.id,
      trainingGroupId: params.group.id,
      scheduleSlotId: params.scheduleSlotId ?? null,
      createdByMembershipId: params.context.membership.id,
      sessionDate: params.sessionDate,
      startTime: params.startTime,
      endTime: params.endTime,
      title: params.title || params.group.name + " training",
      sessionIntent: params.sessionIntent || null,
      notes: params.notes || null,
      programmeId: programmeContext?.programmeId ?? null,
      programmeStageId: programmeContext?.stageId ?? null,
      programmeNameSnapshot: programmeContext?.programme.name ?? null,
      stageNameSnapshot: programmeContext?.stage?.name ?? null,
      gymnasts: {
        create: params.group.memberships.map((membership) => ({
          gymnastId: membership.gymnastId,
          source: "GROUP",
        })),
      },
      facilityAssignment: params.group.facilityPreference
        ? { create: { locationId: params.group.facilityPreference.locationId } }
        : undefined,
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
  const session = await createSessionFromGroup({
    context,
    group,
    sessionDate: new Date(sessionDate + "T00:00:00.000Z"),
    startTime,
    endTime,
    scheduleSlotId: scheduleSlot?.id ?? null,
    title: value(data, "title") || null,
    sessionIntent: value(data, "sessionIntent") || null,
    notes: value(data, "notes") || null,
  });
  if (!session) return;
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
  revalidatePath("/training");
  revalidatePath("/training/" + session.id);
  revalidatePath("/calendar");
  revalidatePath("/groups/" + session.trainingGroupId);
}

export async function deleteTrainingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  await prisma.trainingSession.delete({ where: { id: session.id } });
  revalidatePath("/planning");
  revalidatePath("/training");
  revalidatePath("/calendar");
  revalidatePath("/progress");
  revalidatePath("/groups/" + session.trainingGroupId);
  redirect("/planning?view=sessions");
}

export async function createSessionBlock(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleSession(sessionId, context);
  if (!session) return;
  const title = value(data, "title");
  const category = value(data, "category");
  let apparatusValue = value(data, "apparatus");
  const spaceId = value(data, "spaceId");
  const durationRaw = value(data, "durationMin");
  const durationMin = durationRaw ? Number(durationRaw) : null;
  const targetGymnastId = value(data, "targetGymnastId") || null;
  const space = spaceId ? await prisma.trainingSpace.findFirst({ where: { id: spaceId, status: "ACTIVE", location: { organisationId: context.organisation.id } } }) : null;
  if (spaceId && !space) return;
  if (space?.apparatus) { const mapped: Record<string, string> = { VAULT: "VAULT", BARS: "UNEVEN_BARS", BEAM: "BALANCE_BEAM", FLOOR: "FLOOR_EXERCISE", CONDITIONING: "PHYSICAL_PREPARATION" }; apparatusValue = mapped[space.apparatus] ?? ""; }
  if (!title || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return;
  if (apparatusValue && !APPARATUS.includes(apparatusValue as (typeof APPARATUS)[number])) return;
  if (durationMin !== null && (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 480)) return;
  if (targetGymnastId && !await prisma.trainingSessionGymnast.findUnique({ where: { sessionId_gymnastId: { sessionId, gymnastId: targetGymnastId } } })) return;
  const last = await prisma.sessionBlock.findFirst({ where: { sessionId }, orderBy: { orderIndex: "desc" } });
  await prisma.sessionBlock.create({
    data: {
      sessionId,
      title,
      category,
      apparatus: apparatusValue || null,
      durationMin,
      targetGymnastId,
      targetCount: null,
      groupObjective: value(data, "groupObjective") || null,
      notes: value(data, "notes") || null,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      ...(space ? { spaceAssignment: { create: { trainingSpaceId: space.id } } } : {}),
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
  const targetGymnastId = value(data, "targetGymnastId") || null;
  if (!title || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) return;
  if (apparatusValue && !APPARATUS.includes(apparatusValue as (typeof APPARATUS)[number])) return;
  if (durationMin !== null && (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 480)) return;
  if (targetGymnastId && !await prisma.trainingSessionGymnast.findUnique({ where: { sessionId_gymnastId: { sessionId, gymnastId: targetGymnastId } } })) return;
  await prisma.sessionBlock.update({
    where: { id: blockId },
    data: {
      title,
      category,
      apparatus: apparatusValue || null,
      durationMin,
      targetGymnastId,
      targetCount: null,
      groupObjective: value(data, "groupObjective") || null,
      notes: value(data, "notes") || null,
    },
  });
  revalidatePath("/planning/" + sessionId);
}

export async function addSessionBlockWorkItem(data: FormData) {
  const context = await coachingContext(); const sessionId=value(data,"sessionId"), blockId=value(data,"blockId"); const session=await visibleSession(sessionId,context); const block=session?await prisma.sessionBlock.findFirst({where:{id:blockId,sessionId}}):null; if(!session||!block)return;
  const planItemId=value(data,"trainingPlanItemId")||null; const planItem=planItemId?await prisma.trainingPlanItem.findFirst({where:{id:planItemId,plan:{organisationId:context.organisation.id,trainingGroupId:session.trainingGroupId,status:"ACTIVE",startDate:{lte:session.sessionDate},endDate:{gte:session.sessionDate}}}}):null; if(planItemId&&!planItem)return;
  const elementDefinitionId=value(data,"elementDefinitionId")||null,vaultDefinitionId=value(data,"vaultDefinitionId")||null;if(elementDefinitionId&&vaultDefinitionId)return;
  const element=elementDefinitionId?await prisma.figElementDefinition.findFirst({where:{id:elementDefinitionId,status:"ACTIVE"}}):null,vault=vaultDefinitionId?await prisma.figVaultDefinition.findFirst({where:{id:vaultDefinitionId,status:"ACTIVE"}}):null;if((elementDefinitionId&&!element)||(vaultDefinitionId&&!vault))return;
  const eventMap:Record<string,string>={UNEVEN_BARS:"BARS",BALANCE_BEAM:"BEAM",FLOOR_EXERCISE:"FLOOR"};if(element&&eventMap[block.apparatus??""]!==element.apparatus)return;if(vault&&block.apparatus!=="VAULT")return;
  const title=element?.name??vault?.name??planItem?.title??value(data,"title"), targetGymnastId=planItem?.gymnastId??(value(data,"targetGymnastId")||null), raw=planItem?.targetCount?String(planItem.targetCount):value(data,"targetCount"), targetCount=raw?Number(raw):null;
  if(!title||title.length>160||(targetCount!==null&&(!Number.isInteger(targetCount)||targetCount<1||targetCount>1000)))return; if(targetGymnastId&&!await prisma.trainingSessionGymnast.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId:targetGymnastId}}}))return;
  const last=await prisma.sessionBlockWorkItem.findFirst({where:{blockId},orderBy:{orderIndex:"desc"}}); await prisma.sessionBlockWorkItem.create({data:{blockId,trainingPlanItemId:planItem?.id??null,targetGymnastId,title,targetCount,elementDefinitionId:element?.id??null,vaultDefinitionId:vault?.id??null,trainingResourceId:value(data,"trainingResourceId")||null,landingResourceId:value(data,"landingResourceId")||null,trainingSurface:value(data,"trainingSurface")||null,landingSurface:value(data,"landingSurface")||null,takeoffEquipment:value(data,"takeoffEquipment")||null,notes:planItem?.notes??(value(data,"notes")||null),orderIndex:(last?.orderIndex??-1)+1}}); revalidatePath("/planning/"+sessionId);revalidatePath("/training/"+sessionId);
}
export async function updateSessionBlockWorkItem(data: FormData) {
  const context=await coachingContext(); const sessionId=value(data,"sessionId"),blockId=value(data,"blockId"),workItemId=value(data,"workItemId"); const session=await visibleSession(sessionId,context); const item=session?await prisma.sessionBlockWorkItem.findFirst({where:{id:workItemId,blockId,block:{sessionId}}}):null;if(!session||!item)return;
  const title=value(data,"title"),targetGymnastId=value(data,"targetGymnastId")||null,raw=value(data,"targetCount"),targetCount=raw?Number(raw):null;if(!title||title.length>160||(targetCount!==null&&(!Number.isInteger(targetCount)||targetCount<1||targetCount>1000)))return;if(targetGymnastId&&!await prisma.trainingSessionGymnast.findUnique({where:{sessionId_gymnastId:{sessionId,gymnastId:targetGymnastId}}}))return;
  await prisma.sessionBlockWorkItem.update({where:{id:item.id},data:{title,targetGymnastId,targetCount,notes:value(data,"notes")||null}});revalidatePath("/planning/"+sessionId);revalidatePath("/training/"+sessionId);
}
export async function deleteSessionBlockWorkItem(data: FormData) { const context=await coachingContext();const sessionId=value(data,"sessionId"),blockId=value(data,"blockId");const session=await visibleSession(sessionId,context);if(!session)return;await prisma.sessionBlockWorkItem.deleteMany({where:{id:value(data,"workItemId"),blockId,block:{sessionId}}});revalidatePath("/planning/"+sessionId);revalidatePath("/training/"+sessionId); }

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
    prisma.trainingAttendance.deleteMany({ where: { sessionId, gymnastId } }),
    prisma.trainingSessionGymnast.deleteMany({ where: { sessionId, gymnastId } }),
  ]);
  revalidatePath("/planning/" + sessionId);
}


export async function createTrainingWeekFromSchedule(data: FormData) {
  const context = await coachingContext();
  const trainingGroupId = value(data, "groupId");
  const weekStart = value(data, "weekStart");
  const group = await visibleGroup(trainingGroupId, context);
  if (!group || !validDate(weekStart)) return;

  const start = new Date(weekStart + "T00:00:00.000Z");
  const utcDay = start.getUTCDay();
  const mondayShift = utcDay === 0 ? -6 : 1 - utcDay;
  const monday = addUtcDays(start, mondayShift);

  for (const slot of group.scheduleSlots) {
    const offset = weekdayOffset(slot.dayOfWeek);
    if (offset < 0) continue;
    const sessionDate = addUtcDays(monday, offset);
    const existing = await prisma.trainingSession.findFirst({
      where: {
        organisationId: context.organisation.id,
        trainingGroupId,
        sessionDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      select: { id: true },
    });
    if (existing) continue;
    await createSessionFromGroup({
      context,
      group,
      sessionDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      scheduleSlotId: slot.id,
      notes: slot.notes,
    });
  }

  revalidatePath("/planning");
  revalidatePath("/calendar");
  revalidatePath("/groups/" + trainingGroupId);
}
