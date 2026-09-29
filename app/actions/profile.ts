"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {makePassword,makePin,normaliseEmail,requireAuthContext,setActiveMembership,verifyPassword,verifyPin} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
const f=(d:FormData,k:string)=>String(d.get(k)??"").trim();
export async function updateMyProfile(d:FormData){const c=await requireAuthContext(),displayName=f(d,"displayName"),profileImageUrl=f(d,"profileImageUrl")||null;if(!displayName)return;await prisma.user.update({where:{id:c.user.id},data:{displayName,profileImageUrl}});revalidatePath("/profile");}
export async function setMyPin(d:FormData){const c=await requireAuthContext(),pin=f(d,"pin");if(!/^\d{4,8}$/.test(pin))return;const x=makePin(pin);await prisma.organisationMembership.update({where:{id:c.membership.id},data:{pinHash:x.hash,pinSalt:x.salt}});revalidatePath("/profile");revalidatePath("/coach-select");}
export async function updateClubLogin(d:FormData){const c=await requireAuthContext();if(!c.ownerMembership.isAdministrator)return;const email=normaliseEmail(d.get("email")),current=String(d.get("currentPassword")??""),next=String(d.get("newPassword")??"");if(!email||!verifyPassword(current,c.loginUser.passwordSalt,c.loginUser.passwordHash))return;const data:any={email};if(next){if(next.length<10)return;const x=makePassword(next);data.passwordHash=x.hash;data.passwordSalt=x.salt}await prisma.user.update({where:{id:c.loginUser.id},data});revalidatePath("/profile");}
export async function chooseCoach(d:FormData){const c=await requireAuthContext(),membershipId=f(d,"membershipId"),pin=f(d,"pin");const m=await prisma.organisationMembership.findFirst({where:{id:membershipId,organisationId:c.organisation.id,isActive:true}});if(!m?.pinHash||!m.pinSalt||!verifyPin(pin,m.pinSalt,m.pinHash))redirect("/coach-select?error=invalid");await setActiveMembership(m.id);redirect("/dashboard");}
export async function lockCoach(){await setActiveMembership(null);redirect("/coach-select");}
