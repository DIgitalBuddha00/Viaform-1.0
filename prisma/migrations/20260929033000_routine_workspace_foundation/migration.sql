CREATE TABLE IF NOT EXISTS "GymnastRoutine" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gymnastId" TEXT NOT NULL,
  "apparatus" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "purpose" TEXT NOT NULL DEFAULT 'CURRENT',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "rulesetProgramCode" TEXT,
  "rulesetProgramName" TEXT,
  "rulesetLevelCode" TEXT,
  "rulesetLevelName" TEXT,
  "rulesetPackageCode" TEXT,
  "rulesetVersionLabel" TEXT,
  "strategyNote" TEXT,
  "pathwayNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastRoutine_gymnastId_fkey"
    FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GymnastRoutine_gymnastId_apparatus_name_key"
ON "GymnastRoutine"("gymnastId", "apparatus", "name");

CREATE INDEX IF NOT EXISTS "GymnastRoutine_gymnastId_apparatus_status_idx"
ON "GymnastRoutine"("gymnastId", "apparatus", "status");

CREATE INDEX IF NOT EXISTS "GymnastRoutine_gymnastId_purpose_status_idx"
ON "GymnastRoutine"("gymnastId", "purpose", "status");
