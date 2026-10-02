CREATE TABLE "GymnastGoal" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'DEVELOPMENT',
  "apparatus" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "successCriteria" TEXT,
  "targetDate" DATETIME,
  "visibility" TEXT NOT NULL DEFAULT 'ATHLETE_GUARDIAN',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "programmeNameSnapshot" TEXT,
  "stageNameSnapshot" TEXT,
  "rulesetNameSnapshot" TEXT,
  "rulesetLevelSnapshot" TEXT,
  "achievedAt" DATETIME,
  "pausedAt" DATETIME,
  "archivedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastGoal_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "GymnastGoalUpdate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "goalId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "statusSnapshot" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GymnastGoalUpdate_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GymnastGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "GymnastGoal_organisationId_gymnastId_status_idx" ON "GymnastGoal"("organisationId","gymnastId","status");
CREATE INDEX "GymnastGoal_gymnastId_createdAt_idx" ON "GymnastGoal"("gymnastId","createdAt");
CREATE INDEX "GymnastGoal_gymnastId_targetDate_idx" ON "GymnastGoal"("gymnastId","targetDate");
CREATE INDEX "GymnastGoalUpdate_goalId_createdAt_idx" ON "GymnastGoalUpdate"("goalId","createdAt");
