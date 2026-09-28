"use server";
import {revalidatePath} from "next/cache";
import {requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

const TYPES=["IMPORTANT_DATE","HOLIDAY"] as const;
const value=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const dateValue=(raw:string)=>/^\d{4}-\d{2}-\d{2}$/.test(raw)?new Date(raw+"T12:00:00.000Z"):null;

export async function createCalendarEvent(data:FormData){
 const c=await requireAuthContext();
 if(!c.access.canManageRotations)return;
 const title=value(data,"title"),eventType=value(data,"eventType"),startDate=dateValue(value(data,"startDate")),endRaw=value(data,"endDate"),endDate=endRaw?dateValue(endRaw):null;
 if(!title||!TYPES.includes(eventType as (typeof TYPES)[number])||!startDate||endRaw&&!endDate||endDate&&endDate<startDate)return;
 await prisma.calendarEvent.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,title,eventType,startDate,endDate,notes:value(data,"notes")||null}});
 revalidatePath("/calendar");
}
export async function createCalendarCompetition(data:FormData){
 const c=await requireAuthContext();
 if(!c.access.canUseCoachingWorkspace)return;
 const name=value(data,"name"),eventType=value(data,"eventType"),eventDate=dateValue(value(data,"eventDate"));
 if(!name||!["EXTERNAL","CONTROL"].includes(eventType)||!eventDate)return;
 await prisma.competitionEvent.create({data:{organisationId:c.organisation.id,createdByMembershipId:c.membership.id,name,eventType,eventDate,location:value(data,"location")||null,notes:value(data,"notes")||null}});
 revalidatePath("/calendar");revalidatePath("/competitions");
}
export async function deleteCalendarEvent(data:FormData){
 const c=await requireAuthContext();
 if(!c.access.canManageRotations)return;
 await prisma.calendarEvent.deleteMany({where:{id:value(data,"eventId"),organisationId:c.organisation.id}});
 revalidatePath("/calendar");
}
