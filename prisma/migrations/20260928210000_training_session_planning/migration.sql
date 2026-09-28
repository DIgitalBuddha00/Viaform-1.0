CREATE TABLE IF NOT EXISTS "TrainingSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "scheduleSlotId" TEXT,
  "createdByMembershipId" TEXT NOT NULL,
  "sessionDate" DATETIME NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sessionIntent" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "programmeId" TEXT,
  "programmeStageId" TEXT,
  "programmeNameSnapshot" TEXT,
  "stageNameSnapshot" TEXT,
  "startedAt" DATETIME,
  "endedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingSession_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingSession_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingSession_scheduleSlotId_fkey" FOREIGN KEY ("scheduleSlotId") REFERENCES "TrainingGroupSchedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TrainingSession_createdByMembershipId_fkey" FOREIGN KEY ("createdByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "TrainingSession_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "CoachingProgramme" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "TrainingSession_programmeStageId_fkey" FOREIGN KEY ("programmeStageId") REFERENCES "ProgrammeStage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "TrainingSession_organisationId_sessionDate_idx"
ON "TrainingSession"("organisationId", "sessionDate");

CREATE INDEX IF NOT EXISTS "TrainingSession_trainingGroupId_sessionDate_idx"
ON "TrainingSession"("trainingGroupId", "sessionDate");

CREATE INDEX IF NOT EXISTS "TrainingSession_createdByMembershipId_sessionDate_idx"
ON "TrainingSession"("createdByMembershipId", "sessionDate");

CREATE TABLE IF NOT EXISTS "SessionBlock" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "apparatus" TEXT,
  "durationMin" INTEGER,
  "groupObjective" TEXT,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SessionBlock_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SessionBlock_sessionId_orderIndex_idx"
ON "SessionBlock"("sessionId", "orderIndex");
