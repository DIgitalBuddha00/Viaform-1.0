ALTER TABLE "TrainingPlan" ADD COLUMN "gymnastId" TEXT REFERENCES "Gymnast"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "TrainingPlan_gymnastId_startDate_idx" ON "TrainingPlan"("gymnastId","startDate");

CREATE TABLE "TrainingPlanItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "gymnastId" TEXT,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "apparatus" TEXT,
  "durationMin" INTEGER,
  "targetCount" INTEGER,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingPlanItem_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "TrainingPlanItem_planId_orderIndex_idx" ON "TrainingPlanItem"("planId","orderIndex");
CREATE INDEX "TrainingPlanItem_gymnastId_idx" ON "TrainingPlanItem"("gymnastId");

ALTER TABLE "SessionBlock" ADD COLUMN "targetGymnastId" TEXT REFERENCES "Gymnast"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SessionBlock" ADD COLUMN "targetCount" INTEGER;
CREATE INDEX "SessionBlock_targetGymnastId_idx" ON "SessionBlock"("targetGymnastId");

ALTER TABLE "MacrocyclePhase" ADD COLUMN "goals" TEXT;
ALTER TABLE "MacrocyclePhase" ADD COLUMN "apparatusFocus" TEXT;
ALTER TABLE "MacrocyclePhase" ADD COLUMN "conditioningFocus" TEXT;
ALTER TABLE "MacrocyclePhase" ADD COLUMN "artistryFocus" TEXT;

CREATE TABLE "MacrocycleFocusPeriod" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "phaseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "apparatusFocus" TEXT,
  "conditioningFocus" TEXT,
  "artistryFocus" TEXT,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MacrocycleFocusPeriod_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "MacrocyclePhase"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MacrocycleFocusPeriod_phaseId_orderIndex_startDate_idx" ON "MacrocycleFocusPeriod"("phaseId","orderIndex","startDate");
