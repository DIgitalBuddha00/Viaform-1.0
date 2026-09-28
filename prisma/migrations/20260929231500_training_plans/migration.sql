CREATE TABLE "TrainingPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "macrocycleId" TEXT,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "focus" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingPlan_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingPlan_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingPlan_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "Macrocycle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TrainingPlan_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "TrainingPlan_organisationId_status_startDate_idx" ON "TrainingPlan"("organisationId","status","startDate");
CREATE INDEX "TrainingPlan_trainingGroupId_startDate_endDate_idx" ON "TrainingPlan"("trainingGroupId","startDate","endDate");
CREATE INDEX "TrainingPlan_macrocycleId_idx" ON "TrainingPlan"("macrocycleId");

ALTER TABLE "TrainingSession" ADD COLUMN "trainingPlanId" TEXT REFERENCES "TrainingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "TrainingSession_trainingPlanId_sessionDate_idx" ON "TrainingSession"("trainingPlanId","sessionDate");
