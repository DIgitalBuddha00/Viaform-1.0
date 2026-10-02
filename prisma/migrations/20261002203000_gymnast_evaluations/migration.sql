CREATE TABLE "GymnastEvaluation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "evaluationType" TEXT NOT NULL DEFAULT 'INTAKE',
  "title" TEXT NOT NULL,
  "evaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "previousExperience" TEXT,
  "overallObservation" TEXT,
  "placementContext" TEXT,
  "recommendedProgrammeId" TEXT,
  "recommendedProgrammeName" TEXT,
  "recommendedStageId" TEXT,
  "recommendedStageName" TEXT,
  "recommendedGroupId" TEXT,
  "recommendedGroupName" TEXT,
  "placementDecision" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "completedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastEvaluation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GymnastEvaluation_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "GymnastEvaluationItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "evaluationId" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "apparatus" TEXT,
  "label" TEXT NOT NULL,
  "rating" TEXT,
  "numberValue" REAL,
  "unit" TEXT,
  "note" TEXT,
  "testMetricId" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GymnastEvaluationItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "GymnastEvaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "GymnastEvaluation_organisationId_gymnastId_evaluatedAt_idx" ON "GymnastEvaluation"("organisationId","gymnastId","evaluatedAt");
CREATE INDEX "GymnastEvaluation_organisationId_status_evaluatedAt_idx" ON "GymnastEvaluation"("organisationId","status","evaluatedAt");
CREATE INDEX "GymnastEvaluationItem_evaluationId_area_orderIndex_idx" ON "GymnastEvaluationItem"("evaluationId","area","orderIndex");
CREATE INDEX "GymnastEvaluationItem_testMetricId_idx" ON "GymnastEvaluationItem"("testMetricId");
