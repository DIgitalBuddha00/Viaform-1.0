"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const PROVENANCE=["COACH_METHODOLOGY","CLUB_PROGRAMME","TRUSTED_CONTRIBUTOR","SPECIALIST","GYMNAST_SPECIFIC_COACH_DECISION"] as const;
const SCOPES=["GLOBAL","APPARATUS","PROGRAMME","ROUTINE_CONTEXT","MOVEMENT_FAMILY"] as const;

async function programmeManager(){const c=await requireAuthContext();if(!c.access.canManageProgrammesAndMethodology)redirect("/more?error=permission");return c;}
async function record(id:string,org:string){return prisma.methodologyRecord.findFirst({where:{id,organisationId:org}});}

export async function assignProgrammeLead(d:FormData){
  const c=await programmeManager(),programmeId=v(d,"programmeId"),membershipId=v(d,"membershipId");
  const [p,m]=await Promise.all([
    prisma.coachingProgramme.findFirst({where:{id:programmeId,organisationId:c.organisation.id}}),
    prisma.organisationMembership.findFirst({where:{id:membershipId,organisationId:c.organisation.id,isActive:true}}),
  ]);
  if(!p||!m)return;
  let roles:string[]=[];try{roles=JSON.parse(m.coachingRoles)}catch{}
  if(!roles.includes("PROGRAMME_LEAD")&&!roles.includes("HEAD_COACH"))return;
  await prisma.programmeLeadAssignment.create({data:{organisationId:c.organisation.id,programmeId,membershipId}}).catch(()=>null);
  revalidatePath("/programmes");
}
export async function removeProgrammeLead(d:FormData){
  const c=await programmeManager(),id=v(d,"assignmentId");
  await prisma.programmeLeadAssignment.deleteMany({where:{id,organisationId:c.organisation.id}});
  revalidatePath("/programmes");
}

export async function createMethodologyRecord(d:FormData){
  const c=await requireAuthContext();
  if(!c.access.canUseCoachingWorkspace)redirect("/methodology?error=coaching-role");
  const title=v(d,"title"),scopeType=v(d,"scopeType")||"GLOBAL",provenance=v(d,"provenance")||"COACH_METHODOLOGY",programmeId=v(d,"programmeId")||null;
  if(!title||!SCOPES.includes(scopeType as typeof SCOPES[number])||!PROVENANCE.includes(provenance as typeof PROVENANCE[number]))return;
  if(provenance==="CLUB_PROGRAMME"&&!programmeId)return;
  if(programmeId&&!await prisma.coachingProgramme.findFirst({where:{id:programmeId,organisationId:c.organisation.id}}))return;
  await prisma.methodologyRecord.create({data:{
    organisationId:c.organisation.id,programmeId,createdByMembershipId:c.membership.id,title,scopeType,
    scopeRef:v(d,"scopeRef")||null,apparatus:v(d,"apparatus")||null,provenance,
    contributorName:v(d,"contributorName")||null,technicalObjective:v(d,"technicalObjective")||null,
    technicalBoundaries:v(d,"technicalBoundaries")||null,defaultApproach:v(d,"defaultApproach")||null,
    alternativeApproaches:v(d,"alternativeApproaches")||null,uncertainty:v(d,"uncertainty")||null,
    sourceNote:v(d,"sourceNote")||null,sourceUrl:v(d,"sourceUrl")||null,
  }});
  revalidatePath("/methodology");
}

export async function updateMethodologyRecord(d:FormData){
  const c=await requireAuthContext(),id=v(d,"recordId"),r=await record(id,c.organisation.id);
  if(!r)return;
  const canEdit=r.createdByMembershipId===c.membership.id||c.access.isHeadCoach||c.access.coachingRoles.includes("PROGRAMME_LEAD");
  if(!canEdit||r.status==="APPROVED")return;
  await prisma.methodologyRecord.update({where:{id},data:{
    technicalObjective:v(d,"technicalObjective")||null,technicalBoundaries:v(d,"technicalBoundaries")||null,
    defaultApproach:v(d,"defaultApproach")||null,alternativeApproaches:v(d,"alternativeApproaches")||null,
    uncertainty:v(d,"uncertainty")||null,sourceNote:v(d,"sourceNote")||null,sourceUrl:v(d,"sourceUrl")||null,
  }});
  revalidatePath("/methodology");
}

export async function submitMethodologyForReview(d:FormData){
  const c=await requireAuthContext(),id=v(d,"recordId"),r=await record(id,c.organisation.id);
  if(!r||r.createdByMembershipId!==c.membership.id||r.status!=="DRAFT")return;
  await prisma.methodologyRecord.update({where:{id},data:{status:"IN_REVIEW"}});revalidatePath("/methodology");
}

export async function returnMethodologyToDraft(d:FormData){
  const c=await requireAuthContext(),id=v(d,"recordId"),r=await record(id,c.organisation.id);
  const canReview=c.access.isHeadCoach||c.access.coachingRoles.includes("PROGRAMME_LEAD");
  if(!r||!canReview||r.status!=="IN_REVIEW")return;
  await prisma.methodologyRecord.update({where:{id},data:{status:"DRAFT"}});revalidatePath("/methodology");
}

export async function approveMethodologyRecord(d:FormData){
  const c=await requireAuthContext(),id=v(d,"recordId"),r=await record(id,c.organisation.id);
  if(!r||!c.access.isHeadCoach||r.status!=="IN_REVIEW")return;
  await prisma.methodologyRecord.update({where:{id},data:{status:"APPROVED",approvedByMembershipId:c.membership.id,approvedAt:new Date()}});
  revalidatePath("/methodology");
}

export async function archiveMethodologyRecord(d:FormData){
  const c=await requireAuthContext(),id=v(d,"recordId"),r=await record(id,c.organisation.id);
  if(!r||(!c.access.isHeadCoach&&r.createdByMembershipId!==c.membership.id))return;
  await prisma.methodologyRecord.update({where:{id},data:{status:"ARCHIVED"}});revalidatePath("/methodology");
}
