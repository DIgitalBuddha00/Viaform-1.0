"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const MODES = ["COUNTDOWN_TALLY", "STOPWATCH", "REPETITION_TALLY", "MEASUREMENT"] as const;
const CLASSIFICATIONS=["SKILL","STRENGTH","FLEXIBILITY","ROUTINE","CUSTOM"] as const;
const SCORING_MODES=["NONE","AUTOMATIC","MANUAL"] as const;
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
      category: "CUSTOM",
      evidenceClassification: CLASSIFICATIONS.includes(value(data,"evidenceClassification") as any)?value(data,"evidenceClassification"):"CUSTOM",
      apparatus: value(data, "apparatus") || null,
      description: value(data, "description") || null,
      protocol: value(data, "protocol") || null,
      captureMode,
      unit: value(data, "unit") || null,
      durationSeconds,
      direction,
      scoringMode:SCORING_MODES.includes(value(data,"scoringMode") as any)?value(data,"scoringMode"):"NONE",
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
      category: metric.category,
      evidenceClassification: CLASSIFICATIONS.includes(value(data,"evidenceClassification") as any)?value(data,"evidenceClassification"):"CUSTOM",
      apparatus: value(data, "apparatus") || null,
      description: value(data, "description") || null,
      protocol: value(data, "protocol") || null,
      captureMode,
      unit: value(data, "unit") || null,
      durationSeconds,
      direction,
      scoringMode:SCORING_MODES.includes(value(data,"scoringMode") as any)?value(data,"scoringMode"):"NONE",
    },
  }).catch(() => null);
  revalidatePath("/testing");
  revalidatePath("/progress");
}

