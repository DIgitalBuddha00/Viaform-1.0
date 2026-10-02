CREATE TABLE "ProgrammeStageOutcome" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "stageId" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SKILL',
  "apparatus" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "emphasis" TEXT NOT NULL DEFAULT 'DEVELOP',
  "successEvidence" TEXT,
  "coachNotes" TEXT,
  "skillId" TEXT,
  "testMetricId" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ProgrammeStageOutcome_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeStageOutcome_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ProgrammeStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeStageOutcome_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ProgrammeStageOutcome_testMetricId_fkey" FOREIGN KEY ("testMetricId") REFERENCES "TestMetric" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ProgrammeStageOutcome_organisationId_status_category_idx" ON "ProgrammeStageOutcome"("organisationId","status","category");
CREATE INDEX "ProgrammeStageOutcome_stageId_orderIndex_status_idx" ON "ProgrammeStageOutcome"("stageId","orderIndex","status");
CREATE INDEX "ProgrammeStageOutcome_skillId_idx" ON "ProgrammeStageOutcome"("skillId");
CREATE INDEX "ProgrammeStageOutcome_testMetricId_idx" ON "ProgrammeStageOutcome"("testMetricId");
