CREATE TABLE IF NOT EXISTS "GymnastRoutineElement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routineId" TEXT NOT NULL,
  "elementDefinitionId" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "recognition" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "isDismount" BOOLEAN NOT NULL DEFAULT false,
  "coachNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastRoutineElement_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "GymnastRoutine" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GymnastRoutineElement_elementDefinitionId_fkey"
    FOREIGN KEY ("elementDefinitionId") REFERENCES "FigElementDefinition" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GymnastRoutineElement_routineId_orderIndex_key"
ON "GymnastRoutineElement"("routineId", "orderIndex");

CREATE INDEX IF NOT EXISTS "GymnastRoutineElement_routineId_elementDefinitionId_idx"
ON "GymnastRoutineElement"("routineId", "elementDefinitionId");

CREATE TABLE IF NOT EXISTS "GymnastRoutineVault" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routineId" TEXT NOT NULL,
  "vaultDefinitionId" TEXT NOT NULL,
  "orderIndex" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'PRIMARY',
  "coachNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "GymnastRoutineVault_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "GymnastRoutine" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GymnastRoutineVault_vaultDefinitionId_fkey"
    FOREIGN KEY ("vaultDefinitionId") REFERENCES "FigVaultDefinition" ("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GymnastRoutineVault_routineId_orderIndex_key"
ON "GymnastRoutineVault"("routineId", "orderIndex");

CREATE INDEX IF NOT EXISTS "GymnastRoutineVault_routineId_vaultDefinitionId_idx"
ON "GymnastRoutineVault"("routineId", "vaultDefinitionId");
