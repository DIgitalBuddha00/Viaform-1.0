ALTER TABLE "TrainingSpace" ADD COLUMN "apparatus" TEXT;

CREATE TABLE "ClubRotationPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "locationId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "effectiveFrom" DATETIME NOT NULL,
  "effectiveTo" DATETIME,
  "anchorDate" DATETIME NOT NULL,
  "weeksPerVariant" INTEGER NOT NULL DEFAULT 1,
  "variantCount" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ClubRotationPlan_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClubRotationPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "FacilityLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClubRotationPlan_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "ClubRotationPlan_organisationId_status_effectiveFrom_idx" ON "ClubRotationPlan"("organisationId","status","effectiveFrom");
CREATE INDEX "ClubRotationPlan_locationId_status_idx" ON "ClubRotationPlan"("locationId","status");

CREATE TABLE "ClubRotationSlot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "variantIndex" INTEGER NOT NULL,
  "dayOfWeek" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "trainingSpaceId" TEXT NOT NULL,
  "coachMembershipId" TEXT,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ClubRotationSlot_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ClubRotationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClubRotationSlot_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClubRotationSlot_trainingSpaceId_fkey" FOREIGN KEY ("trainingSpaceId") REFERENCES "TrainingSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClubRotationSlot_coachMembershipId_fkey" FOREIGN KEY ("coachMembershipId") REFERENCES "OrganisationMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ClubRotationSlot_planId_variantIndex_dayOfWeek_startTime_idx" ON "ClubRotationSlot"("planId","variantIndex","dayOfWeek","startTime");
CREATE INDEX "ClubRotationSlot_trainingGroupId_dayOfWeek_idx" ON "ClubRotationSlot"("trainingGroupId","dayOfWeek");
CREATE INDEX "ClubRotationSlot_trainingSpaceId_dayOfWeek_startTime_idx" ON "ClubRotationSlot"("trainingSpaceId","dayOfWeek","startTime");

ALTER TABLE "TrainingSession" ADD COLUMN "clubRotationPlanId" TEXT REFERENCES "ClubRotationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD COLUMN "clubRotationVariant" INTEGER;
CREATE INDEX "TrainingSession_clubRotationPlanId_sessionDate_idx" ON "TrainingSession"("clubRotationPlanId","sessionDate");
