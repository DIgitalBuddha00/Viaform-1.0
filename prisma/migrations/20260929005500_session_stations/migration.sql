CREATE TABLE IF NOT EXISTS "SessionStation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "blockId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "objective" TEXT,
  "drills" TEXT,
  "equipment" TEXT,
  "setup" TEXT,
  "cues" TEXT,
  "easierOption" TEXT,
  "harderOption" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SessionStation_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SessionStation_blockId_name_key"
ON "SessionStation"("blockId", "name");

CREATE INDEX IF NOT EXISTS "SessionStation_blockId_orderIndex_idx"
ON "SessionStation"("blockId", "orderIndex");

ALTER TABLE "TrainingEvidence"
ADD COLUMN "stationId" TEXT REFERENCES "SessionStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "TrainingEvidence_stationId_recordedAt_idx"
ON "TrainingEvidence"("stationId", "recordedAt");
