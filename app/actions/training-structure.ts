"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {groupScopeWhere} from "@/app/lib/coaching-scope";

const field=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const date=(raw:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const value=new Date(raw+"T12:00:00.000Z");return Number.isNaN(value.getTime())?null:value.toISOString().slice(0,10)===raw?value:null};
const refresh=()=>{revalidatePath("/planning");revalidatePath("/calendar")};

async function context(){const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)redirect("/dashboard");return c}
async function group(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.trainingGroup.findFirst({where:{id,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}})}
async function cycle(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.macrocycle.findFirst({where:{id,organisationId:c.organisation.id,...(c.access.canViewAllCoachingData?{}:{groups:{some:{trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)}}})},include:{groups:true}})}
async function plan(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.trainingPlan.findFirst({where:{id,organisationId:c.organisation.id,trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)}})}

export async function createMacrocycle(data:FormData){
 const c=await context(),trainingGroupId=field(data,"groupId"),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!await group(trainingGroupId,c)||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 await prisma.macrocycle.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,name,startDate,endDate,notes:field(data,"notes")||null,groups:{create:{trainingGroupId}}}});
 refresh();redirect("/planning?view=macrocycles");
}
export async function updateMacrocycle(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!m||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 const phases=await prisma.macrocyclePhase.findMany({where:{macrocycleId:m.id},select:{startDate:true,endDate:true}});
 if(phases.some(p=>p.startDate<startDate||p.endDate>endDate))return;
 const plans=await prisma.trainingPlan.findMany({where:{macrocycleId:m.id},select:{startDate:true,endDate:true}});
 if(plans.some(p=>p.startDate<startDate||p.endDate>endDate))return;
 await prisma.macrocycle.update({where:{id:m.id},data:{name,startDate,endDate,notes:field(data,"notes")||null}});refresh();
}
export async function setMacrocycleStatus(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c),status=field(data,"status");
 if(!m||!["ACTIVE","ARCHIVED"].includes(status))return;
 await prisma.macrocycle.update({where:{id:m.id},data:{status}});refresh();
}
export async function createMacrocyclePhase(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!m||m.status!=="ACTIVE"||!name||name.length>120||!startDate||!endDate||startDate<m.startDate||endDate>m.endDate||endDate<startDate)return;
 const count=await prisma.macrocyclePhase.count({where:{macrocycleId:m.id}});
 await prisma.macrocyclePhase.create({data:{macrocycleId:m.id,name,startDate,endDate,orderIndex:count,notes:field(data,"notes")||null}});refresh();
}
export async function deleteMacrocyclePhase(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c);
 if(!m)return;
 await prisma.macrocyclePhase.deleteMany({where:{id:field(data,"phaseId"),macrocycleId:m.id}});refresh();
}
export async function updateMacrocyclePhase(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!m||!name||name.length>120||!startDate||!endDate||startDate<m.startDate||endDate>m.endDate||endDate<startDate)return;
 await prisma.macrocyclePhase.updateMany({where:{id:field(data,"phaseId"),macrocycleId:m.id},data:{name,startDate,endDate,notes:field(data,"notes")||null}});refresh();
}
export async function createTrainingPlan(data:FormData){
 const c=await context(),trainingGroupId=field(data,"groupId"),macrocycleId=field(data,"macrocycleId")||null,name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!await group(trainingGroupId,c)||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 if(macrocycleId){const m=await cycle(macrocycleId,c);if(!m||m.status!=="ACTIVE"||!m.groups.some(g=>g.trainingGroupId===trainingGroupId)||startDate<m.startDate||endDate>m.endDate)return}
 await prisma.trainingPlan.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,trainingGroupId,macrocycleId,name,startDate,endDate,focus:field(data,"focus")||null,notes:field(data,"notes")||null}});
 refresh();redirect("/planning?view=plans");
}
export async function updateTrainingPlan(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!p||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 if(p.macrocycleId){const m=await cycle(p.macrocycleId,c);if(!m||startDate<m.startDate||endDate>m.endDate)return}
 const sessions=await prisma.trainingSession.findMany({where:{trainingPlanId:p.id},select:{sessionDate:true}});
 if(sessions.some(s=>s.sessionDate<startDate||s.sessionDate>endDate))return;
 await prisma.trainingPlan.update({where:{id:p.id},data:{name,startDate,endDate,focus:field(data,"focus")||null,notes:field(data,"notes")||null}});refresh();
}
export async function setTrainingPlanStatus(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c),status=field(data,"status");
 if(!p||!["ACTIVE","ARCHIVED"].includes(status))return;
 await prisma.trainingPlan.update({where:{id:p.id},data:{status}});refresh();
}
export async function assignSessionToTrainingPlan(data:FormData){
 const c=await context(),sessionId=field(data,"sessionId"),planId=field(data,"planId"),p=await plan(planId,c);
 if(!p||p.status!=="ACTIVE")return;
 const session=await prisma.trainingSession.findFirst({where:{id:sessionId,organisationId:c.organisation.id,trainingGroupId:p.trainingGroupId,status:"PLANNED",trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)}});
 if(!session||session.sessionDate<p.startDate||session.sessionDate>p.endDate)return;
 await prisma.trainingSession.update({where:{id:session.id},data:{trainingPlanId:p.id}});refresh();
}
export async function removeSessionFromTrainingPlan(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c);
 if(!p)return;
 await prisma.trainingSession.updateMany({where:{id:field(data,"sessionId"),trainingPlanId:p.id,organisationId:c.organisation.id,status:"PLANNED"},data:{trainingPlanId:null}});refresh();
}
