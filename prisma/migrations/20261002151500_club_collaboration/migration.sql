CREATE TABLE "CoachCollaborationNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "authorMembershipId" TEXT NOT NULL,
  "recipientMembershipId" TEXT NOT NULL,
  "gymnastId" TEXT,
  "trainingGroupId" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "authorRoleSnapshot" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "acknowledgedAt" DATETIME,
  "resolvedAt" DATETIME,
  "resolvedByMembershipId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CoachCollaborationNote_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CoachCollaborationNote_authorMembershipId_fkey" FOREIGN KEY ("authorMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CoachCollaborationNote_recipientMembershipId_fkey" FOREIGN KEY ("recipientMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "CoachCollaborationNote_resolvedByMembershipId_fkey" FOREIGN KEY ("resolvedByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CoachCollaborationNote_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CoachCollaborationNote_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CoachCollaborationNote_organisationId_createdAt_idx" ON "CoachCollaborationNote"("organisationId","createdAt");
CREATE INDEX "CoachCollaborationNote_recipientMembershipId_status_createdAt_idx" ON "CoachCollaborationNote"("recipientMembershipId","status","createdAt");
CREATE INDEX "CoachCollaborationNote_authorMembershipId_createdAt_idx" ON "CoachCollaborationNote"("authorMembershipId","createdAt");
CREATE INDEX "CoachCollaborationNote_gymnastId_createdAt_idx" ON "CoachCollaborationNote"("gymnastId","createdAt");
CREATE INDEX "CoachCollaborationNote_trainingGroupId_createdAt_idx" ON "CoachCollaborationNote"("trainingGroupId","createdAt");
