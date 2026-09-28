"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext } from "@/app/lib/rulesets/context";

const EVENT_TYPES = ["EXTERNAL", "CONTROL"] as const;
const APPARATUS = ["VAULT", "BARS", "BEAM", "FLOOR"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function context() {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) redirect("/dashboard");
  return c;
}

async function visibleEvent(eventId: string, c: Awaited<ReturnType<typeof context>>) {
  return prisma.competitionEvent.findFirst({
    where: { id: eventId, organisationId: c.organisation.id },
  });
}

export async function createCompetitionEvent(data: FormData) {
  const c = await context();
  const name = value(data, "name");
  const eventType = value(data, "eventType");
  const eventDate = value(data, "eventDate");
  if (!name || !EVENT_TYPES.includes(eventType as (typeof EVENT_TYPES)[number]) || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return;

  const event = await prisma.competitionEvent.create({
    data: {
      organisationId: c.organisation.id,
      createdByMembershipId: c.membership.id,
      name,
      eventType,
      eventDate: new Date(eventDate + "T12:00:00.000Z"),
      location: value(data, "location") || null,
      notes: value(data, "notes") || null,
    },
  });
  revalidatePath("/competitions");
  redirect("/competitions/" + event.id);
}

export async function addCompetitionEntry(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  const gymnastId = value(data, "gymnastId");
  if (!event || event.status !== "PLANNED") return;
  const gymnast = await prisma.gymnast.findFirst({
    where: { id: gymnastId, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) },
  });
  if (!gymnast) return;
  const rules = await getGymnastRulesContext(gymnast.id, c.organisation.id);

  await prisma.competitionEntry.create({
    data: {
      competitionEventId: event.id,
      gymnastId: gymnast.id,
      rulesetProgramCode: rules?.program.code ?? null,
      rulesetProgramName: rules?.program.name ?? null,
      rulesetLevelCode: rules?.level.code ?? null,
      rulesetLevelName: rules?.level.name ?? null,
      rulesetPackageCode: rules?.package.code ?? null,
      rulesetVersionLabel: rules?.package.versionLabel ?? null,
      ageDivision: value(data, "ageDivision") || null,
      sessionLabel: value(data, "sessionLabel") || null,
      squadLabel: value(data, "squadLabel") || null,
      apparatusPlans: { create: APPARATUS.map((apparatus) => ({ apparatus })) },
    },
  }).catch(() => null);
  revalidatePath("/competitions/" + event.id);
}

export async function removeCompetitionEntry(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event || event.status !== "PLANNED") return;
  await prisma.competitionEntry.deleteMany({
    where: { id: value(data, "entryId"), competitionEventId: event.id },
  });
  revalidatePath("/competitions/" + event.id);
}

export async function updateCompetitionEntryContext(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event) return;
  const entry = await prisma.competitionEntry.findFirst({
    where: { id: value(data, "entryId"), competitionEventId: event.id },
  });
  if (!entry) return;
  await prisma.competitionEntry.update({
    where: { id: entry.id },
    data: {
      ageDivision: value(data, "ageDivision") || null,
      sessionLabel: value(data, "sessionLabel") || null,
      squadLabel: value(data, "squadLabel") || null,
      coachNote: value(data, "coachNote") || null,
    },
  });
  revalidatePath("/competitions/" + event.id);
}

export async function selectCompetitionRoutine(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event || event.status !== "PLANNED") return;
  const plan = await prisma.competitionApparatusPlan.findFirst({
    where: {
      id: value(data, "planId"),
      entry: { competitionEventId: event.id },
    },
    include: { entry: true },
  });
  if (!plan) return;
  const routineId = value(data, "routineId");
  let routine: { id: string; name: string } | null = null;
  if (routineId) {
    routine = await prisma.gymnastRoutine.findFirst({
      where: {
        id: routineId,
        gymnastId: plan.entry.gymnastId,
        apparatus: plan.apparatus,
        status: "ACTIVE",
      },
      select: { id: true, name: true },
    });
    if (!routine) return;
  }
  await prisma.competitionApparatusPlan.update({
    where: { id: plan.id },
    data: {
      routineId: routine?.id ?? null,
      routineNameSnapshot: routine?.name ?? null,
      planNote: value(data, "planNote") || null,
    },
  });
  revalidatePath("/competitions/" + event.id);
}

export async function updateCompetitionEvent(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event) return;
  const status = value(data, "status") || event.status;
  if (!["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) return;
  await prisma.competitionEvent.update({
    where: { id: event.id },
    data: {
      location: value(data, "location") || null,
      notes: value(data, "notes") || null,
      status,
    },
  });
  revalidatePath("/competitions");
  revalidatePath("/competitions/" + event.id);
}