export async function restoreTestMetric(data:FormData){const c=await coachingContext(),id=value(data,"metricId");await prisma.testMetric.updateMany({where:{id,organisationId:c.organisation.id,status:"ARCHIVED"},data:{status:"ACTIVE"}});revalidatePath("/testing");revalidatePath("/testing/points");}

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
  const testingType=value(data,"testingType")||"OPEN";
  let batteryId=value(data,"batteryId"),singleMetricId=value(data,"singleMetricId");
  if(testingType==="BATTERY")singleMetricId="";else if(testingType==="SINGLE")batteryId="";else {batteryId="";singleMetricId="";}
  if(testingType==="BATTERY"&&!batteryId)return;
  if(testingType==="SINGLE"&&!singleMetricId)return;
  if(batteryId&&!await prisma.testBattery.findFirst({where:{id:batteryId,organisationId:context.organisation.id,status:"ACTIVE"}}))return;
  if(singleMetricId&&!await prisma.testMetric.findFirst({where:{id:singleMetricId,organisationId:context.organisation.id,status:"ACTIVE"}}))return;

  const session = await prisma.testingSession.create({
    data: {
      organisationId: context.organisation.id,
      trainingGroupId,
      batteryId:batteryId||null,
      singleMetricId:singleMetricId||null,
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
  if (!session || !["IN_PROGRESS","COMPLETED"].includes(session.status)) return;
  const [assigned, metric] = await Promise.all([
    prisma.testingSessionGymnast.findUnique({ where: { sessionId_gymnastId: { sessionId, gymnastId } } }),
    prisma.testMetric.findFirst({ where: { id: metricId, organisationId: context.organisation.id, status: "ACTIVE" },include:{scoreBands:true} }),
  ]);
  if (!assigned || !metric) return;

  const band=metric.scoreBands.find(b=>b.ruleType!=="QUALITATIVE"&&(b.minValue===null||numberValue>=b.minValue)&&(b.maxValue===null||numberValue<=b.maxValue));
  const manualPoints=value(data,"pointsValue");
  const manualPointsValue=manualPoints===""?null:Number(manualPoints);
  if(metric.scoringMode==="MANUAL"&&manualPointsValue!==null&&!Number.isFinite(manualPointsValue))return;
  const pointsValue=metric.scoringMode==="AUTOMATIC"?(band?.points??null):metric.scoringMode==="MANUAL"?manualPointsValue:null;
  await prisma.testingResult.upsert({
    where: { sessionId_gymnastId_metricId: { sessionId, gymnastId, metricId } },
    create: {
      sessionId,
      gymnastId,
      metricId,
      recordedByMembershipId: context.membership.id,
      numberValue,
      pointsValue,
      classificationSnapshot:metric.evidenceClassification,
      note: value(data, "note") || null,
    },
    update: {
      numberValue,
      pointsValue,
      classificationSnapshot:metric.evidenceClassification,
      note: value(data, "note") || null,
      recordedByMembershipId: context.membership.id,
      recordedAt: new Date(),
    },
  });
  revalidatePath("/testing/" + sessionId);
}

export async function pauseTestingSession(data:FormData){const c=await coachingContext(),sessionId=value(data,"sessionId"),session=await visibleTestingSession(sessionId,c);if(!session||session.status!=="IN_PROGRESS")return;await prisma.testingSession.update({where:{id:session.id},data:{status:"PAUSED"}});revalidatePath("/testing");revalidatePath("/testing/"+sessionId);}
export async function resumeTestingSession(data:FormData){const c=await coachingContext(),sessionId=value(data,"sessionId"),session=await visibleTestingSession(sessionId,c);if(!session||session.status!=="PAUSED")return;await prisma.testingSession.update({where:{id:session.id},data:{status:"IN_PROGRESS"}});revalidatePath("/testing");revalidatePath("/testing/"+sessionId);}

export async function reopenTestingSession(data:FormData){const c=await coachingContext(),sessionId=value(data,"sessionId"),session=await visibleTestingSession(sessionId,c);if(!session||session.status!=="COMPLETED")return;await prisma.testingSession.update({where:{id:session.id},data:{status:"PAUSED"}});revalidatePath("/testing");revalidatePath("/testing/"+sessionId);}

export async function finishTestingSession(data: FormData) {
  const context = await coachingContext();
  const sessionId = value(data, "sessionId");
  const session = await visibleTestingSession(sessionId, context);
  if (!session || !["IN_PROGRESS","PAUSED"].includes(session.status)) return;
  await prisma.testingSession.update({ where: { id: session.id }, data: { status: "COMPLETED" } });
  revalidatePath("/testing");
  revalidatePath("/testing/" + sessionId);
}

export async function createTestBattery(data:FormData){const c=await coachingContext(),name=value(data,"name"),classification=value(data,"classification");if(!name)return;const metricIds=data.getAll("metricIds").map(String);await prisma.testBattery.create({data:{organisationId:c.organisation.id,name,description:value(data,"description")||null,classification:CLASSIFICATIONS.includes(classification as any)?classification:"CUSTOM",scoringEnabled:value(data,"scoringEnabled")==="on",items:{create:metricIds.map((metricId,orderIndex)=>({metricId,orderIndex}))}}}).catch(()=>null);revalidatePath("/testing");revalidatePath("/testing/points");}
export async function addTestScoreBands(data:FormData){const c=await coachingContext(),metricId=value(data,"metricId"),metric=await prisma.testMetric.findFirst({where:{id:metricId,organisationId:c.organisation.id}});if(!metric)return;const rows=value(data,"rows").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const creates=[];for(let i=0;i<rows.length;i++){const parts=rows[i].split(",").map(x=>x.trim());if(parts.length<2)continue;const points=Number(parts[0]);if(!Number.isFinite(points))continue;if(parts.length===2&&Number.isNaN(Number(parts[1])))creates.push({metricId,points,ruleType:"QUALITATIVE",criterionLabel:parts[1],label:parts[1],orderIndex:i});else{const min=parts[1]===""?null:Number(parts[1]),max=parts[2]===""||parts[2]===undefined?min:Number(parts[2]);if((min!==null&&!Number.isFinite(min))||(max!==null&&!Number.isFinite(max)))continue;creates.push({metricId,points,ruleType:"NUMERIC",minValue:min,maxValue:max,orderIndex:i});}}if(creates.length)await prisma.testScoreBand.createMany({data:creates});revalidatePath("/testing");revalidatePath("/testing/points");}

export async function addTestScoreBand(data:FormData){const c=await coachingContext(),metricId=value(data,"metricId"),metric=await prisma.testMetric.findFirst({where:{id:metricId,organisationId:c.organisation.id}});if(!metric)return;const points=Number(value(data,"points")),min=value(data,"minValue"),max=value(data,"maxValue"),minNumber=min?Number(min):null,maxNumber=max?Number(max):null;if(!Number.isFinite(points)||(minNumber!==null&&!Number.isFinite(minNumber))||(maxNumber!==null&&!Number.isFinite(maxNumber))||(minNumber!==null&&maxNumber!==null&&minNumber>maxNumber))return;await prisma.testScoreBand.create({data:{metricId,label:value(data,"label")||null,minValue:minNumber,maxValue:maxNumber,points,ruleType:value(data,"ruleType")==="QUALITATIVE"?"QUALITATIVE":"NUMERIC",criterionLabel:value(data,"criterionLabel")||null}});revalidatePath("/testing");revalidatePath("/testing/points");}

export async function updateTestBattery(data:FormData){const c=await coachingContext(),id=value(data,"batteryId"),classification=value(data,"classification"),metricIds=data.getAll("metricIds").map(String);const b=await prisma.testBattery.findFirst({where:{id,organisationId:c.organisation.id}});if(!b)return;await prisma.$transaction([prisma.testBatteryItem.deleteMany({where:{batteryId:id}}),prisma.testBattery.update({where:{id},data:{name:value(data,"name")||b.name,description:value(data,"description")||null,classification:CLASSIFICATIONS.includes(classification as any)?classification:b.classification,scoringEnabled:value(data,"scoringEnabled")==="on",pointSystemId:value(data,"pointSystemId")||null,items:{create:metricIds.map((metricId,orderIndex)=>({metricId,orderIndex}))}}})]);revalidatePath("/testing");revalidatePath("/testing/points");}
export async function archiveTestBattery(data:FormData){const c=await coachingContext(),id=value(data,"batteryId");await prisma.testBattery.updateMany({where:{id,organisationId:c.organisation.id,status:"ACTIVE"},data:{status:"ARCHIVED"}});revalidatePath("/testing");revalidatePath("/testing/points");}
export async function restoreTestBattery(data:FormData){const c=await coachingContext(),id=value(data,"batteryId");await prisma.testBattery.updateMany({where:{id,organisationId:c.organisation.id,status:"ARCHIVED"},data:{status:"ACTIVE"}});revalidatePath("/testing");revalidatePath("/testing/points");}
export async function createPointSystem(data:FormData){const c=await coachingContext(),name=value(data,"name");if(!name)return;const metricIds=data.getAll("metricIds").map(String);const ps=await prisma.testPointSystem.create({data:{organisationId:c.organisation.id,name,description:value(data,"description")||null}}).catch(()=>null);if(!ps)return;if(metricIds.length)await prisma.testMetric.updateMany({where:{organisationId:c.organisation.id,id:{in:metricIds}},data:{pointSystemId:ps.id,scoringMode:"AUTOMATIC"}});revalidatePath("/testing");revalidatePath("/testing/points");}
export async function updatePointSystem(data:FormData){const c=await coachingContext(),id=value(data,"pointSystemId"),name=value(data,"name"),metricIds=data.getAll("metricIds").map(String);const ps=await prisma.testPointSystem.findFirst({where:{id,organisationId:c.organisation.id}});if(!ps||!name)return;await prisma.$transaction([prisma.testPointSystem.update({where:{id},data:{name,description:value(data,"description")||null}}),prisma.testMetric.updateMany({where:{organisationId:c.organisation.id,pointSystemId:id,id:{notIn:metricIds}},data:{pointSystemId:null}}),prisma.testMetric.updateMany({where:{organisationId:c.organisation.id,id:{in:metricIds}},data:{pointSystemId:id,scoringMode:"AUTOMATIC"}})]);revalidatePath("/testing");revalidatePath("/testing/points");}
export async function archivePointSystem(data:FormData){const c=await coachingContext(),id=value(data,"pointSystemId");await prisma.testPointSystem.updateMany({where:{id,organisationId:c.organisation.id,status:"ACTIVE"},data:{status:"ARCHIVED"}});revalidatePath("/testing");revalidatePath("/testing/points");}
export async function restorePointSystem(data:FormData){const c=await coachingContext(),id=value(data,"pointSystemId");await prisma.testPointSystem.updateMany({where:{id,organisationId:c.organisation.id,status:"ARCHIVED"},data:{status:"ACTIVE"}});revalidatePath("/testing");revalidatePath("/testing/points");}
export async function removeTestScoreBand(data:FormData){const c=await coachingContext(),id=value(data,"bandId");await prisma.testScoreBand.deleteMany({where:{id,metric:{organisationId:c.organisation.id}}});revalidatePath("/testing");revalidatePath("/testing/points");}
