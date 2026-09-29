ALTER TABLE "TestMetric" ADD COLUMN "scoringMode" TEXT NOT NULL DEFAULT 'NONE';
UPDATE "TestMetric" SET "scoringMode"='AUTOMATIC' WHERE EXISTS (SELECT 1 FROM "TestScoreBand" WHERE "TestScoreBand"."metricId"="TestMetric"."id");
