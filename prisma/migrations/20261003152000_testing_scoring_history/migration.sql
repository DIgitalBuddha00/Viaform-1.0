ALTER TABLE "TestingResult" ADD COLUMN "pointSystemNameSnapshot" TEXT;
ALTER TABLE "TestingResult" ADD COLUMN "pointSystemVersionSnapshot" INTEGER;
ALTER TABLE "TestingResult" ADD COLUMN "scoreRuleSnapshot" TEXT;
ALTER TABLE "TestingResultRevision" ADD COLUMN "pointSystemNameSnapshot" TEXT;
ALTER TABLE "TestingResultRevision" ADD COLUMN "pointSystemVersionSnapshot" INTEGER;
ALTER TABLE "TestingResultRevision" ADD COLUMN "scoreRuleSnapshot" TEXT;
