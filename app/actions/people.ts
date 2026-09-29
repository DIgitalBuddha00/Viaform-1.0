"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COACHING_ROLES, DELEGATED_CAPABILITIES } from "@/app/lib/access-control";
import { createSession, makePassword, makePin, normaliseEmail, requireAuthContext, verifyPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const field=(data:FormData,key:string)=>String(data.get(key)??"").trim();
const checked=(data:FormData,key:string)=>data.getAll(key).map(String);
const allowed=<T extends string>(values:string[],options:readonly T[])=>Array.from(new Set(values.filter((value):value is T=>options.includes(value as T))));
const inviteHash=(token:string)=>createHash("sha256").update(token).digest("hex");

async function peopleManager(){const c=await requireAuthContext();if(!c.access.canManagePeopleAndRoles)redirect("/more?error=permission");return c;}
async function member(id:string,organisationId:string){return prisma.organisationMembership.findFirst({where:{id,organisationId},include:{user:true}});}

export async function createStaffInvitation(data:FormData){
  const c=await peopleManager(),email=normaliseEmail(data.get("email")),displayName=field(data,"displayName");
  if(!email||!displayName)return;
  const existingMembership=await prisma.organisationMembership.findFirst({where:{organisationId:c.organisation.id,user:{email}}});
  if(existingMembership)return;
  const roles=allowed(checked(data,"coachingRoles"),COACHING_ROLES),capabilities=allowed(checked(data,"delegatedCapabilities"),DELEGATED_CAPABILITIES);
  const token=randomBytes(32).toString("base64url"),expiresAt=new Date(Date.now()+7*86400000);
  await prisma.$transaction(async tx=>{
    await tx.staffInvitation.updateMany({where:{organisationId:c.organisation.id,email,status:"PENDING"},data:{status:"CANCELLED"}});
    await tx.staffInvitation.create({data:{organisationId:c.organisation.id,email,displayName,tokenHash:inviteHash(token),isAdministrator:c.access.canManageAdministratorRole&&data.get("isAdministrator")==="on",coachingRoles:JSON.stringify(roles),delegatedCapabilities:JSON.stringify(capabilities),expiresAt}});
  });
  const h=await headers(),host=h.get("x-forwarded-host")??h.get("host"),protocol=h.get("x-forwarded-proto")??"https";
  const inviteUrl=host?protocol+"://"+host+"/invite/"+token:"/invite/"+token;
  redirect("/people?invite="+encodeURIComponent(inviteUrl));
}

export async function cancelStaffInvitation(data:FormData){const c=await peopleManager();const id=field(data,"invitationId");await prisma.staffInvitation.updateMany({where:{id,organisationId:c.organisation.id,status:"PENDING"},data:{status:"CANCELLED"}});revalidatePath("/people");}

export async function acceptStaffInvitation(data:FormData){
  const token=field(data,"token"),password=String(data.get("password")??""),displayName=field(data,"displayName");
  if(!token||password.length<10)redirect("/invite/"+encodeURIComponent(token)+"?error=invalid");
  const invitation=await prisma.staffInvitation.findUnique({where:{tokenHash:inviteHash(token)},include:{organisation:true}});
  if(!invitation||invitation.status!=="PENDING"||invitation.expiresAt<=new Date())redirect("/invite/"+encodeURIComponent(token)+"?error=expired");
  const existing=await prisma.user.findUnique({where:{email:invitation.email},include:{memberships:true}});
  if(existing&&!verifyPassword(password,existing.passwordSalt,existing.passwordHash))redirect("/invite/"+encodeURIComponent(token)+"?error=password");
  if(existing?.memberships.some(m=>m.organisationId===invitation.organisationId))redirect("/login");
  const credentials=existing?null:makePassword(password);
  const user=await prisma.$transaction(async tx=>{
    const u=existing??await tx.user.create({data:{email:invitation.email,displayName:displayName||invitation.displayName||invitation.email,passwordHash:credentials!.hash,passwordSalt:credentials!.salt}});
    if(existing&&displayName)await tx.user.update({where:{id:u.id},data:{displayName,isActive:true}});
    await tx.organisationMembership.create({data:{userId:u.id,organisationId:invitation.organisationId,isAdministrator:invitation.isAdministrator,coachingRoles:invitation.coachingRoles,delegatedCapabilities:invitation.delegatedCapabilities}});
    await tx.staffInvitation.update({where:{id:invitation.id},data:{status:"ACCEPTED",acceptedAt:new Date(),acceptedByUserId:u.id}});
    return u;
  });
  await createSession(user.id,invitation.organisationId);
  redirect("/dashboard");
}

export async function updateStaffAccess(data:FormData){const c=await peopleManager(),target=await member(field(data,"membershipId"),c.organisation.id);if(!target||(target.isAdministrator&&!c.access.canManageAdministratorRole))return;const roles=allowed(checked(data,"coachingRoles"),COACHING_ROLES),capabilities=allowed(checked(data,"delegatedCapabilities"),DELEGATED_CAPABILITIES);const update:{coachingRoles:string;delegatedCapabilities:string;isAdministrator?:boolean}={coachingRoles:JSON.stringify(roles),delegatedCapabilities:JSON.stringify(capabilities)};if(c.access.canManageAdministratorRole)update.isAdministrator=target.id===c.membership.id?true:data.get("isAdministrator")==="on";await prisma.organisationMembership.update({where:{id:target.id},data:update});revalidatePath("/people");}
export async function updateStaffIdentity(data:FormData){const c=await peopleManager(),target=await member(field(data,"membershipId"),c.organisation.id),displayName=field(data,"displayName");if(!target||!displayName)return;await prisma.user.update({where:{id:target.userId},data:{displayName}});revalidatePath("/people");}
export async function setStaffActive(data:FormData){const c=await peopleManager(),target=await member(field(data,"membershipId"),c.organisation.id);if(!target||target.id===c.membership.id||(target.isAdministrator&&!c.access.canManageAdministratorRole))return;const isActive=field(data,"active")==="true";await prisma.organisationMembership.update({where:{id:target.id},data:{isActive}});if(!isActive)await prisma.authSession.deleteMany({where:{userId:target.userId,organisationId:c.organisation.id}});revalidatePath("/people");}
export async function resetStaffPassword(data:FormData){const c=await peopleManager(),target=await member(field(data,"membershipId"),c.organisation.id),password=String(data.get("password")??"");if(!target||password.length<10||(target.isAdministrator&&!c.access.canManageAdministratorRole))return;const credentials=makePassword(password);await prisma.$transaction([prisma.user.update({where:{id:target.userId},data:{passwordHash:credentials.hash,passwordSalt:credentials.salt}}),prisma.authSession.deleteMany({where:{userId:target.userId}})]);revalidatePath("/people");}
export async function resetStaffPin(data:FormData){const c=await peopleManager(),target=await member(field(data,"membershipId"),c.organisation.id),pin=field(data,"pin");if(!target||!/^[0-9]{4,8}$/.test(pin))return;const x=makePin(pin);await prisma.organisationMembership.update({where:{id:target.id},data:{pinHash:x.hash,pinSalt:x.salt,pinFailedAttempts:0,pinLockedUntil:null}});revalidatePath("/people");}
