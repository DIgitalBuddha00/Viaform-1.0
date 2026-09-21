import { redirect } from "next/navigation";
import { currentAuthContext } from "./lib/auth";
import { prisma } from "./lib/prisma";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (await currentAuthContext()) redirect("/dashboard");
  if ((await prisma.user.count()) === 0) redirect("/setup");
  redirect("/login");
}
