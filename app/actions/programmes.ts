"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
async function manager(){const c=await requireAuthContext();if(!c.access.canManageProgrammesAndMethodology)redirect("/programmes?error=permission");return c;}
async function programme(id:string,org:string){return prisma.coachingProgramme.findFirst({where:{id,organisationId:org}});}
async function stage(id:string,pid:string){return id?prisma.programmeStage.findFirst({where:{id,programmeId:pid}}):null;}
export async function createProgramme(d:FormData){const c=await manager(),name=v(d,"name"),programmeType=v(d,"programmeType"),discipline=v(d,"discipline")||"GENERAL";if(!name||!programmeType)return;await prisma.coachingProgramme.create({data:{organisationId:c.organisation.id,name,programmeType,discipline,description:v(d,"description")||null}}).catch(()=>null);revalidatePath("/programmes");}
export async function createProgrammeStage(d:FormData){const c=await manager(),programmeId=v(d,"programmeId"),name=v(d,"name");const p=await programme(programmeId,c.organisation.id);if(!p||!name)return;const count=await prisma.programmeStage.count({where:{programmeId}});await prisma.programmeStage.create({data:{programmeId,name,orderIndex:count,description:v(d,"description")||null}}).catch(()=>null);revalidatePath("/programmes");}
export async function assignGroupProgramme(d:FormData){const c=await manager(),trainingGroupId=v(d,"groupId"),programmeId=v(d,"programmeId"),stageId=v(d,"stageId");const [g,p,current]=await Promise.all([prisma.trainingGroup.findFirst({where:{id:trainingGroupId,organisationId:c.organisation.id}}),programme(programmeId,c.organisation.id),prisma.trainingGroupProgrammeAssignment.findUnique({where:{trainingGroupId}})]),s=p?await stage(stageId,p.id):null;if(!g||!p||(stageId&&!s))return;if(current?.programmeId===p.id&&(current.stageId??null)===(s?.id??null))return;const now=new Date();await prisma.$transaction(async tx=>{await tx.trainingGroupProgrammeAssignmentHistory.updateMany({where:{trainingGroupId,endedAt:null},data:{endedAt:now}});await tx.trainingGroupProgrammeAssignment.upsert({where:{trainingGroupId},create:{trainingGroupId,programmeId:p.id,stageId:s?.id},update:{programmeId:p.id,stageId:s?.id??null,assignedAt:now}});await tx.trainingGroupProgrammeAssignmentHistory.create({data:{organisationId:c.organisation.id,trainingGroupId,programmeId:p.id,stageId:s?.id,programmeName:p.name,stageName:s?.name??null,startedAt:now}})});revalidatePath("/groups/"+trainingGroupId);revalidatePath("/programmes");}
export async function assignGymnastProgramme(d:FormData){const c=await manager(),gymnastId=v(d,"gymnastId"),programmeId=v(d,"programmeId"),stageId=v(d,"stageId");const [g,p,current]=await Promise.all([prisma.gymnast.findFirst({where:{id:gymnastId,organisationId:c.organisation.id,status:"ACTIVE"}}),programme(programmeId,c.organisation.id),prisma.gymnastProgrammeAssignment.findUnique({where:{gymnastId}})]),s=p?await stage(stageId,p.id):null;if(!g||!p||(stageId&&!s))return;if(current?.programmeId===p.id&&(current.stageId??null)===(s?.id??null))return;const now=new Date();await prisma.$transaction(async tx=>{await tx.gymnastProgrammeAssignmentHistory.updateMany({where:{gymnastId,endedAt:null},data:{endedAt:now}});await tx.gymnastProgrammeAssignment.upsert({where:{gymnastId},create:{gymnastId,programmeId:p.id,stageId:s?.id},update:{programmeId:p.id,stageId:s?.id??null,assignedAt:now}});await tx.gymnastProgrammeAssignmentHistory.create({data:{organisationId:c.organisation.id,gymnastId,programmeId:p.id,stageId:s?.id,programmeName:p.name,stageName:s?.name??null,startedAt:now}})});revalidatePath("/gymnasts/"+gymnastId);revalidatePath("/programmes");}

