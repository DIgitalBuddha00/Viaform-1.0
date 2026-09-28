import { redirect } from "next/navigation";
import { currentAuthContext, currentPortalContext } from "./lib/auth";
import { prisma } from "./lib/prisma";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (await currentAuthContext()) redirect("/dashboard");
  const portal=await currentPortalContext();
  if(portal) redirect(portal.accesses.some(x=>x.relationship==="ATHLETE")?"/athlete":"/family");
  if ((await prisma.user.count()) === 0) redirect("/setup");
  redirect("/login");
}
