CREATE TABLE "TrainingQuarter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "quarter" INTEGER NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "sourceStatus" TEXT,
  "sourceType" TEXT NOT NULL DEFAULT 'VIAFORM',
  "createdByMembershipId" TEXT,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingQuarter_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingQuarter_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingQuarter_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TrainingQuarter_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TrainingQuarter_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TrainingQuarter_organisationId_gymnastId_year_quarter_key" ON "TrainingQuarter"("organisationId","gymnastId","year","quarter");
CREATE INDEX "TrainingQuarter_organisationId_year_quarter_status_idx" ON "TrainingQuarter"("organisationId","year","quarter","status");
CREATE INDEX "TrainingQuarter_gymnastId_year_quarter_idx" ON "TrainingQuarter"("gymnastId","year","quarter");
CREATE INDEX "TrainingQuarter_sourceId_idx" ON "TrainingQuarter"("sourceId");
CREATE INDEX "TrainingQuarter_candidateId_idx" ON "TrainingQuarter"("candidateId");

CREATE TABLE "TrainingQuarterFocus" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quarterId" TEXT NOT NULL,
  "apparatus" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "skillId" TEXT,
  "skillText" TEXT NOT NULL,
  "sourceSkillKey" TEXT,
  "progressState" TEXT,
  "progressJson" TEXT,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingQuarterFocus_quarterId_fkey" FOREIGN KEY ("quarterId") REFERENCES "TrainingQuarter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingQuarterFocus_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ViaformSkill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TrainingQuarterFocus_quarterId_apparatus_priority_skillText_key" ON "TrainingQuarterFocus"("quarterId","apparatus","priority","skillText");
CREATE INDEX "TrainingQuarterFocus_quarterId_apparatus_priority_orderIndex_idx" ON "TrainingQuarterFocus"("quarterId","apparatus","priority","orderIndex");
CREATE INDEX "TrainingQuarterFocus_skillId_idx" ON "TrainingQuarterFocus"("skillId");
