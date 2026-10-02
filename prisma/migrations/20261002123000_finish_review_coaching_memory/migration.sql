CREATE TABLE "TrainingSessionReview" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "summary" TEXT,
  "carryForward" TEXT,
  "reviewedByMembershipId" TEXT NOT NULL,
  "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "TrainingSessionReview_sessionId_key" ON "TrainingSessionReview"("sessionId");
CREATE INDEX "TrainingSessionReview_organisationId_reviewedAt_idx" ON "TrainingSessionReview"("organisationId","reviewedAt");
CREATE INDEX "TrainingSessionReview_reviewedByMembershipId_reviewedAt_idx" ON "TrainingSessionReview"("reviewedByMembershipId","reviewedAt");

CREATE TABLE "CoachingMemoryObservation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "sessionId" TEXT,
  "gymnastId" TEXT,
  "authorMembershipId" TEXT NOT NULL,
  "observation" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "CoachingMemoryObservation_organisationId_createdAt_idx" ON "CoachingMemoryObservation"("organisationId","createdAt");
CREATE INDEX "CoachingMemoryObservation_gymnastId_createdAt_idx" ON "CoachingMemoryObservation"("gymnastId","createdAt");
CREATE INDEX "CoachingMemoryObservation_sessionId_createdAt_idx" ON "CoachingMemoryObservation"("sessionId","createdAt");
CREATE INDEX "CoachingMemoryObservation_authorMembershipId_createdAt_idx" ON "CoachingMemoryObservation"("authorMembershipId","createdAt");
