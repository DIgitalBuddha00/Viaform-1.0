import "server-only";
import { prisma } from "./prisma";

export async function archiveOrganisation(organisationId: string, archivedByUserId?: string | null, reason?: string | null) {
  const now = new Date();
  return prisma.$transaction(async tx => {
    const organisation = await tx.organisation.findUnique({ where: { id: organisationId } });
    if (!organisation || organisation.status === "ARCHIVED") return organisation;
    await tx.authSession.deleteMany({ where: { organisationId } });
    return tx.organisation.update({
      where: { id: organisationId },
      data: { status: "ARCHIVED", archivedAt: now, archivedByUserId: archivedByUserId ?? null, archiveReason: reason?.trim() || null },
    });
  });
}

export async function restoreOrganisation(organisationId: string) {
  return prisma.organisation.update({
    where: { id: organisationId },
    data: { status: "ACTIVE", archivedAt: null, archivedByUserId: null, archiveReason: null },
  });
}

export function importRecordCanBeDeletedOnRollback(ownership: string) {
  return ownership === "CREATED_BY_BATCH";
}
