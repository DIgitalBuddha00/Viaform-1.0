CREATE TABLE "EvaluationBatteryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batteryId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL DEFAULT 'SKILL',
    "area" TEXT NOT NULL DEFAULT 'SKILL',
    "apparatus" TEXT,
    "label" TEXT NOT NULL,
    "skillId" TEXT,
    "testMetricId" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "defaultUnit" TEXT,
    "shorthandOptionsJson" TEXT NOT NULL DEFAULT '[]',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EvaluationBatteryItem_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "TestBattery" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationBatteryItem_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EvaluationBatteryItem_testMetricId_fkey" FOREIGN KEY ("testMetricId") REFERENCES "TestMetric" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "GymnastEvaluation" ADD COLUMN "batteryId" TEXT REFERENCES "TestBattery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GymnastEvaluation" ADD COLUMN "batteryNameSnapshot" TEXT;
ALTER TABLE "GymnastEvaluation" ADD COLUMN "batteryClassificationSnapshot" TEXT;
ALTER TABLE "GymnastEvaluation" ADD COLUMN "referenceContextJson" TEXT NOT NULL DEFAULT '{}';

ALTER TABLE "GymnastEvaluationItem" ADD COLUMN "batteryItemId" TEXT REFERENCES "EvaluationBatteryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GymnastEvaluationItem" ADD COLUMN "shorthandCode" TEXT;
ALTER TABLE "GymnastEvaluationItem" ADD COLUMN "retainedAsEvidence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GymnastEvaluationItem" ADD COLUMN "retainedAsEvidenceAt" DATETIME;

CREATE INDEX "EvaluationBatteryItem_batteryId_status_orderIndex_idx" ON "EvaluationBatteryItem"("batteryId", "status", "orderIndex");
CREATE INDEX "EvaluationBatteryItem_skillId_idx" ON "EvaluationBatteryItem"("skillId");
CREATE INDEX "EvaluationBatteryItem_testMetricId_idx" ON "EvaluationBatteryItem"("testMetricId");
CREATE INDEX "EvaluationBatteryItem_referenceType_referenceId_idx" ON "EvaluationBatteryItem"("referenceType", "referenceId");
CREATE INDEX "GymnastEvaluation_batteryId_idx" ON "GymnastEvaluation"("batteryId");
CREATE INDEX "GymnastEvaluationItem_batteryItemId_idx" ON "GymnastEvaluationItem"("batteryItemId");
