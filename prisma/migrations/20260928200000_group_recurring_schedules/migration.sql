CREATE TABLE IF NOT EXISTS "TrainingGroupSchedule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "trainingGroupId" TEXT NOT NULL,
  "dayOfWeek" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingGroupSchedule_trainingGroupId_fkey"
    FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TrainingGroupSchedule_trainingGroupId_dayOfWeek_startTime_endTime_key"
ON "TrainingGroupSchedule"("trainingGroupId", "dayOfWeek", "startTime", "endTime");

CREATE INDEX IF NOT EXISTS "TrainingGroupSchedule_trainingGroupId_orderIndex_idx"
ON "TrainingGroupSchedule"("trainingGroupId", "orderIndex");
