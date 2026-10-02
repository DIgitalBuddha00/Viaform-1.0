CREATE TABLE "CultureDefinition" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "kind" TEXT NOT NULL DEFAULT 'RECOGNITION',
  "holdingType" TEXT NOT NULL DEFAULT 'PERMANENT',
  "badgeLabel" TEXT,
  "criteria" TEXT,
  "visibility" TEXT NOT NULL DEFAULT 'ATHLETE_GUARDIAN',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CultureDefinition_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "CultureAchievement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "cultureDefinitionId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "awardedByMembershipId" TEXT NOT NULL,
  "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" DATETIME,
  "endedReason" TEXT,
  "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
  "sourceRef" TEXT,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CultureAchievement_cultureDefinitionId_fkey" FOREIGN KEY ("cultureDefinitionId") REFERENCES "CultureDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CultureAchievement_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CultureDefinition_organisationId_name_key" ON "CultureDefinition"("organisationId","name");
CREATE INDEX "CultureDefinition_organisationId_status_kind_idx" ON "CultureDefinition"("organisationId","status","kind");
CREATE INDEX "CultureAchievement_organisationId_gymnastId_awardedAt_idx" ON "CultureAchievement"("organisationId","gymnastId","awardedAt");
CREATE INDEX "CultureAchievement_cultureDefinitionId_endedAt_idx" ON "CultureAchievement"("cultureDefinitionId","endedAt");
CREATE INDEX "CultureAchievement_gymnastId_endedAt_idx" ON "CultureAchievement"("gymnastId","endedAt");
