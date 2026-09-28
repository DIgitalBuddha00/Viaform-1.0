CREATE TABLE IF NOT EXISTS "SessionRotationGroup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SessionRotationGroup_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SessionRotationGroup_sessionId_name_key"
ON "SessionRotationGroup"("sessionId", "name");

CREATE INDEX IF NOT EXISTS "SessionRotationGroup_sessionId_orderIndex_idx"
ON "SessionRotationGroup"("sessionId", "orderIndex");

CREATE TABLE IF NOT EXISTS "SessionRotationGymnast" (
  "sessionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "rotationGroupId" TEXT NOT NULL,
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("sessionId", "gymnastId"),
  CONSTRAINT "SessionRotationGymnast_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionRotationGymnast_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionRotationGymnast_rotationGroupId_fkey"
    FOREIGN KEY ("rotationGroupId") REFERENCES "SessionRotationGroup" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SessionRotationGymnast_rotationGroupId_assignedAt_idx"
ON "SessionRotationGymnast"("rotationGroupId", "assignedAt");

CREATE TABLE IF NOT EXISTS "SessionRotationAssignment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "rotationGroupId" TEXT NOT NULL,
  "blockId" TEXT,
  "trainingSpaceId" TEXT,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SessionRotationAssignment_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "TrainingSession" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionRotationAssignment_rotationGroupId_fkey"
    FOREIGN KEY ("rotationGroupId") REFERENCES "SessionRotationGroup" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SessionRotationAssignment_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "SessionBlock" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "SessionRotationAssignment_trainingSpaceId_fkey"
    FOREIGN KEY ("trainingSpaceId") REFERENCES "TrainingSpace" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SessionRotationAssignment_sessionId_startTime_endTime_idx"
ON "SessionRotationAssignment"("sessionId", "startTime", "endTime");

CREATE INDEX IF NOT EXISTS "SessionRotationAssignment_rotationGroupId_orderIndex_idx"
ON "SessionRotationAssignment"("rotationGroupId", "orderIndex");

CREATE INDEX IF NOT EXISTS "SessionRotationAssignment_trainingSpaceId_startTime_endTime_idx"
ON "SessionRotationAssignment"("trainingSpaceId", "startTime", "endTime");
