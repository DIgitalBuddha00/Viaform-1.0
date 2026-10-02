"use server";
import {revalidatePath} from "next/cache";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {gymnastScopeWhere} from "@/app/lib/coaching-scope";
const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const PRIORITIES=["PRIMARY","SECONDARY","EXPLORATORY"] as const;
export async function setGymnastTrainingPriority(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;const gymnastId=v(d,"gymnastId"),priority=v(d,"priority"),focus=v(d,"focus"),rationale=v(d,"rationale");
 if(!PRIORITIES.includes(priority as typeof PRIORITIES[number])||!focus)return;
 const g=await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});if(!g)return;
 const now=new Date();await prisma.$transaction(async tx=>{await tx.gymnastTrainingPriority.updateMany({where:{organisationId:c.organisation.id,gymnastId,endedAt:null},data:{endedAt:now,endedByMembershipId:c.membership.id,endReason:"REPLACED"}});await tx.gymnastTrainingPriority.create({data:{organisationId:c.organisation.id,gymnastId,priority,focus,rationale:rationale||null,setByMembershipId:c.membership.id,startedAt:now}})});revalidatePath("/gymnasts/"+gymnastId);
}
export async function clearGymnastTrainingPriority(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;const gymnastId=v(d,"gymnastId"),reason=v(d,"reason")||"NO_CURRENT_PRIORITY";
 const g=await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});if(!g)return;
 await prisma.gymnastTrainingPriority.updateMany({where:{organisationId:c.organisation.id,gymnastId,endedAt:null},data:{endedAt:new Date(),endedByMembershipId:c.membership.id,endReason:reason}});revalidatePath("/gymnasts/"+gymnastId);
}
