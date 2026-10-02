"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function reviewContext(sessionId: string) {
  const context = await requireAuthContext();
  if (!context.access.canUseCoachingWorkspace) redirect("/dashboard");
  const session = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      organisationId: context.organisation.id,
      status: "COMPLETED",
      trainingGroup: groupScopeWhere(context.organisation.id, context.membership.id, context.access),
    },
    select: { id: true },
  });
  return { context, session };
}

export async function saveTrainingSessionReview(data: FormData) {
  const sessionId = value(data, "sessionId");
  const summary = value(data, "summary") || null;
  const carryForward = value(data, "carryForward") || null;
  const { context, session } = await reviewContext(sessionId);
  if (!session) return;
  await prisma.trainingSessionReview.upsert({
    where: { sessionId },
    create: {
      organisationId: context.organisation.id,
      sessionId,
      summary,
      carryForward,
      reviewedByMembershipId: context.membership.id,
    },
    update: {
      summary,
      carryForward,
      reviewedByMembershipId: context.membership.id,
      reviewedAt: new Date(),
    },
  });
  revalidatePath("/training/" + sessionId + "/review");
}

export async function addCoachingMemoryObservation(data: FormData) {
  const sessionId = value(data, "sessionId");
  const gymnastId = value(data, "gymnastId") || null;
  const observation = value(data, "observation");
  if (!observation) return;
  const { context, session } = await reviewContext(sessionId);
  if (!session) return;
  if (gymnastId) {
    const assigned = await prisma.trainingSessionGymnast.findUnique({
      where: { sessionId_gymnastId: { sessionId, gymnastId } },
      select: { gymnastId: true },
    });
    if (!assigned) return;
  }
  await prisma.coachingMemoryObservation.create({
    data: {
      organisationId: context.organisation.id,
      sessionId,
      gymnastId,
      authorMembershipId: context.membership.id,
      observation,
    },
  });
  revalidatePath("/training/" + sessionId + "/review");
}
