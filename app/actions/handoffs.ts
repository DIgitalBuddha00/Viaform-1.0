"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere, gymnastScopeWhere } from "@/app/lib/coaching-scope";

const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const parseDate=(value:string)=>value?new Date(value):null;
async function coach(){const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)redirect("/handoffs?error=coaching-role");return c;}
async function handoff(id:string,org:string){return prisma.coachHandoff.findFirst({where:{id,organisationId:org}});}

async function snapshot(gymnastId:string,organisationId:string,membershipId:string,access:Awaited<ReturnType<typeof coach>>["access"]){
 const g=await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(organisationId,membershipId,access)},include:{
  groups:{include:{trainingGroup:true}},programmeAssignments:{include:{programme:true,stage:true}},rulesetAssignments:{include:{rulesetProgram:true,rulesetLevel:true}},
  routines:{where:{status:"ACTIVE"},select:{id:true,name:true,apparatus:true,purpose:true,rulesetProgramName:true,rulesetLevelName:true}},
  trainingEvidence:{orderBy:{recordedAt:"desc"},take:12,select:{outcome:true,note:true,recordedAt:true}},
  testingResults:{orderBy:{recordedAt:"desc"},take:8,include:{metric:{select:{name:true,unit:true}}}},
 }};
 if(!g)return null;
 return JSON.stringify({capturedAt:new Date().toISOString(),groups:g.groups.map(x=>x.trainingGroup.name),programme:g.programmeAssignments[0]?{name:g.programmeAssignments[0].programme.name,stage:g.programmeAssignments[0].stage?.name??null}:null,ruleset:g.rulesetAssignments[0]?{programme:g.rulesetAssignments[0].rulesetProgram.name,level:g.rulesetAssignments[0].rulesetLevel.name}:null,routines:g.routines,recentTraining:g.trainingEvidence,recentTesting:g.testingResults.map(x=>({metric:x.metric.name,value:x.numberValue,unit:x.metric.unit,recordedAt:x.recordedAt}))});
}

export async function createCoachHandoff(d:FormData){
 const c=await coach(),toMembershipId=v(d,"toMembershipId"),scope=v(d,"scope")==="GROUP"?"GROUP":"SELECTED",trainingGroupId=scope==="GROUP"?v(d,"trainingGroupId"):null;
 if(!toMembershipId||toMembershipId===c.membership.id)return;
 const recipient=await prisma.organisationMembership.findFirst({where:{id:toMembershipId,organisationId:c.organisation.id,isActive:true}});
 if(!recipient)return;
 let gymnastIds:string[]=[];
 if(scope==="GROUP"){
  const group=await prisma.trainingGroup.findFirst({where:{id:trainingGroupId!,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},include:{memberships:true}});
  if(!group)return;gymnastIds=group.memberships.map(x=>x.gymnastId);
 }else gymnastIds=Array.from(new Set(d.getAll("gymnastId").map(String)));
 if(!gymnastIds.length)return;
 const visible=await prisma.gymnast.findMany({where:{id:{in:gymnastIds},...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});
 gymnastIds=visible.map(x=>x.id);if(!gymnastIds.length)return;
 const snapshots=await Promise.all(gymnastIds.map(id=>snapshot(id,c.organisation.id,c.membership.id,c.access)));
 const startsAt=parseDate(v(d,"startsAt"))??new Date(),endsAt=parseDate(v(d,"endsAt"));
 if(Number.isNaN(startsAt.getTime())||(endsAt&&Number.isNaN(endsAt.getTime()))||(endsAt&&endsAt<startsAt))return;
 await prisma.coachHandoff.create({data:{
  organisationId:c.organisation.id,fromMembershipId:c.membership.id,toMembershipId,trainingGroupId,scope,
  title:v(d,"title")||(scope==="GROUP"?"Group cover":"Gymnast cover"),startsAt,endsAt,
  sharedFocus:v(d,"sharedFocus")||null,sharedNote:v(d,"sharedNote")||null,
  gymnasts:{create:gymnastIds.map((id,i)=>({gymnastId:id,individualNote:v(d,"note_"+id)||null,contextSnapshot:snapshots[i]??"{}"}))}
 }});
 revalidatePath("/handoffs");
}

export async function updateHandoffCover(d:FormData){
 const c=await coach(),id=v(d,"handoffId"),h=await handoff(id,c.organisation.id);
 if(!h||h.toMembershipId!==c.membership.id||h.status!=="ACTIVE")return;
 await prisma.coachHandoff.update({where:{id},data:{returnNote:v(d,"returnNote")||null}});
 const entryId=v(d,"entryId");if(entryId)await prisma.coachHandoffGymnast.updateMany({where:{id:entryId,handoffId:id},data:{coverNote:v(d,"coverNote")||null}});
 revalidatePath("/handoffs");
}

export async function closeCoachHandoff(d:FormData){
 const c=await coach(),id=v(d,"handoffId"),h=await handoff(id,c.organisation.id);
 if(!h||h.fromMembershipId!==c.membership.id||h.status!=="ACTIVE")return;
 await prisma.coachHandoff.update({where:{id},data:{status:"CLOSED",closedAt:new Date()}});
 revalidatePath("/handoffs");
}
