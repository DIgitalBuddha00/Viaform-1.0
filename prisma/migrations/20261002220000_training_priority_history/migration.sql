CREATE TABLE "GymnastTrainingPriority" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "focus" TEXT,
  "rationale" TEXT,
  "setByMembershipId" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" DATETIME,
  "endedByMembershipId" TEXT,
  "endReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "GymnastTrainingPriority_organisationId_gymnastId_startedAt_idx" ON "GymnastTrainingPriority"("organisationId","gymnastId","startedAt");
CREATE INDEX "GymnastTrainingPriority_gymnastId_endedAt_idx" ON "GymnastTrainingPriority"("gymnastId","endedAt");