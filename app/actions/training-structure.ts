"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {groupScopeWhere,gymnastScopeWhere} from "@/app/lib/coaching-scope";

const field=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const date=(raw:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(raw))return null;const value=new Date(raw+"T12:00:00.000Z");return Number.isNaN(value.getTime())?null:value.toISOString().slice(0,10)===raw?value:null};
const refresh=()=>{revalidatePath("/planning");revalidatePath("/calendar")};

async function context(){const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)redirect("/dashboard");return c}
async function group(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.trainingGroup.findFirst({where:{id,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}})}
async function gymnast(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.gymnast.findFirst({where:{id,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true,groups:{select:{trainingGroupId:true}}}})}
async function cycle(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.macrocycle.findFirst({where:{id,organisationId:c.organisation.id,...(c.access.canViewAllCoachingData?{}:{OR:[{groups:{some:{trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)}}},{gymnasts:{some:{gymnast:gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)}}}]})},include:{groups:true,gymnasts:true}})}
async function plan(id:string,c:Awaited<ReturnType<typeof context>>){return prisma.trainingPlan.findFirst({where:{id,organisationId:c.organisation.id,trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)}})}

export async function createMacrocycle(data:FormData){
 const c=await context(),scope=field(data,"scope"),trainingGroupId=scope.startsWith("GROUP:")?scope.slice(6):"",gymnastId=scope.startsWith("GYMNAST:")?scope.slice(8):"",name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(Boolean(trainingGroupId)===Boolean(gymnastId)||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 if((trainingGroupId&&!await group(trainingGroupId,c))||(gymnastId&&!await gymnast(gymnastId,c)))return;
 await prisma.macrocycle.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,name,startDate,endDate,notes:field(data,"notes")||null,...(trainingGroupId?{groups:{create:{trainingGroupId}}}:{gymnasts:{create:{gymnastId}}})}});
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
 await prisma.macrocyclePhase.create({data:{macrocycleId:m.id,name,startDate,endDate,orderIndex:count,notes:field(data,"notes")||null,goals:field(data,"goals")||null,apparatusFocus:field(data,"apparatusFocus")||null,conditioningFocus:field(data,"conditioningFocus")||null,artistryFocus:field(data,"artistryFocus")||null}});refresh();
}
export async function deleteMacrocyclePhase(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c);
 if(!m)return;
 await prisma.macrocyclePhase.deleteMany({where:{id:field(data,"phaseId"),macrocycleId:m.id}});refresh();
}
export async function updateMacrocyclePhase(data:FormData){
 const c=await context(),m=await cycle(field(data,"macrocycleId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!m||!name||name.length>120||!startDate||!endDate||startDate<m.startDate||endDate>m.endDate||endDate<startDate)return;
 const periods=await prisma.macrocycleFocusPeriod.findMany({where:{phaseId:field(data,"phaseId")},select:{startDate:true,endDate:true}});
 if(periods.some(p=>p.startDate<startDate||p.endDate>endDate))return;
 await prisma.macrocyclePhase.updateMany({where:{id:field(data,"phaseId"),macrocycleId:m.id},data:{name,startDate,endDate,notes:field(data,"notes")||null,goals:field(data,"goals")||null,apparatusFocus:field(data,"apparatusFocus")||null,conditioningFocus:field(data,"conditioningFocus")||null,artistryFocus:field(data,"artistryFocus")||null}});refresh();
}
export async function createTrainingPlan(data:FormData){
 const c=await context(),scope=field(data,"scope"),parts=scope.split(":"),trainingGroupId=parts[0]==="GROUP"?parts[1]:parts[0]==="GYMNAST"?parts[2]:"",gymnastId=parts[0]==="GYMNAST"?parts[1]:null,macrocycleId=field(data,"macrocycleId")||null,name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!trainingGroupId||(parts[0]==="GYMNAST"&&!gymnastId)||!await group(trainingGroupId,c)||!name||name.length>120||!startDate||!endDate||endDate<startDate)return;
 if(gymnastId){const athlete=await gymnast(gymnastId,c);if(!athlete?.groups.some(g=>g.trainingGroupId===trainingGroupId))return}
 if(macrocycleId){const m=await cycle(macrocycleId,c);if(!m||m.status!=="ACTIVE"||!(m.groups.some(g=>g.trainingGroupId===trainingGroupId)||gymnastId&&m.gymnasts.some(g=>g.gymnastId===gymnastId))||startDate<m.startDate||endDate>m.endDate)return}
 await prisma.trainingPlan.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,trainingGroupId,gymnastId,macrocycleId,name,startDate,endDate,focus:field(data,"focus")||null,notes:field(data,"notes")||null}});
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
 const session=await prisma.trainingSession.findFirst({where:{id:sessionId,organisationId:c.organisation.id,trainingGroupId:p.trainingGroupId,status:"PLANNED",trainingPlanId:null,trainingGroup:groupScopeWhere(c.organisation.id,c.membership.id,c.access)},include:{gymnasts:{select:{gymnastId:true}}}});
 if(!session||session.sessionDate<p.startDate||session.sessionDate>p.endDate)return;
 if(p.gymnastId&&(session.gymnasts.length!==1||session.gymnasts[0].gymnastId!==p.gymnastId))return;
 await prisma.trainingSession.update({where:{id:session.id},data:{trainingPlanId:p.id}});refresh();
}
export async function removeSessionFromTrainingPlan(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c);
 if(!p)return;
 await prisma.trainingSession.updateMany({where:{id:field(data,"sessionId"),trainingPlanId:p.id,organisationId:c.organisation.id,status:"PLANNED"},data:{trainingPlanId:null}});refresh();
}

