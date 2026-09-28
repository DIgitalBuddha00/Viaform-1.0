CREATE TABLE "GymnastRoutineCustomItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routineId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "role" TEXT,
  "coachNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastRoutineCustomItem_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "GymnastRoutine" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GymnastRoutineCustomItem_routineId_orderIndex_key"
ON "GymnastRoutineCustomItem"("routineId", "orderIndex");

CREATE INDEX "GymnastRoutineCustomItem_routineId_idx"
ON "GymnastRoutineCustomItem"("routineId");

ALTER TABLE "TrainingEvidence"
ADD COLUMN "routineCustomItemId" TEXT
REFERENCES "GymnastRoutineCustomItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "TrainingEvidence_routineCustomItemId_recordedAt_idx"
ON "TrainingEvidence"("routineCustomItemId", "recordedAt");
