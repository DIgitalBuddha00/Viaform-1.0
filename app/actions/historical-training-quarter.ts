"use server";
import {revalidatePath} from "next/cache";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
const STATES=["NOT_READY","PROGRESSING","CLOSE","COMPLETE"] as const;
const value=(d:FormData,k:string)=>String(d.get(k)??"").trim();
export async function updateHistoricalQuarterProgress(d:FormData){
 const c=await requireAuthContext(),focusId=value(d,"focusId"),progressState=value(d,"progressState");
 if(!focusId||!STATES.includes(progressState as typeof STATES[number]))return;
 const grant=await prisma.historicalOrganisationAccess.findFirst({where:{userId:c.loginUser.id,revokedAt:null,accessLevel:"EDIT",organisation:{status:"ARCHIVED",trainingQuarters:{some:{focuses:{some:{id:focusId}}}}}},select:{organisationId:true}});
 if(!grant)return;
 const focus=await prisma.trainingQuarterFocus.findFirst({where:{id:focusId,quarter:{organisationId:grant.organisationId}},select:{id:true,progressState:true,progressJson:true}});if(!focus)return;
 let stored:Record<string,unknown>={};try{const parsed=focus.progressJson?JSON.parse(focus.progressJson):{};if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed))stored=parsed;}catch{}
 const imported=stored.imported&&typeof stored.imported==="object"?stored.imported:stored,previous=Array.isArray(stored.overrides)?stored.overrides:[];
 const override={from:focus.progressState,to:progressState,editedAt:new Date().toISOString(),editedByUserId:c.loginUser.id};
 await prisma.trainingQuarterFocus.update({where:{id:focus.id},data:{progressState,progressJson:JSON.stringify({imported,overrides:[...previous,override]})}});revalidatePath("/analysis/history");
}

export async function mapHistoricalQuarterSkill(d:FormData){
 const c=await requireAuthContext(),focusId=value(d,"focusId"),skillId=value(d,"skillId");if(!focusId||!skillId)return;
 const grant=await prisma.historicalOrganisationAccess.findFirst({where:{userId:c.loginUser.id,revokedAt:null,accessLevel:"EDIT",organisation:{status:"ARCHIVED",trainingQuarters:{some:{focuses:{some:{id:focusId}}}}}},select:{organisationId:true}});if(!grant)return;
 const [focus,skill]=await Promise.all([
  prisma.trainingQuarterFocus.findFirst({where:{id:focusId,quarter:{organisationId:grant.organisationId}},select:{id:true,apparatus:true}}),
  prisma.viaformSkill.findFirst({where:{id:skillId,discipline:"WAG",status:"ACTIVE"},select:{id:true,apparatus:true}})
 ]);if(!focus||!skill)return;
 const apparatusMap:Record<string,string>={VAULT:"VAULT",BARS:"UNEVEN_BARS",BEAM:"BALANCE_BEAM",FLOOR:"FLOOR_EXERCISE"};
 if(apparatusMap[focus.apparatus]!==skill.apparatus)return;
 await prisma.trainingQuarterFocus.update({where:{id:focus.id},data:{skillId:skill.id}});
 revalidatePath("/analysis/history");
}
export async function clearHistoricalQuarterSkill(d:FormData){
 const c=await requireAuthContext(),focusId=value(d,"focusId");if(!focusId)return;
 const grant=await prisma.historicalOrganisationAccess.findFirst({where:{userId:c.loginUser.id,revokedAt:null,accessLevel:"EDIT",organisation:{status:"ARCHIVED",trainingQuarters:{some:{focuses:{some:{id:focusId}}}}}},select:{organisationId:true}});if(!grant)return;
 const focus=await prisma.trainingQuarterFocus.findFirst({where:{id:focusId,quarter:{organisationId:grant.organisationId}},select:{id:true}});if(!focus)return;
 await prisma.trainingQuarterFocus.update({where:{id:focus.id},data:{skillId:null}});revalidatePath("/analysis/history");
}
