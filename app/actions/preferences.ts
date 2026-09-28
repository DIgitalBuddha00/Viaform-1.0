"use server";
import {revalidatePath} from "next/cache";
import {cookies} from "next/headers";
import {isAppearanceTheme} from "@/app/lib/appearance";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import type {OverviewSurface,WidgetLayout,WidgetSize} from "@/app/lib/widget-layout";

const CATALOGUE:Record<OverviewSurface,readonly string[]>={
 HOME:["CALENDAR","ROTATIONS","TRAINING_PLAN","GROUPS","EVIDENCE","ATTENTION","NEXT","WEEK","COMPETITIONS","TESTING","ACTIVITY","HANDOFFS","PROGRAMMES","FACILITIES"],
 GROUP:["NEXT","WEEK","ROTATION","TRAINING_CONTEXT","ROSTER","PROGRESS","ACTIVITY","ATTENTION","ATTENDANCE","TESTING","ROUTINES","COMPETITIONS","PATHWAY","VOLUME","COACH_TEAM","HANDOFFS","FACILITIES","EVIDENCE_COVERAGE"],
 GYMNAST:["FOCUS","TRAINING","COMPETITION","DEVELOPMENT","ATHLETE_CONTEXT","ATTENTION","ACTIVITY","GOALS","NEXT","SCHEDULE","TESTING","ROUTINES","VAULT","ROUTINE_EVIDENCE","COMPETITION_HISTORY","PATHWAY","RULESET","ATTENDANCE","VOLUME","COACH_TEAM","EVIDENCE_COVERAGE"],
 TESTING:["ACTIVE","RECENT","COVERAGE","METRICS","GROUPS","ATTENTION","ACTIVITY","PROGRESS","GYMNASTS","APPARATUS","PHYSICAL_PREPARATION","HISTORY","PROTOCOLS","COACH_ACTIVITY"],
 COMPETITION:["SNAPSHOT","ENTRIES","SCHEDULE","ROUTINES","PREPARATION","RESULTS","ATTENTION","ACTIVITY","GROUPS","TESTING","ENTRY_STATUS","APPARATUS","ROUTINE_CHANGES","EVIDENCE_COVERAGE","COACH_TEAM","ATHLETE_PERSPECTIVE","JUDGE_PERSPECTIVE","COACH_CONTEXT","PREVIOUS"]
};
const paths:Record<OverviewSurface,string>={HOME:"/dashboard",GROUP:"/groups",GYMNAST:"/gymnasts",TESTING:"/testing",COMPETITION:"/competitions"};
const parseObject=(value:string|undefined)=>{try{const x=JSON.parse(value??"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};}catch{return{}}};
const unique=(v:unknown,allowed:readonly string[])=>Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"&&allowed.includes(x)).filter((x,i,a)=>a.indexOf(x)===i):[];
export async function saveOverviewWidgetLayout(surface:OverviewSurface,layout:WidgetLayout){
 const c=await requireAuthContext();if(!c.access.canUseCoachingWorkspace||!CATALOGUE[surface])return;
 const pref=await prisma.membershipPresentationPreference.findUnique({where:{membershipId:c.membership.id}});
 const orders=parseObject(pref?.homeWidgetOrder),hidden=parseObject(pref?.homeWidgetHidden),sizes=parseObject(pref?.homeWidgetWide),allowed=CATALOGUE[surface];
 const supplied=unique(layout.order,allowed);orders[surface]=[...supplied,...allowed.filter(x=>!supplied.includes(x))];hidden[surface]=unique(layout.hidden,allowed);
 const sizeMap:Record<string,WidgetSize>={};if(layout.sizes&&typeof layout.sizes==="object")for(const id of allowed){const v=layout.sizes[id];if(v==="S"||v==="M"||v==="L")sizeMap[id]=v}sizes[surface]=sizeMap;
 await prisma.membershipPresentationPreference.upsert({where:{membershipId:c.membership.id},create:{membershipId:c.membership.id,homeWidgetOrder:JSON.stringify(orders),homeWidgetHidden:JSON.stringify(hidden),homeWidgetWide:JSON.stringify(sizes)},update:{homeWidgetOrder:JSON.stringify(orders),homeWidgetHidden:JSON.stringify(hidden),homeWidgetWide:JSON.stringify(sizes)}});
 revalidatePath(paths[surface]);
}
export async function resetOverviewWidgetLayout(surface:OverviewSurface){
 const c=await requireAuthContext(),pref=await prisma.membershipPresentationPreference.findUnique({where:{membershipId:c.membership.id}});if(!pref)return;
 const orders=parseObject(pref.homeWidgetOrder),hidden=parseObject(pref.homeWidgetHidden),sizes=parseObject(pref.homeWidgetWide);delete orders[surface];delete hidden[surface];delete sizes[surface];
 await prisma.membershipPresentationPreference.update({where:{membershipId:c.membership.id},data:{homeWidgetOrder:JSON.stringify(orders),homeWidgetHidden:JSON.stringify(hidden),homeWidgetWide:JSON.stringify(sizes)}});
 revalidatePath(paths[surface]);
}
export async function setPresentationTheme(data:FormData){
 const c=await requireAuthContext(),raw=String(data.get("theme")??"preparation"),theme=isAppearanceTheme(raw)?raw:"preparation";
 await prisma.membershipPresentationPreference.upsert({where:{membershipId:c.membership.id},create:{membershipId:c.membership.id,theme},update:{theme}});
 (await cookies()).set("viaform_theme",theme,{sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:31536000});
 revalidatePath("/","layout");
}