const categories=["WARM_UP","APPARATUS","PHYSICAL_PREPARATION","CONDITIONING","ROUTINES","TESTING","OTHER"];
const apparatuses=["VAULT","UNEVEN_BARS","BALANCE_BEAM","FLOOR_EXERCISE","PHYSICAL_PREPARATION"];
const optionalPositive=(raw:string,max:number)=>{if(!raw)return null;const n=Number(raw);return Number.isInteger(n)&&n>0&&n<=max?n:NaN};

export async function addTrainingPlanItem(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c),title=field(data,"title"),category=field(data,"category"),apparatus=field(data,"apparatus")||null,gymnastId=field(data,"gymnastId")||p?.gymnastId||null,durationMin=optionalPositive(field(data,"durationMin"),480),targetCount=optionalPositive(field(data,"targetCount"),1000);
 if(!p||p.status!=="ACTIVE"||!title||title.length>160||!categories.includes(category)||apparatus&&!apparatuses.includes(apparatus)||Number.isNaN(durationMin)||Number.isNaN(targetCount))return;
 if(p.gymnastId&&gymnastId!==p.gymnastId)return;
 if(gymnastId){const athlete=await gymnast(gymnastId,c);if(!athlete?.groups.some(g=>g.trainingGroupId===p.trainingGroupId))return}
 const last=await prisma.trainingPlanItem.findFirst({where:{planId:p.id},orderBy:{orderIndex:"desc"},select:{orderIndex:true}});
 await prisma.trainingPlanItem.create({data:{planId:p.id,gymnastId,title,category,apparatus,durationMin,targetCount,notes:field(data,"notes")||null,orderIndex:(last?.orderIndex??-1)+1}});refresh();
}
export async function removeTrainingPlanItem(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c);
 if(!p||p.status!=="ACTIVE")return;
 await prisma.trainingPlanItem.deleteMany({where:{id:field(data,"itemId"),planId:p.id}});refresh();
}
export async function updateTrainingPlanItem(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c),title=field(data,"title"),category=field(data,"category"),apparatus=field(data,"apparatus")||null,gymnastId=field(data,"gymnastId")||p?.gymnastId||null,durationMin=optionalPositive(field(data,"durationMin"),480),targetCount=optionalPositive(field(data,"targetCount"),1000);
 if(!p||p.status!=="ACTIVE"||!title||title.length>160||!categories.includes(category)||apparatus&&!apparatuses.includes(apparatus)||Number.isNaN(durationMin)||Number.isNaN(targetCount))return;
 if(p.gymnastId&&gymnastId!==p.gymnastId)return;
 if(gymnastId){const athlete=await gymnast(gymnastId,c);if(!athlete?.groups.some(g=>g.trainingGroupId===p.trainingGroupId))return}
 await prisma.trainingPlanItem.updateMany({where:{id:field(data,"itemId"),planId:p.id},data:{title,category,apparatus,gymnastId,durationMin,targetCount,notes:field(data,"notes")||null}});refresh();
}

