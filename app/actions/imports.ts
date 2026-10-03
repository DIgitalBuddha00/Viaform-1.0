"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
async function manager(){const c=await requireAuthContext();if(!c.access.canManagePeopleAndRoles)redirect("/more");return c;}
async function allowedOrganisationIds(c:Awaited<ReturnType<typeof manager>>){const grants=await prisma.historicalOrganisationAccess.findMany({where:{userId:c.loginUser.id,revokedAt:null,organisation:{status:"ARCHIVED"}},select:{organisationId:true}});return [c.organisation.id,...grants.map(g=>g.organisationId)];}\nasync function batch(id:string,organisationIds:string[]){return prisma.importBatch.findFirst({where:{id,organisationId:{in:organisationIds}}});}

export async function createImportBatch(d:FormData){
 const c=await manager(),name=v(d,"name"),sourceKind=v(d,"sourceKind"),idempotencyKey=v(d,"idempotencyKey");
 if(!name||!sourceKind||!idempotencyKey)return;
 await prisma.importBatch.create({data:{organisationId:c.organisation.id,name,sourceKind,idempotencyKey,createdByUserId:c.loginUser.id}}).catch(()=>null);
 revalidatePath("/imports");
}

export async function registerImportSource(d:FormData){
 const c=await manager(),batchId=v(d,"batchId"),sourceKey=v(d,"sourceKey"),sourceType=v(d,"sourceType"),name=v(d,"name");
 const b=await batch(batchId,await allowedOrganisationIds(c));if(!b||!sourceKey||!sourceType||!name)return;
 await prisma.importSource.create({data:{batchId,sourceKey,sourceType,name,externalRef:v(d,"externalRef")||null,locatorJson:JSON.stringify({reference:v(d,"externalRef")||null})}}).catch(()=>null);
 revalidatePath("/imports");
}

export async function stageImportCandidate(d:FormData){
 const c=await manager(),batchId=v(d,"batchId"),sourceId=v(d,"sourceId")||null,candidateKey=v(d,"candidateKey"),entityType=v(d,"entityType"),dataRole=v(d,"dataRole"),visibility=v(d,"visibility"),importTreatment=v(d,"importTreatment"),proposedAction=v(d,"proposedAction"),payload=v(d,"payload");
 const b=await batch(batchId,await allowedOrganisationIds(c));if(!b||!candidateKey||!entityType||!dataRole||!visibility||!importTreatment||!proposedAction||!payload)return;
 if(sourceId){const source=await prisma.importSource.findFirst({where:{id:sourceId,batchId}});if(!source)return;}
 await prisma.importCandidate.create({data:{batchId,sourceId,candidateKey,entityType,sourceEntityKey:v(d,"sourceEntityKey")||null,dataRole,visibility,importTreatment,proposedAction,payloadJson:JSON.stringify({raw:payload}),interpretationJson:JSON.stringify({note:v(d,"interpretation")||null})}}).catch(()=>null);
 await prisma.importBatch.update({where:{id:batchId},data:{status:"REVIEWING"}}).catch(()=>null);
 revalidatePath("/imports");
}

export async function reviewImportCandidate(d:FormData){
 const c=await manager(),candidateId=v(d,"candidateId"),reviewStatus=v(d,"reviewStatus");
 if(!["APPROVED","REJECTED","HOLD","PENDING"].includes(reviewStatus))return;
 const candidate=await prisma.importCandidate.findFirst({where:{id:candidateId,batch:{organisationId:{in:await allowedOrganisationIds(c)}}}});if(!candidate)return;
 await prisma.importCandidate.update({where:{id:candidateId},data:{reviewStatus,reviewedByUserId:reviewStatus==="PENDING"?null:c.loginUser.id,reviewedAt:reviewStatus==="PENDING"?null:new Date()}});
 revalidatePath("/imports");
}
