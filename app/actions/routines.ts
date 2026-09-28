"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext } from "@/app/lib/rulesets/context";

const APPARATUS = ["VAULT", "BARS", "BEAM", "FLOOR"] as const;
const PURPOSES = ["CURRENT", "ALTERNATIVE"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function context() {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  return c;
}

async function visibleGymnast(gymnastId: string, c: Awaited<ReturnType<typeof context>>) {
  return prisma.gymnast.findFirst({
    where: { id: gymnastId, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) },
  });
}

async function visibleRoutine(routineId: string, c: Awaited<ReturnType<typeof context>>) {
  return prisma.gymnastRoutine.findFirst({
    where: {
      id: routineId,
      gymnast: gymnastScopeWhere(c.organisation.id, c.membership.id, c.access),
    },
  });
}

export async function createGymnastRoutine(data: FormData) {
  const c = await context();
  const gymnastId = value(data, "gymnastId");
  const apparatus = value(data, "apparatus");
  const purpose = value(data, "purpose") || "CURRENT";
  const gymnast = await visibleGymnast(gymnastId, c);
  if (!gymnast || !APPARATUS.includes(apparatus as (typeof APPARATUS)[number])) return;
  if (!PURPOSES.includes(purpose as (typeof PURPOSES)[number])) return;

  const rules = await getGymnastRulesContext(gymnast.id, c.organisation.id);
  const fallbackName = apparatus === "VAULT" ? "Current vault plan" : "Current " + apparatus.toLowerCase() + " routine";
  const routine = await prisma.gymnastRoutine.create({
    data: {
      gymnastId: gymnast.id,
      apparatus,
      name: value(data, "name") || fallbackName,
      purpose,
      rulesetProgramCode: rules?.program.code ?? null,
      rulesetProgramName: rules?.program.name ?? null,
      rulesetLevelCode: rules?.level.code ?? null,
      rulesetLevelName: rules?.level.name ?? null,
      rulesetPackageCode: rules?.package.code ?? null,
      rulesetVersionLabel: rules?.package.versionLabel ?? null,
    },
  }).catch(() => null);
  if (!routine) return;
  revalidatePath("/gymnasts/" + gymnast.id);
  revalidatePath("/gymnasts/" + gymnast.id + "/routines");
  redirect("/gymnasts/" + gymnast.id + "/routines/" + routine.id);
}

export async function updateRoutineContext(data: FormData) {
  const c = await context();
  const routineId = value(data, "routineId");
  const routine = await visibleRoutine(routineId, c);
  if (!routine) return;
  const purpose = value(data, "purpose") || routine.purpose;
  if (!PURPOSES.includes(purpose as (typeof PURPOSES)[number])) return;

  await prisma.gymnastRoutine.update({
    where: { id: routine.id },
    data: {
      name: value(data, "name") || routine.name,
      purpose,
      strategyNote: value(data, "strategyNote") || null,
      pathwayNote: value(data, "pathwayNote") || null,
    },
  });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines");
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines/" + routine.id);
}

export async function archiveGymnastRoutine(data: FormData) {
  const c = await context();
  const routineId = value(data, "routineId");
  const routine = await visibleRoutine(routineId, c);
  if (!routine || routine.status !== "ACTIVE") return;
  await prisma.gymnastRoutine.update({ where: { id: routine.id }, data: { status: "ARCHIVED" } });
  revalidatePath("/gymnasts/" + routine.gymnastId + "/routines");
  redirect("/gymnasts/" + routine.gymnastId + "/routines");
}
