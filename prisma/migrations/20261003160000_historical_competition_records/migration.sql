CREATE TABLE "HistoricalCompetitionRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "competitionName" TEXT,
  "competitionKey" TEXT NOT NULL,
  "competitionType" TEXT,
  "levelLabel" TEXT,
  "ageDivision" TEXT,
  "competitionDate" DATETIME,
  "dateLabel" TEXT,
  "datePrecision" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "aaScore" REAL,
  "aaRank" INTEGER,
  "outcomeLabel" TEXT,
  "sourceRowKey" TEXT NOT NULL,
  "sourceJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HistoricalCompetitionRecord_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalCompetitionRecord_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalCompetitionRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HistoricalCompetitionRecord_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalCompetitionRecord_organisationId_gymnastId_sourceRowKey_key" ON "HistoricalCompetitionRecord"("organisationId", "gymnastId", "sourceRowKey");
CREATE INDEX "HistoricalCompetitionRecord_organisationId_gymnastId_competitionDate_idx" ON "HistoricalCompetitionRecord"("organisationId", "gymnastId", "competitionDate");
CREATE INDEX "HistoricalCompetitionRecord_gymnastId_competitionKey_competitionDate_idx" ON "HistoricalCompetitionRecord"("gymnastId", "competitionKey", "competitionDate");
CREATE INDEX "HistoricalCompetitionRecord_sourceId_idx" ON "HistoricalCompetitionRecord"("sourceId");
CREATE INDEX "HistoricalCompetitionRecord_candidateId_idx" ON "HistoricalCompetitionRecord"("candidateId");
