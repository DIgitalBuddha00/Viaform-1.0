CREATE TABLE "HistoricalTestingRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "testType" TEXT NOT NULL,
  "metricName" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "rawValue" TEXT,
  "numberValue" REAL,
  "unit" TEXT,
  "pointsValue" REAL,
  "testedAt" DATETIME,
  "dateLabel" TEXT,
  "sourceRowKey" TEXT NOT NULL,
  "sourceJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HistoricalTestingRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalTestingRecord_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalTestingRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HistoricalTestingRecord_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalTestingRecord_organisationId_gymnastId_sourceRowKey_key" ON "HistoricalTestingRecord"("organisationId","gymnastId","sourceRowKey");
CREATE INDEX "HistoricalTestingRecord_organisationId_gymnastId_testType_idx" ON "HistoricalTestingRecord"("organisationId","gymnastId","testType");
CREATE INDEX "HistoricalTestingRecord_gymnastId_metricKey_testedAt_idx" ON "HistoricalTestingRecord"("gymnastId","metricKey","testedAt");
CREATE INDEX "HistoricalTestingRecord_sourceId_idx" ON "HistoricalTestingRecord"("sourceId");
CREATE INDEX "HistoricalTestingRecord_candidateId_idx" ON "HistoricalTestingRecord"("candidateId");
