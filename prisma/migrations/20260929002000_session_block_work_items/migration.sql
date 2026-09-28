CREATE TABLE "SessionBlockWorkItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "blockId" TEXT NOT NULL,
  "trainingPlanItemId" TEXT,
  "targetGymnastId" TEXT,
  "title" TEXT NOT NULL,
  "targetCount" INTEGER,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SessionBlockWorkItem_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionBlockWorkItem_trainingPlanItemId_fkey" FOREIGN KEY ("trainingPlanItemId") REFERENCES "TrainingPlanItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SessionBlockWorkItem_targetGymnastId_fkey" FOREIGN KEY ("targetGymnastId") REFERENCES "Gymnast" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "SessionBlockWorkItem_blockId_orderIndex_idx" ON "SessionBlockWorkItem"("blockId", "orderIndex");
CREATE INDEX "SessionBlockWorkItem_trainingPlanItemId_idx" ON "SessionBlockWorkItem"("trainingPlanItemId");
CREATE INDEX "SessionBlockWorkItem_targetGymnastId_idx" ON "SessionBlockWorkItem"("targetGymnastId");