export async function buildSessionFromTrainingPlan(data:FormData){
 const c=await context(),p=await plan(field(data,"planId"),c),sessionDate=date(field(data,"sessionDate")),startTime=field(data,"startTime"),endTime=field(data,"endTime");
 if(!p||p.status!=="ACTIVE"||!sessionDate||sessionDate<p.startDate||sessionDate>p.endDate||!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||endTime<=startTime)return;
 const [items,g]=await Promise.all([prisma.trainingPlanItem.findMany({where:{planId:p.id},orderBy:{orderIndex:"asc"}}),prisma.trainingGroup.findFirst({where:{id:p.trainingGroupId,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},include:{memberships:{select:{gymnastId:true}},programmeAssignments:{include:{programme:true,stage:true}},facilityPreference:true}})]);
 if(!g||!items.length||p.gymnastId&&!g.memberships.some(m=>m.gymnastId===p.gymnastId))return;
 const roster=p.gymnastId?[p.gymnastId]:g.memberships.map(m=>m.gymnastId);
 if(!roster.length||items.some(i=>i.gymnastId&&!roster.includes(i.gymnastId)))return;
 const programme=g.programmeAssignments[0];
 const session=await prisma.trainingSession.create({data:{organisationId:c.organisation.id,trainingGroupId:g.id,trainingPlanId:p.id,createdByMembershipId:c.membership.id,sessionDate,startTime,endTime,title:field(data,"title")||p.name,sessionIntent:p.focus,notes:p.notes,programmeId:programme?.programmeId??null,programmeStageId:programme?.stageId??null,programmeNameSnapshot:programme?.programme.name??null,stageNameSnapshot:programme?.stage?.name??null,gymnasts:{create:roster.map(gymnastId=>({gymnastId,source:"PLAN"}))},blocks:{create:Object.values(items.reduce<Record<string,{title:string;category:string;apparatus:string|null;durationMin:number|null;orderIndex:number;items:typeof items}>>((groups,item)=>{const key=item.apparatus||item.category;const existing=groups[key];if(existing){existing.items.push(item);if(item.durationMin)existing.durationMin=(existing.durationMin??0)+item.durationMin;}else groups[key]={title:item.apparatus?item.apparatus.replaceAll("_"," "):item.category.replaceAll("_"," "),category:item.category,apparatus:item.apparatus,durationMin:item.durationMin,orderIndex:Object.keys(groups).length,items:[item]};return groups;},{})).map(group=>({title:group.title,category:group.category,apparatus:group.apparatus,durationMin:group.durationMin,orderIndex:group.orderIndex,workItems:{create:group.items.map((i,index)=>({trainingPlanItemId:i.id,title:i.title,targetGymnastId:i.gymnastId,targetCount:i.targetCount,notes:i.notes,orderIndex:index}))}}))},...(g.facilityPreference?{facilityAssignment:{create:{locationId:g.facilityPreference.locationId}}}:{})}});
 refresh();revalidatePath("/groups/"+g.id);redirect("/planning/"+session.id);
}

