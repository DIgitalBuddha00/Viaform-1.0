CREATE TABLE "CompetitionPerformance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitionApparatusPlanId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NOT_RECORDED',
  "difficultyScore" REAL,
  "executionScore" REAL,
  "penalty" REAL,
  "finalScore" REAL,
  "rank" INTEGER,
  "warmupNote" TEXT,
  "judgeNote" TEXT,
  "coachObservation" TEXT,
  "performedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompetitionPerformance_competitionApparatusPlanId_fkey"
    FOREIGN KEY ("competitionApparatusPlanId") REFERENCES "CompetitionApparatusPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CompetitionPerformance_competitionApparatusPlanId_key"
ON "CompetitionPerformance"("competitionApparatusPlanId");

CREATE TABLE "CompetitionAthleteReflection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "competitionPerformanceId" TEXT NOT NULL,
  "rating" INTEGER,
  "confidence" INTEGER,
  "feltPrepared" BOOLEAN,
  "whatFeltGood" TEXT,
  "whatFeltHard" TEXT,
  "athleteNote" TEXT,
  "reflectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompetitionAthleteReflection_competitionPerformanceId_fkey"
    FOREIGN KEY ("competitionPerformanceId") REFERENCES "CompetitionPerformance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CompetitionAthleteReflection_competitionPerformanceId_key"
ON "CompetitionAthleteReflection"("competitionPerformanceId");
