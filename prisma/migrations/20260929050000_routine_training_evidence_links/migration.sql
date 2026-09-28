ALTER TABLE "TrainingEvidence"
ADD COLUMN "routineElementId" TEXT
REFERENCES "GymnastRoutineElement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TrainingEvidence"
ADD COLUMN "routineVaultId" TEXT
REFERENCES "GymnastRoutineVault"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "TrainingEvidence_routineElementId_recordedAt_idx"
ON "TrainingEvidence"("routineElementId", "recordedAt");

CREATE INDEX IF NOT EXISTS "TrainingEvidence_routineVaultId_recordedAt_idx"
ON "TrainingEvidence"("routineVaultId", "recordedAt");
