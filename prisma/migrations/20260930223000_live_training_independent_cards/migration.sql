ALTER TABLE "User" ADD COLUMN "profileImageUrl" TEXT;
ALTER TABLE "Gymnast" ADD COLUMN "profileImageUrl" TEXT;
ALTER TABLE "SessionBlock" ADD COLUMN "behaviour" TEXT NOT NULL DEFAULT 'EVIDENCE';
UPDATE "SessionBlock" SET "behaviour"='GUIDED' WHERE "category" IN ('WARM_UP','COOLDOWN');
DROP INDEX IF EXISTS "TrainingCheckIn_sessionId_blockId_gymnastId_key";
CREATE INDEX "TrainingCheckIn_sessionId_blockId_gymnastId_recordedAt_idx" ON "TrainingCheckIn"("sessionId","blockId","gymnastId","recordedAt");
