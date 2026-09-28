"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {isAppearanceTheme} from "@/app/lib/appearance";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
const HOME_WIDGETS=["NEXT","GROUPS","EVIDENCE","ATTENTION","WEEK","COMPETITIONS"] as const;
type HomeWidget=(typeof HOME_WIDGETS)[number];
type Layout={order:string[];hidden:string[];wide:string[]};
const clean=(values:unknown):HomeWidget[]=>Array.isArray(values)?values.filter((x):x is HomeWidget=>typeof x==="string"&&HOME_WIDGETS.includes(x as HomeWidget)).filter((x,i,a)=>a.indexOf(x)===i):[];
export async function saveHomeWidgetLayout(layout:Layout){
 const c=await requireAuthContext();
 if(!c.access.canUseCoachingWorkspace)return;
 const supplied=clean(layout.order),order=[...supplied,...HOME_WIDGETS.filter(x=>!supplied.includes(x))],hidden=clean(layout.hidden),wide=clean(layout.wide);
 await prisma.membershipPresentationPreference.upsert({where:{membershipId:c.membership.id},create:{membershipId:c.membership.id,homeWidgetOrder:JSON.stringify(order),homeWidgetHidden:JSON.stringify(hidden),homeWidgetWide:JSON.stringify(wide)},update:{homeWidgetOrder:JSON.stringify(order),homeWidgetHidden:JSON.stringify(hidden),homeWidgetWide:JSON.stringify(wide)}});
 revalidatePath("/dashboard");
}
export async function resetHomeWidgetLayout(){
 const c=await requireAuthContext();
 await prisma.membershipPresentationPreference.deleteMany({where:{membershipId:c.membership.id}});
 revalidatePath("/dashboard");
}

export async function setPresentationTheme(data:FormData){
 const c=await requireAuthContext(),raw=String(data.get("theme")??"preparation"),theme=isAppearanceTheme(raw)?raw:"preparation";
 await prisma.membershipPresentationPreference.upsert({where:{membershipId:c.membership.id},create:{membershipId:c.membership.id,theme},update:{theme}});
 (await cookies()).set("viaform_theme",theme,{sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:31536000});
 revalidatePath("/", "layout");
}