export async function clearGroupProgramme(d:FormData){const c=await manager(),trainingGroupId=v(d,"groupId");const g=await prisma.trainingGroup.findFirst({where:{id:trainingGroupId,organisationId:c.organisation.id}});if(!g)return;const now=new Date();await prisma.$transaction([prisma.trainingGroupProgrammeAssignmentHistory.updateMany({where:{trainingGroupId,endedAt:null},data:{endedAt:now,changeReason:"CLEARED"}}),prisma.trainingGroupProgrammeAssignment.deleteMany({where:{trainingGroupId}})]);revalidatePath("/groups/"+trainingGroupId);}
export async function clearGymnastProgramme(d:FormData){const c=await manager(),gymnastId=v(d,"gymnastId");const g=await prisma.gymnast.findFirst({where:{id:gymnastId,organisationId:c.organisation.id}});if(!g)return;const now=new Date();await prisma.$transaction([prisma.gymnastProgrammeAssignmentHistory.updateMany({where:{gymnastId,endedAt:null},data:{endedAt:now,changeReason:"CLEARED"}}),prisma.gymnastProgrammeAssignment.deleteMany({where:{gymnastId}})]);revalidatePath("/gymnasts/"+gymnastId);}

export async function updateProgramme(d:FormData){const c=await manager(),id=v(d,"programmeId"),name=v(d,"name"),programmeType=v(d,"programmeType"),discipline=v(d,"discipline")||"GENERAL";const p=await programme(id,c.organisation.id);if(!p||!name||!programmeType)return;await prisma.coachingProgramme.update({where:{id},data:{name,programmeType,discipline,description:v(d,"description")||null}}).catch(()=>null);revalidatePath("/programmes");}
export async function deleteProgramme(d:FormData){const c=await manager(),id=v(d,"programmeId");const p=await programme(id,c.organisation.id);if(!p)return;await prisma.coachingProgramme.delete({where:{id}});revalidatePath("/programmes");}
export async function updateProgrammeStage(d:FormData){const c=await manager(),programmeId=v(d,"programmeId"),stageId=v(d,"stageId"),name=v(d,"name");const p=await programme(programmeId,c.organisation.id),s=p?await stage(stageId,p.id):null;if(!p||!s||!name)return;await prisma.programmeStage.update({where:{id:stageId},data:{name,description:v(d,"description")||null}}).catch(()=>null);revalidatePath("/programmes");}
export async function deleteProgrammeStage(d:FormData){const c=await manager(),programmeId=v(d,"programmeId"),stageId=v(d,"stageId");const p=await programme(programmeId,c.organisation.id),s=p?await stage(stageId,p.id):null;if(!p||!s)return;await prisma.programmeStage.delete({where:{id:stageId}});revalidatePath("/programmes");}

export async function createProgrammeStageOutcome(d:FormData){
 const c=await manager(),stageId=v(d,"stageId"),category=v(d,"category")||"SKILL",title=v(d,"title"),emphasis=v(d,"emphasis")||"DEVELOP",skillId=v(d,"skillId"),testMetricId=v(d,"testMetricId");
 const st=await prisma.programmeStage.findFirst({where:{id:stageId,programme:{organisationId:c.organisation.id}}});if(!st||!title)return;
 const [skill,metric,count]=await Promise.all([
  skillId?prisma.viaformSkill.findFirst({where:{id:skillId,status:"ACTIVE",OR:[{sourceOrganisationId:null},{sourceOrganisationId:c.organisation.id}]},select:{id:true}}):null,
  testMetricId?prisma.testMetric.findFirst({where:{id:testMetricId,organisationId:c.organisation.id,status:"ACTIVE"},select:{id:true}}):null,
  prisma.programmeStageOutcome.count({where:{stageId}})
 ]);
 if(skillId&&!skill||testMetricId&&!metric)return;
 await prisma.programmeStageOutcome.create({data:{organisationId:c.organisation.id,stageId,category,apparatus:v(d,"apparatus")||null,title,description:v(d,"description")||null,emphasis,successEvidence:v(d,"successEvidence")||null,coachNotes:v(d,"coachNotes")||null,skillId:skill?.id??null,testMetricId:metric?.id??null,orderIndex:count}});
 revalidatePath("/programmes");
}
export async function updateProgrammeStageOutcome(d:FormData){
 const c=await manager(),id=v(d,"outcomeId"),title=v(d,"title"),emphasis=v(d,"emphasis")||"DEVELOP";
 const o=await prisma.programmeStageOutcome.findFirst({where:{id,organisationId:c.organisation.id}});if(!o||!title)return;
 await prisma.programmeStageOutcome.update({where:{id},data:{title,description:v(d,"description")||null,emphasis,successEvidence:v(d,"successEvidence")||null,coachNotes:v(d,"coachNotes")||null}});
 revalidatePath("/programmes");
}
export async function archiveProgrammeStageOutcome(d:FormData){
 const c=await manager(),id=v(d,"outcomeId");const o=await prisma.programmeStageOutcome.findFirst({where:{id,organisationId:c.organisation.id}});if(!o)return;
 await prisma.programmeStageOutcome.update({where:{id},data:{status:"ARCHIVED"}});revalidatePath("/programmes");
}
