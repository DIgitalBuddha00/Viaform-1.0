"use server";
import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere, gymnastScopeWhere } from "@/app/lib/coaching-scope";

const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const roles=(value:string)=>{try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed.filter(x=>typeof x==="string"):[]}catch{return []}};

export async function createCollaborationNote(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;
 const recipientMembershipId=v(d,"recipientMembershipId"),gymnastId=v(d,"gymnastId")||null,trainingGroupId=v(d,"trainingGroupId")||null,message=v(d,"message"),priority=v(d,"priority")==="IMPORTANT"?"IMPORTANT":"NORMAL";
 if(!recipientMembershipId||recipientMembershipId===c.membership.id||!message||message.length>4000)return;
 const recipient=await prisma.organisationMembership.findFirst({where:{id:recipientMembershipId,organisationId:c.organisation.id,isActive:true}});if(!recipient)return;
 if(gymnastId){const gymnast=await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});if(!gymnast)return}
 if(trainingGroupId){const group=await prisma.trainingGroup.findFirst({where:{id:trainingGroupId,...groupScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}});if(!group)return}
 await prisma.coachCollaborationNote.create({data:{organisationId:c.organisation.id,authorMembershipId:c.membership.id,recipientMembershipId,gymnastId,trainingGroupId,priority,authorRoleSnapshot:JSON.stringify(roles(c.membership.coachingRoles)),message}});
 revalidatePath("/collaboration");revalidatePath("/updates");
}

export async function acknowledgeCollaborationNote(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;const id=v(d,"noteId");
 await prisma.coachCollaborationNote.updateMany({where:{id,organisationId:c.organisation.id,recipientMembershipId:c.membership.id,status:"OPEN",acknowledgedAt:null},data:{acknowledgedAt:new Date()}});
 revalidatePath("/collaboration");revalidatePath("/updates");
}

export async function resolveCollaborationNote(d:FormData){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace)return;const id=v(d,"noteId");
 const note=await prisma.coachCollaborationNote.findFirst({where:{id,organisationId:c.organisation.id,status:"OPEN"}});if(!note||![note.authorMembershipId,note.recipientMembershipId].includes(c.membership.id))return;
 await prisma.coachCollaborationNote.update({where:{id},data:{status:"RESOLVED",resolvedAt:new Date(),resolvedByMembershipId:c.membership.id}});
 revalidatePath("/collaboration");revalidatePath("/updates");
}
