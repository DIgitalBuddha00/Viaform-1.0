CREATE TABLE "HistoricalPlanningRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "recordType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startDate" DATETIME,
  "endDate" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'HISTORICAL',
  "sourceStatus" TEXT,
  "payloadJson" TEXT NOT NULL DEFAULT '{}',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HistoricalPlanningRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalPlanningRecord_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalPlanningRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HistoricalPlanningRecord_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalPlanningRecord_organisationId_recordType_sourceId_gymnastId_key" ON "HistoricalPlanningRecord"("organisationId","recordType","sourceId","gymnastId");
CREATE INDEX "HistoricalPlanningRecord_organisationId_gymnastId_recordType_startDate_idx" ON "HistoricalPlanningRecord"("organisationId","gymnastId","recordType","startDate");
CREATE INDEX "HistoricalPlanningRecord_sourceId_idx" ON "HistoricalPlanningRecord"("sourceId");
CREATE INDEX "HistoricalPlanningRecord_candidateId_idx" ON "HistoricalPlanningRecord"("candidateId");

CREATE TABLE "HistoricalQuarterFocus" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planningRecordId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "quarter" INTEGER NOT NULL,
  "startDate" DATETIME,
  "endDate" DATETIME,
  "apparatus" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "skillText" TEXT NOT NULL,
  "sourceSkillKey" TEXT,
  "progressState" TEXT,
  "progressJson" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistoricalQuarterFocus_planningRecordId_fkey" FOREIGN KEY ("planningRecordId") REFERENCES "HistoricalPlanningRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalQuarterFocus_planningRecordId_year_quarter_apparatus_priority_skillText_key" ON "HistoricalQuarterFocus"("planningRecordId","year","quarter","apparatus","priority","skillText");
CREATE INDEX "HistoricalQuarterFocus_planningRecordId_year_quarter_apparatus_priority_idx" ON "HistoricalQuarterFocus"("planningRecordId","year","quarter","apparatus","priority");
