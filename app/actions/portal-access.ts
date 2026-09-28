"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {makePassword,normaliseEmail,requireAuthContext} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
const field=(d:FormData,k:string)=>String(d.get(k)??"").trim();
async function manager(){const c=await requireAuthContext();if(!c.access.canManagePeopleAndRoles)redirect("/more?error=permission");return c}
export async function createPortalAccess(data:FormData){
 const c=await manager(),gymnastId=field(data,"gymnastId"),relationship=field(data,"relationship")==="GUARDIAN"?"GUARDIAN":"ATHLETE",displayName=field(data,"displayName"),email=normaliseEmail(data.get("email")),password=String(data.get("password")??"");
 if(!gymnastId||!displayName||!email)return;
 const gymnast=await prisma.gymnast.findFirst({where:{id:gymnastId,organisationId:c.organisation.id}});if(!gymnast)return;
 const existing=await prisma.user.findUnique({where:{email}});
 if(existing&&!existing.isActive)return;
 if(!existing&&password.length<10)return;
 const credentials=existing?null:makePassword(password);
 await prisma.$transaction(async tx=>{
   const user=existing??await tx.user.create({data:{email,displayName,passwordHash:credentials!.hash,passwordSalt:credentials!.salt}});
   await tx.athletePortalAccess.upsert({where:{userId_gymnastId_relationship:{userId:user.id,gymnastId,relationship}},create:{userId:user.id,organisationId:c.organisation.id,gymnastId,relationship},update:{status:"ACTIVE"}});
 });
 revalidatePath("/people/portal");
}
export async function setPortalAccessActive(data:FormData){
 const c=await manager(),id=field(data,"accessId"),active=field(data,"active")==="true";
 const access=await prisma.athletePortalAccess.findFirst({where:{id,organisationId:c.organisation.id}});if(!access)return;
 await prisma.athletePortalAccess.update({where:{id},data:{status:active?"ACTIVE":"INACTIVE"}});
 if(!active)await prisma.authSession.deleteMany({where:{userId:access.userId,organisationId:c.organisation.id}});
 revalidatePath("/people/portal");
}
export async function resetPortalPassword(data:FormData){
 const c=await manager(),id=field(data,"accessId"),password=String(data.get("password")??"");if(password.length<10)return;
 const access=await prisma.athletePortalAccess.findFirst({where:{id,organisationId:c.organisation.id}});if(!access)return;
 const credentials=makePassword(password);
 await prisma.$transaction([prisma.user.update({where:{id:access.userId},data:{passwordHash:credentials.hash,passwordSalt:credentials.salt}}),prisma.authSession.deleteMany({where:{userId:access.userId}})]);
 revalidatePath("/people/portal");
}
