"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
const v=(d:FormData,k:string)=>String(d.get(k)??"").trim();
async function manager(){const c=await requireAuthContext();if(!c.access.canManageProgrammesAndMethodology)redirect("/more?error=permission");return c;}
export async function createTrustedContributor(d:FormData){
 const c=await manager(),name=v(d,"name");if(!name)return;
 await prisma.trustedContributor.create({data:{organisationId:c.organisation.id,name,roleLabel:v(d,"roleLabel")||null,organisationName:v(d,"organisationName")||null,scopeNote:v(d,"scopeNote")||null,sourceNote:v(d,"sourceNote")||null}}).catch(()=>null);
 revalidatePath("/contributors");
}
export async function setTrustedContributorStatus(d:FormData){
 const c=await manager(),id=v(d,"contributorId"),status=v(d,"status");
 if(!["ACTIVE","ARCHIVED"].includes(status))return;
 await prisma.trustedContributor.updateMany({where:{id,organisationId:c.organisation.id},data:{status}});
 revalidatePath("/contributors");revalidatePath("/methodology");
}
