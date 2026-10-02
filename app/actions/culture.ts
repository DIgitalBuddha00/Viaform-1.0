"use server";
import {revalidatePath} from "next/cache";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import {gymnastScopeWhere} from "@/app/lib/coaching-scope";
const value=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const refresh=(gymnastId?:string)=>{revalidatePath("/culture");if(gymnastId)revalidatePath("/gymnasts/"+gymnastId);revalidatePath("/athlete");revalidatePath("/guardian");};
export async function createCultureDefinition(data:FormData){
 const c=await requireAuthContext();if(!c.access.canManageProgrammesAndMethodology)return;
 const name=value(data,"name"),kind=value(data,"kind")||"RECOGNITION",holdingType=value(data,"holdingType")||"PERMANENT",visibility=value(data,"visibility")||"ATHLETE_GUARDIAN";
 if(!name||name.length>120||!["IDENTITY","TRADITION","CLUB","RECOGNITION"].includes(kind)||!["PERMANENT","ROTATING"].includes(holdingType)||!["COACH_ONLY","ATHLETE","GUARDIAN","ATHLETE_GUARDIAN"].includes(visibility))return;
 await prisma.cultureDefinition.create({data:{organisationId:c.organisation.id,name,description:value(data,"description")||null,kind,holdingType,badgeLabel:value(data,"badgeLabel")||null,criteria:value(data,"criteria")||null,visibility}});refresh();
}
export async function awardCultureRecognition(data:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;
 const definition=await prisma.cultureDefinition.findFirst({where:{id:value(data,"definitionId"),organisationId:c.organisation.id,status:"ACTIVE"}});
 const gymnast=await prisma.gymnast.findFirst({where:{id:value(data,"gymnastId"),...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});
 if(!definition||!gymnast)return;const now=new Date();
 await prisma.$transaction(async tx=>{if(definition.holdingType==="ROTATING")await tx.cultureAchievement.updateMany({where:{cultureDefinitionId:definition.id,endedAt:null},data:{endedAt:now,endedReason:"TRANSFERRED_TO_NEW_HOLDER"}});
 const existing=await tx.cultureAchievement.findFirst({where:{cultureDefinitionId:definition.id,gymnastId:gymnast.id,endedAt:null}});
 if(!existing)await tx.cultureAchievement.create({data:{organisationId:c.organisation.id,cultureDefinitionId:definition.id,gymnastId:gymnast.id,awardedByMembershipId:c.membership.id,sourceType:value(data,"sourceType")||"MANUAL",sourceRef:value(data,"sourceRef")||null,note:value(data,"note")||null}});});refresh(gymnast.id);
}
export async function endCultureRecognition(data:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;
 const item=await prisma.cultureAchievement.findFirst({where:{id:value(data,"achievementId"),organisationId:c.organisation.id,endedAt:null,gymnast:{is:gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)}}});if(!item)return;
 await prisma.cultureAchievement.update({where:{id:item.id},data:{endedAt:new Date(),endedReason:value(data,"reason")||"ENDED_BY_COACH"}});refresh(item.gymnastId);
}
export async function archiveCultureDefinition(data:FormData){
 const c=await requireAuthContext();if(!c.access.canManageProgrammesAndMethodology)return;
 await prisma.cultureDefinition.updateMany({where:{id:value(data,"definitionId"),organisationId:c.organisation.id},data:{status:"ARCHIVED"}});refresh();
}