"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";

const value=(d:FormData,k:string)=>String(d.get(k)??"").trim();
const numberOrNull=(d:FormData,k:string)=>{const v=value(d,k);if(!v)return null;const n=Number(v);return Number.isFinite(n)?n:null};

async function videoContext(){
  const c=await requireAuthContext();
  if(!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  return c;
}

export async function createVideoAsset(data:FormData){
  const c=await videoContext();
  const title=value(data,"title"); if(!title)return;
  const gymnastId=value(data,"gymnastId")||null;const routineId=value(data,"routineId")||null;const routineItemId=value(data,"routineItemId")||null;
  if(gymnastId&&!await prisma.gymnast.findFirst({where:{id:gymnastId,...gymnastScopeWhere(c.organisation.id,c.membership.id,c.access)},select:{id:true}}))return;
  if(routineId&&(!gymnastId||!await prisma.gymnastRoutine.findFirst({where:{id:routineId,gymnastId,status:"ACTIVE"},select:{id:true}})))return;
  const asset=await prisma.videoAsset.create({data:{
    organisationId:c.organisation.id,createdByMembershipId:c.membership.id,title,gymnastId,routineId,routineItemId,
    apparatus:value(data,"apparatus")||null,skillLabel:value(data,"skillLabel")||null,
    cameraAngle:value(data,"cameraAngle")||null,sourceType:"LOCAL",
    fileName:value(data,"fileName")||null,mimeType:value(data,"mimeType")||null,notes:value(data,"notes")||null
  }});
  redirect("/video/"+asset.id);
}

export async function updateVideoAssetMetadata(data:FormData){const c=await videoContext(),id=value(data,"videoAssetId");const asset=await prisma.videoAsset.findFirst({where:{id,organisationId:c.organisation.id,status:"ACTIVE"},select:{id:true}});if(!asset)return;await prisma.videoAsset.update({where:{id},data:{fileName:value(data,"fileName")||undefined,mimeType:value(data,"mimeType")||undefined,durationSeconds:numberOrNull(data,"durationSeconds")??undefined}});revalidatePath("/video/"+id);}

export async function saveVideoAnalysis(data:FormData){
  const c=await videoContext(); const videoAssetId=value(data,"videoAssetId");
  const asset=await prisma.videoAsset.findFirst({where:{id:videoAssetId,organisationId:c.organisation.id,status:"ACTIVE"},select:{id:true}});
  if(!asset)return;
  let annotationJson=value(data,"annotationJson")||"[]"; try{const p=JSON.parse(annotationJson);if(!Array.isArray(p))annotationJson="[]"}catch{annotationJson="[]"}
  const rawTags=value(data,"technicalTags"); const tags=rawTags.split(",").map(x=>x.trim()).filter(Boolean).slice(0,30);
  await prisma.videoAnalysis.create({data:{
    organisationId:c.organisation.id,videoAssetId,authorMembershipId:c.membership.id,
    title:value(data,"title")||"Video analysis",timestampSeconds:numberOrNull(data,"timestampSeconds"),
    rangeStartSeconds:numberOrNull(data,"rangeStartSeconds"),rangeEndSeconds:numberOrNull(data,"rangeEndSeconds"),
    playbackRate:numberOrNull(data,"playbackRate"),zoom:numberOrNull(data,"zoom"),panX:numberOrNull(data,"panX"),panY:numberOrNull(data,"panY"),
    comparisonMode:value(data,"comparisonMode")||null,comparisonOffset:numberOrNull(data,"comparisonOffset"),
    overlayOpacity:numberOrNull(data,"overlayOpacity"),annotationJson,technicalTags:JSON.stringify(tags),
    observation:value(data,"observation")||null
  }});
  revalidatePath("/video/"+videoAssetId);
}
