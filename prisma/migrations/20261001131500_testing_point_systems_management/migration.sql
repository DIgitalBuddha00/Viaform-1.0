ALTER TABLE "TestMetric" ADD COLUMN "pointSystemId" TEXT;
ALTER TABLE "TestBattery" ADD COLUMN "pointSystemId" TEXT;
CREATE TABLE "TestPointSystem" ("id" TEXT NOT NULL PRIMARY KEY,"organisationId" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"status" TEXT NOT NULL DEFAULT 'ACTIVE',"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,CONSTRAINT "TestPointSystem_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "TestPointSystem_organisationId_name_key" ON "TestPointSystem"("organisationId","name");
CREATE INDEX "TestPointSystem_organisationId_status_idx" ON "TestPointSystem"("organisationId","status");
CREATE INDEX "TestMetric_pointSystemId_idx" ON "TestMetric"("pointSystemId");
CREATE INDEX "TestBattery_pointSystemId_idx" ON "TestBattery"("pointSystemId");
