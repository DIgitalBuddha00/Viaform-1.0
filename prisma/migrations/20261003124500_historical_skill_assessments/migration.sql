CREATE TABLE "HistoricalSkillAssessment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "apparatus" TEXT NOT NULL,
  "skillId" TEXT,
  "skillText" TEXT NOT NULL,
  "sourceSkillKey" TEXT,
  "resultCode" TEXT,
  "resultLabel" TEXT,
  "frameworkLabel" TEXT,
  "coachComment" TEXT,
  "assessedAt" DATETIME,
  "dateLabel" TEXT,
  "sourceJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "HistoricalSkillAssessment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalSkillAssessment_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HistoricalSkillAssessment_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HistoricalSkillAssessment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "HistoricalSkillAssessment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HistoricalSkillAssessment_organisationId_gymnastId_sourceId_apparatus_skillText_key" ON "HistoricalSkillAssessment"("organisationId","gymnastId","sourceId","apparatus","skillText");
CREATE INDEX "HistoricalSkillAssessment_organisationId_gymnastId_apparatus_idx" ON "HistoricalSkillAssessment"("organisationId","gymnastId","apparatus");
CREATE INDEX "HistoricalSkillAssessment_gymnastId_assessedAt_idx" ON "HistoricalSkillAssessment"("gymnastId","assessedAt");
CREATE INDEX "HistoricalSkillAssessment_skillId_idx" ON "HistoricalSkillAssessment"("skillId");
CREATE INDEX "HistoricalSkillAssessment_sourceId_idx" ON "HistoricalSkillAssessment"("sourceId");
CREATE INDEX "HistoricalSkillAssessment_candidateId_idx" ON "HistoricalSkillAssessment"("candidateId");
