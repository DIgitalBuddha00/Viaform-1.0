"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
async function manager(){const c=await requireAuthContext();if(!c.access.canManagePeopleAndRoles)redirect("/more");return c;}
async function allowedOrganisationIds(c:Awaited<ReturnType<typeof manager>>){const grants=await prisma.historicalOrganisationAccess.findMany({where:{userId:c.loginUser.id,revokedAt:null,organisation:{status:"ARCHIVED"}},select:{organisationId:true}});return [c.organisation.id,...grants.map(g=>g.organisationId)];}
async function batch(id:string,organisationIds:string[]){return prisma.importBatch.findFirst({where:{id,organisationId:{in:organisationIds}}});}

export async function createImportBatch(d:FormData){
 const c=await manager(),name=v(d,"name"),sourceKind=v(d,"sourceKind"),idempotencyKey=v(d,"idempotencyKey"),organisationId=v(d,"organisationId")||c.organisation.id;
 if(!name||!sourceKind||!idempotencyKey)return;const allowed=await allowedOrganisationIds(c);if(!allowed.includes(organisationId))return;
 await prisma.importBatch.create({data:{organisationId,name,sourceKind,idempotencyKey,createdByUserId:c.loginUser.id}}).catch(()=>null);
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


type StructuredImportPayload={data?:Record<string,unknown>;quarterFocusItems?:Array<Record<string,unknown>>};
const parsedPayload=(json:string):StructuredImportPayload|null=>{try{const p=JSON.parse(json);return p&&typeof p==="object"?p:null}catch{return null}};
const dateOrNull=(x:unknown)=>typeof x==="string"&&x?new Date(x):null;

export async function executeApprovedImportCandidate(d:FormData){
 const c=await manager(),candidateId=v(d,"candidateId"),allowed=await allowedOrganisationIds(c);
 const candidate=await prisma.importCandidate.findFirst({where:{id:candidateId,reviewStatus:"APPROVED",batch:{organisationId:{in:allowed}}},include:{batch:true,source:true}});
 if(!candidate||candidate.importTreatment!=="STAGE"||candidate.proposedAction!=="CREATE")return;
 const existing=await prisma.importRecordLink.findFirst({where:{candidateId:candidate.id,rolledBackAt:null}});if(existing)return;
 const payload=parsedPayload(candidate.payloadJson),data=payload?.data;if(!data)return;

 if(candidate.entityType==="GYMNAST"){
  const name=typeof data.name==="string"?data.name.trim():"";if(!name||!candidate.sourceEntityKey)return;
  const dob=dateOrNull(data.dateOfBirth),status=typeof data.status==="string"?data.status:"ARCHIVED";
  await prisma.$transaction(async tx=>{
   const mapped=await tx.sourceIdentityMapping.findUnique({where:{organisationId_sourceNamespace_entityType_sourceEntityKey:{organisationId:candidate.batch.organisationId,sourceNamespace:candidate.batch.idempotencyKey,entityType:"GYMNAST",sourceEntityKey:candidate.sourceEntityKey!}}});
   if(mapped)return;
   const gymnast=await tx.gymnast.create({data:{organisationId:candidate.batch.organisationId,name,dateOfBirth:dob,status}});
   await tx.sourceIdentityMapping.create({data:{organisationId:candidate.batch.organisationId,sourceNamespace:candidate.batch.idempotencyKey,entityType:"GYMNAST",sourceEntityKey:candidate.sourceEntityKey!,targetType:"GYMNAST",targetId:gymnast.id,confidence:candidate.confidence,resolvedByUserId:c.loginUser.id,metadataJson:JSON.stringify({importBatchId:candidate.batchId,sourceId:candidate.sourceId})}});
   await tx.importRecordLink.create({data:{batchId:candidate.batchId,sourceId:candidate.sourceId,candidateId:candidate.id,targetType:"GYMNAST",targetId:gymnast.id,operation:"CREATE",ownership:"CREATED_BY_BATCH",sourceLocatorJson:candidate.source?.locatorJson??"{}",afterSnapshotJson:JSON.stringify({name:gymnast.name,status:gymnast.status,dateOfBirth:gymnast.dateOfBirth})}});
  });
 }else if(candidate.entityType==="TRAINING_QUARTERS"){
  const gymnastSourceKey=typeof data.gymnastSourceKey==="string"?data.gymnastSourceKey:"";if(!gymnastSourceKey||!candidate.sourceId||!Array.isArray(payload?.quarterFocusItems)||!payload.quarterFocusItems.length)return;
  const mapping=await prisma.sourceIdentityMapping.findUnique({where:{organisationId_sourceNamespace_entityType_sourceEntityKey:{organisationId:candidate.batch.organisationId,sourceNamespace:candidate.batch.idempotencyKey,entityType:"GYMNAST",sourceEntityKey:gymnastSourceKey}}});if(!mapping)return;
  const grouped=new Map<string,{year:number;quarter:number;items:Array<Record<string,unknown>>}>();
  for(const item of payload.quarterFocusItems){
   const year=Number(item.year),quarter=Number(item.quarter),apparatus=typeof item.apparatus==="string"?item.apparatus:"",priority=typeof item.priority==="string"?item.priority:"",skillText=typeof item.skillText==="string"?item.skillText.trim():"";
   if(!Number.isInteger(year)||![1,2,3,4].includes(quarter)||!apparatus||!["PRIMARY","SECONDARY"].includes(priority)||!skillText)throw new Error("Invalid training quarter focus item");
   const key=year+"-"+quarter,current=grouped.get(key)??{year,quarter,items:[]};current.items.push(item);grouped.set(key,current);
  }
  await prisma.$transaction(async tx=>{
   for(const group of [...grouped.values()].sort((a,b)=>a.year-b.year||a.quarter-b.quarter)){
    const startMonth=(group.quarter-1)*3;
    const startDate=new Date(Date.UTC(group.year,startMonth,1));
    const endDate=new Date(Date.UTC(group.year,startMonth+3,0,23,59,59,999));
    const focuses=group.items.map((item,orderIndex)=>({apparatus:String(item.apparatus),priority:String(item.priority),skillText:String(item.skillText).trim(),sourceSkillKey:typeof item.sourceSkillKey==="string"?item.sourceSkillKey:null,progressState:typeof item.progressState==="string"?item.progressState:null,progressJson:item.progressJson?JSON.stringify(item.progressJson):null,orderIndex}));
    const quarter=await tx.trainingQuarter.create({data:{organisationId:candidate.batch.organisationId,gymnastId:mapping.targetId,year:group.year,quarter:group.quarter,startDate,endDate,status:"HISTORICAL",sourceStatus:typeof data.sourceStatus==="string"?data.sourceStatus:"HISTORICAL",sourceType:"IMPORT",sourceId:candidate.sourceId,candidateId:candidate.id,notes:typeof data.notes==="string"?data.notes:null,focuses:{create:focuses}}});
    await tx.importRecordLink.create({data:{batchId:candidate.batchId,sourceId:candidate.sourceId,candidateId:candidate.id,targetType:"TRAINING_QUARTER",targetId:quarter.id,operation:"CREATE",ownership:"CREATED_BY_BATCH",sourceLocatorJson:candidate.source?.locatorJson??"{}",afterSnapshotJson:JSON.stringify({year:quarter.year,quarter:quarter.quarter,gymnastId:quarter.gymnastId,focusCount:focuses.length})}});
   }
  });
 }else if(["TRAINING_PLAN","MACROCYCLE"].includes(candidate.entityType)){
  const gymnastSourceKey=typeof data.gymnastSourceKey==="string"?data.gymnastSourceKey:"";if(!gymnastSourceKey||!candidate.sourceId)return;
  const mapping=await prisma.sourceIdentityMapping.findUnique({where:{organisationId_sourceNamespace_entityType_sourceEntityKey:{organisationId:candidate.batch.organisationId,sourceNamespace:candidate.batch.idempotencyKey,entityType:"GYMNAST",sourceEntityKey:gymnastSourceKey}}});if(!mapping)return;
  const title=typeof data.title==="string"?data.title.trim():"";if(!title)return;
  const sourceStatus=typeof data.sourceStatus==="string"?data.sourceStatus:null;
  const notes=typeof data.notes==="string"?data.notes:null;
  await prisma.$transaction(async tx=>{
   const record=await tx.historicalPlanningRecord.create({data:{organisationId:candidate.batch.organisationId,gymnastId:mapping.targetId,sourceId:candidate.sourceId,candidateId:candidate.id,recordType:candidate.entityType,title,startDate:dateOrNull(data.startDate),endDate:dateOrNull(data.endDate),sourceStatus,payloadJson:JSON.stringify(data),notes}});
   if(candidate.entityType==="TRAINING_QUARTERS"&&Array.isArray(payload?.quarterFocusItems)){
    for(const [orderIndex,item] of payload.quarterFocusItems.entries()){
     const year=Number(item.year),quarter=Number(item.quarter),apparatus=typeof item.apparatus==="string"?item.apparatus:"",priority=typeof item.priority==="string"?item.priority:"",skillText=typeof item.skillText==="string"?item.skillText.trim():"";
     if(!Number.isInteger(year)||![1,2,3,4].includes(quarter)||!apparatus||!["PRIMARY","SECONDARY"].includes(priority)||!skillText)throw new Error("Invalid historical quarter focus item");
     await tx.historicalQuarterFocus.create({data:{planningRecordId:record.id,year,quarter,startDate:dateOrNull(item.startDate),endDate:dateOrNull(item.endDate),apparatus,priority,skillText,sourceSkillKey:typeof item.sourceSkillKey==="string"?item.sourceSkillKey:null,orderIndex}});
    }
   }
   await tx.importRecordLink.create({data:{batchId:candidate.batchId,sourceId:candidate.sourceId,candidateId:candidate.id,targetType:"HISTORICAL_PLANNING_RECORD",targetId:record.id,operation:"CREATE",ownership:"CREATED_BY_BATCH",sourceLocatorJson:candidate.source?.locatorJson??"{}",afterSnapshotJson:JSON.stringify({recordType:record.recordType,title:record.title,gymnastId:record.gymnastId})}});
  });
 }else return;
 await prisma.importBatch.update({where:{id:candidate.batchId},data:{status:"IMPORTING",importedAt:new Date()}}).catch(()=>null);
 revalidatePath("/imports");revalidatePath("/analysis/history");
}
