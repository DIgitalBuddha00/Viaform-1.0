-- Competition historical-context closeout.
-- The revision tables may already exist in environments where the preceding
-- evidence-history SQL was applied manually, so these statements are idempotent.

CREATE TABLE IF NOT EXISTS "CompetitionPerformanceRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "performanceId" TEXT NOT NULL,
  "revisedByMembershipId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "difficultyScore" REAL,
  "executionScore" REAL,
  "penalty" REAL,
  "finalScore" REAL,
  "rank" INTEGER,
  "warmupNote" TEXT,
  "judgeNote" TEXT,
  "coachObservation" TEXT,
  "performedAt" DATETIME,
  "supersededAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompetitionPerformanceRevision_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "CompetitionPerformance" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompetitionPerformanceRevision_revisedByMembershipId_fkey" FOREIGN KEY ("revisedByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CompetitionPerformanceRevision_performanceId_supersededAt_idx" ON "CompetitionPerformanceRevision"("performanceId","supersededAt");
CREATE INDEX IF NOT EXISTS "CompetitionPerformanceRevision_revisedByMembershipId_supersededAt_idx" ON "CompetitionPerformanceRevision"("revisedByMembershipId","supersededAt");

CREATE TABLE IF NOT EXISTS "CompetitionAthleteReflectionRevision" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reflectionId" TEXT NOT NULL,
  "revisedByMembershipId" TEXT NOT NULL,
  "rating" INTEGER,
  "confidence" INTEGER,
  "feltPrepared" BOOLEAN,
  "whatFeltGood" TEXT,
  "whatFeltHard" TEXT,
  "athleteNote" TEXT,
  "reflectedAt" DATETIME NOT NULL,
  "supersededAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompetitionAthleteReflectionRevision_reflectionId_fkey" FOREIGN KEY ("reflectionId") REFERENCES "CompetitionAthleteReflection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CompetitionAthleteReflectionRevision_revisedByMembershipId_fkey" FOREIGN KEY ("revisedByMembershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CompetitionAthleteReflectionRevision_reflectionId_supersededAt_idx" ON "CompetitionAthleteReflectionRevision"("reflectionId","supersededAt");
CREATE INDEX IF NOT EXISTS "CompetitionAthleteReflectionRevision_revisedByMembershipId_supersededAt_idx" ON "CompetitionAthleteReflectionRevision"("revisedByMembershipId","supersededAt");

ALTER TABLE "CompetitionApparatusPlan" ADD COLUMN "routineSnapshot" TEXT;
ALTER TABLE "CompetitionPerformance" ADD COLUMN "scoreSource" TEXT NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "CompetitionPerformanceRevision" ADD COLUMN "scoreSource" TEXT NOT NULL DEFAULT 'UNSPECIFIED';
