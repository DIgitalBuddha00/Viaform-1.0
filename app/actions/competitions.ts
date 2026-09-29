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
  revalidatePath("/calendar");
  redirect("/competitions/" + event.id);
}

export async function addCompetitionEntry(data: FormData) {
  const c = await context();
  const gymnastId = value(data, "gymnastId");
  const [event, gymnast] = await Promise.all([
    visibleEvent(value(data, "eventId"), c),
    prisma.gymnast.findFirst({ where: { id: gymnastId, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) } }),
  ]);
  if (!event || event.status !== "PLANNED") return;
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
  revalidatePath("/calendar");
}


const PERFORMANCE_STATUS = ["NOT_RECORDED", "COMPETED", "SCRATCHED", "EXHIBITION"] as const;
const optionalNumber = (data: FormData, key: string) => {
  const raw = value(data, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export async function recordCompetitionPerformance(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event || event.status === "CANCELLED") return;
  const plan = await prisma.competitionApparatusPlan.findFirst({
    where: { id: value(data, "planId"), entry: { competitionEventId: event.id } },
    include: { performance: true },
  });
  if (!plan) return;
  const status = value(data, "performanceStatus") || "NOT_RECORDED";
  if (!PERFORMANCE_STATUS.includes(status as (typeof PERFORMANCE_STATUS)[number])) return;
  const difficultyScore = optionalNumber(data, "difficultyScore");
  const executionScore = optionalNumber(data, "executionScore");
  const penalty = optionalNumber(data, "penalty");
  const finalScore = optionalNumber(data, "finalScore");
  const rankRaw = optionalNumber(data, "rank");
  if (difficultyScore === undefined || executionScore === undefined || penalty === undefined || finalScore === undefined || rankRaw === undefined) return;
  if ([difficultyScore, executionScore, penalty, finalScore].some((item) => typeof item === "number" && item < 0)) return;
  if (rankRaw !== null && (!Number.isInteger(rankRaw) || rankRaw < 1)) return;

  const payload = {
    status,
    difficultyScore,
    executionScore,
    penalty,
    finalScore,
    rank: rankRaw,
    warmupNote: value(data, "warmupNote") || null,
    judgeNote: value(data, "judgeNote") || null,
    coachObservation: value(data, "coachObservation") || null,
    performedAt: status === "COMPETED" || status === "EXHIBITION" ? new Date() : null,
  };
  await prisma.competitionPerformance.upsert({
    where: { competitionApparatusPlanId: plan.id },
    create: { competitionApparatusPlanId: plan.id, ...payload },
    update: payload,
  });
  revalidatePath("/competitions/" + event.id);
  revalidatePath("/progress");
}

export async function recordCompetitionAthleteReflection(data: FormData) {
  const c = await context();
  const event = await visibleEvent(value(data, "eventId"), c);
  if (!event || event.status === "CANCELLED") return;
  const plan = await prisma.competitionApparatusPlan.findFirst({
    where: { id: value(data, "planId"), entry: { competitionEventId: event.id } },
    include: { performance: true },
  });
  if (!plan) return;
  const performance = plan.performance ?? await prisma.competitionPerformance.create({
    data: { competitionApparatusPlanId: plan.id },
  });
  const ratingRaw = optionalNumber(data, "rating");
  const confidenceRaw = optionalNumber(data, "confidence");
  if (ratingRaw === undefined || confidenceRaw === undefined) return;
  if (ratingRaw !== null && (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5)) return;
  if (confidenceRaw !== null && (!Number.isInteger(confidenceRaw) || confidenceRaw < 1 || confidenceRaw > 10)) return;
  const prepared = value(data, "feltPrepared");
  if (prepared && !["YES", "NO"].includes(prepared)) return;

  await prisma.competitionAthleteReflection.upsert({
    where: { competitionPerformanceId: performance.id },
    create: {
      competitionPerformanceId: performance.id,
      rating: ratingRaw,
      confidence: confidenceRaw,
      feltPrepared: prepared ? prepared === "YES" : null,
      whatFeltGood: value(data, "whatFeltGood") || null,
      whatFeltHard: value(data, "whatFeltHard") || null,
      athleteNote: value(data, "athleteNote") || null,
    },
    update: {
      rating: ratingRaw,
      confidence: confidenceRaw,
      feltPrepared: prepared ? prepared === "YES" : null,
      whatFeltGood: value(data, "whatFeltGood") || null,
      whatFeltHard: value(data, "whatFeltHard") || null,
      athleteNote: value(data, "athleteNote") || null,
      reflectedAt: new Date(),
    },
  });
  revalidatePath("/competitions/" + event.id);
}
