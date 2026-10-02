ALTER TABLE "TrainingGroup" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "TrainingGroup" ADD COLUMN "archivedAt" DATETIME;
CREATE INDEX "TrainingGroup_organisationId_status_name_idx" ON "TrainingGroup"("organisationId","status","name");
