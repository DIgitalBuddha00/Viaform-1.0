ALTER TABLE "GymnastRoutine" ADD COLUMN "vaultMode" TEXT NOT NULL DEFAULT 'ONE_VAULT';
ALTER TABLE "GymnastRoutine" ADD COLUMN "routineDurationSeconds" INTEGER;
ALTER TABLE "GymnastRoutine" ADD COLUMN "musicFileName" TEXT;
ALTER TABLE "GymnastRoutine" ADD COLUMN "musicMimeType" TEXT;
ALTER TABLE "GymnastRoutine" ADD COLUMN "musicStorageRef" TEXT;
ALTER TABLE "GymnastRoutine" ADD COLUMN "musicDurationSeconds" REAL;

CREATE TABLE "RoutineSection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routineId" TEXT NOT NULL,
  "sectionType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "startTimeSec" REAL,
  "endTimeSec" REAL,
  "startX" REAL,
  "startY" REAL,
  "endX" REAL,
  "endY" REAL,
  "pathJson" TEXT NOT NULL DEFAULT '[]',
  "startRail" TEXT,
  "endRail" TEXT,
  "startPosition" TEXT,
  "endPosition" TEXT,
  "facing" TEXT,
  "direction" TEXT,
  "rhythm" TEXT,
  "musicCue" TEXT,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "RoutineSection_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "GymnastRoutine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "RoutineSection_routineId_orderIndex_idx" ON "RoutineSection"("routineId","orderIndex");
CREATE INDEX "RoutineSection_routineId_sectionType_idx" ON "RoutineSection"("routineId","sectionType");

ALTER TABLE "GymnastRoutineElement" ADD COLUMN "sectionId" TEXT REFERENCES "RoutineSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "GymnastRoutineElement_sectionId_idx" ON "GymnastRoutineElement"("sectionId");
ALTER TABLE "GymnastRoutineCustomItem" ADD COLUMN "sectionId" TEXT REFERENCES "RoutineSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "GymnastRoutineCustomItem_sectionId_idx" ON "GymnastRoutineCustomItem"("sectionId");

ALTER TABLE "TrainingCheckIn" ADD COLUMN "fatigue" TEXT;
ALTER TABLE "TrainingEvidence" ADD COLUMN "blockOrderSnapshot" INTEGER;
ALTER TABLE "TrainingEvidence" ADD COLUMN "blockCountSnapshot" INTEGER;
ALTER TABLE "TrainingEvidence" ADD COLUMN "sessionElapsedMinutesSnapshot" INTEGER;
ALTER TABLE "TrainingEvidence" ADD COLUMN "fatigueSnapshot" TEXT;
