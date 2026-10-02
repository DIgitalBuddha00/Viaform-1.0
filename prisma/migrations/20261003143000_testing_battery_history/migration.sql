ALTER TABLE "TestBattery" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TestingSession" ADD COLUMN "batteryNameSnapshot" TEXT;
ALTER TABLE "TestingSession" ADD COLUMN "batteryVersionSnapshot" INTEGER;
ALTER TABLE "TestingSession" ADD COLUMN "batteryDefinitionSnapshot" TEXT;
UPDATE "TestingSession" SET "batteryNameSnapshot"=(SELECT "name" FROM "TestBattery" WHERE "TestBattery"."id"="TestingSession"."batteryId"),"batteryVersionSnapshot"=CASE WHEN "batteryId" IS NOT NULL THEN 1 ELSE NULL END WHERE "batteryId" IS NOT NULL;