async function phase(id:string,c:Awaited<ReturnType<typeof context>>){const p=await prisma.macrocyclePhase.findFirst({where:{id},select:{id:true,macrocycleId:true,startDate:true,endDate:true}});return p&&await cycle(p.macrocycleId,c)?p:null}
export async function addMacrocycleFocusPeriod(data:FormData){
 const c=await context(),p=await phase(field(data,"phaseId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!p||!name||name.length>120||!startDate||!endDate||startDate<p.startDate||endDate>p.endDate||endDate<startDate)return;
 const last=await prisma.macrocycleFocusPeriod.findFirst({where:{phaseId:p.id},orderBy:{orderIndex:"desc"},select:{orderIndex:true}});
 await prisma.macrocycleFocusPeriod.create({data:{phaseId:p.id,name,startDate,endDate,orderIndex:(last?.orderIndex??-1)+1,apparatusFocus:field(data,"apparatusFocus")||null,conditioningFocus:field(data,"conditioningFocus")||null,artistryFocus:field(data,"artistryFocus")||null,notes:field(data,"notes")||null}});refresh();
}
export async function removeMacrocycleFocusPeriod(data:FormData){
 const c=await context(),p=await phase(field(data,"phaseId"),c);
 if(!p)return;
 await prisma.macrocycleFocusPeriod.deleteMany({where:{id:field(data,"periodId"),phaseId:p.id}});refresh();
}
export async function updateMacrocycleFocusPeriod(data:FormData){
 const c=await context(),p=await phase(field(data,"phaseId"),c),name=field(data,"name"),startDate=date(field(data,"startDate")),endDate=date(field(data,"endDate"));
 if(!p||!name||name.length>120||!startDate||!endDate||startDate<p.startDate||endDate>p.endDate||endDate<startDate)return;
 await prisma.macrocycleFocusPeriod.updateMany({where:{id:field(data,"periodId"),phaseId:p.id},data:{name,startDate,endDate,apparatusFocus:field(data,"apparatusFocus")||null,conditioningFocus:field(data,"conditioningFocus")||null,artistryFocus:field(data,"artistryFocus")||null,notes:field(data,"notes")||null}});refresh();
}

const weekDays=["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
export async function saveTrainingPlanWeek(data:FormData){const c=await context(),p=await plan(field(data,"planId"),c),dayOfWeek=field(data,"dayOfWeek");if(!p||p.status!=="ACTIVE"||!weekDays.includes(dayOfWeek))return;await prisma.trainingPlanWeek.upsert({where:{planId_dayOfWeek:{planId:p.id,dayOfWeek}},create:{planId:p.id,dayOfWeek,focus:field(data,"focus")||null,apparatusFocus:field(data,"apparatusFocus")||null,physicalFocus:field(data,"physicalFocus")||null,notes:field(data,"notes")||null,orderIndex:weekDays.indexOf(dayOfWeek)},update:{focus:field(data,"focus")||null,apparatusFocus:field(data,"apparatusFocus")||null,physicalFocus:field(data,"physicalFocus")||null,notes:field(data,"notes")||null}});refresh();}
export async function removeTrainingPlanWeek(data:FormData){const c=await context(),p=await plan(field(data,"planId"),c);if(!p)return;await prisma.trainingPlanWeek.deleteMany({where:{planId:p.id,dayOfWeek:field(data,"dayOfWeek")}});refresh();}
export async function addTrainingPlanSkillTarget(data:FormData){const c=await context(),p=await plan(field(data,"planId"),c),skillId=field(data,"skillId"),priority=field(data,"priority"),gymnastId=field(data,"gymnastId")||p?.gymnastId||null;if(!p||p.status!=="ACTIVE"||!["PRIMARY","SECONDARY"].includes(priority))return;const skill=await prisma.viaformSkill.findFirst({where:{id:skillId,discipline:"WAG",status:"ACTIVE"}});if(!skill)return;if(p.gymnastId&&gymnastId!==p.gymnastId)return;if(gymnastId){const athlete=await gymnast(gymnastId,c);if(!athlete?.groups.some(g=>g.trainingGroupId===p.trainingGroupId))return}await prisma.trainingPlanSkillTarget.upsert({where:{planId_skillId_gymnastId_priority:{planId:p.id,skillId,gymnastId,priority}},create:{planId:p.id,skillId,gymnastId,priority,notes:field(data,"notes")||null},update:{notes:field(data,"notes")||null}});refresh();}
export async function removeTrainingPlanSkillTarget(data:FormData){const c=await context(),p=await plan(field(data,"planId"),c);if(!p)return;await prisma.trainingPlanSkillTarget.deleteMany({where:{id:field(data,"targetId"),planId:p.id}});refresh();}
