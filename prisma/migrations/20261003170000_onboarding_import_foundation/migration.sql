ALTER TABLE "Organisation" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Organisation" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "Organisation" ADD COLUMN "archivedByUserId" TEXT;
ALTER TABLE "Organisation" ADD COLUMN "archiveReason" TEXT;
CREATE INDEX "Organisation_status_name_idx" ON "Organisation"("status","name");

CREATE TABLE "ImportBatch" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sourceKind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DISCOVERING',
  "createdByUserId" TEXT,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" DATETIME,
  "importedAt" DATETIME,
  "rolledBackAt" DATETIME,
  "rollbackStatus" TEXT,
  "summaryJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ImportBatch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ImportBatch_organisationId_idempotencyKey_key" ON "ImportBatch"("organisationId","idempotencyKey");
CREATE INDEX "ImportBatch_organisationId_status_createdAt_idx" ON "ImportBatch"("organisationId","status","createdAt");

CREATE TABLE "ImportSource" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "batchId" TEXT NOT NULL,
  "parentSourceId" TEXT,
  "sourceKey" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "externalRef" TEXT,
  "contentHash" TEXT,
  "modifiedAt" DATETIME,
  "locatorJson" TEXT NOT NULL DEFAULT '{}',
  "metadataJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ImportSource_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ImportSource_parentSourceId_fkey" FOREIGN KEY ("parentSourceId") REFERENCES "ImportSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ImportSource_batchId_sourceKey_key" ON "ImportSource"("batchId","sourceKey");
CREATE INDEX "ImportSource_batchId_sourceType_idx" ON "ImportSource"("batchId","sourceType");
CREATE INDEX "ImportSource_parentSourceId_idx" ON "ImportSource"("parentSourceId");

CREATE TABLE "ImportCandidate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "batchId" TEXT NOT NULL,
  "sourceId" TEXT,
  "candidateKey" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "sourceEntityKey" TEXT,
  "dataRole" TEXT NOT NULL,
  "visibility" TEXT NOT NULL,
  "importTreatment" TEXT NOT NULL,
  "proposedAction" TEXT NOT NULL,
  "confidence" REAL,
  "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "targetType" TEXT,
  "targetId" TEXT,
  "payloadJson" TEXT NOT NULL,
  "interpretationJson" TEXT NOT NULL DEFAULT '{}',
  "conflictJson" TEXT,
  "reviewedByUserId" TEXT,
  "reviewedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "ImportCandidate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ImportCandidate_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ImportCandidate_batchId_candidateKey_key" ON "ImportCandidate"("batchId","candidateKey");
CREATE INDEX "ImportCandidate_batchId_reviewStatus_entityType_idx" ON "ImportCandidate"("batchId","reviewStatus","entityType");
CREATE INDEX "ImportCandidate_sourceId_entityType_idx" ON "ImportCandidate"("sourceId","entityType");

CREATE TABLE "SourceIdentityMapping" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "sourceNamespace" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "sourceEntityKey" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "confidence" REAL,
  "resolution" TEXT NOT NULL DEFAULT 'CONFIRMED',
  "resolvedByUserId" TEXT,
  "resolvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadataJson" TEXT NOT NULL DEFAULT '{}',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "SourceIdentityMapping_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SourceIdentityMapping_organisationId_sourceNamespace_entityType_sourceEntityKey_key" ON "SourceIdentityMapping"("organisationId","sourceNamespace","entityType","sourceEntityKey");
CREATE INDEX "SourceIdentityMapping_organisationId_targetType_targetId_idx" ON "SourceIdentityMapping"("organisationId","targetType","targetId");

CREATE TABLE "ImportRecordLink" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "batchId" TEXT NOT NULL,
  "sourceId" TEXT,
  "candidateId" TEXT,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "ownership" TEXT NOT NULL,
  "sourceLocatorJson" TEXT NOT NULL DEFAULT '{}',
  "beforeSnapshotJson" TEXT,
  "afterSnapshotJson" TEXT,
  "rollbackStatus" TEXT,
  "rolledBackAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ImportRecordLink_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ImportRecordLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ImportRecordLink_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "ImportCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ImportRecordLink_batchId_targetType_targetId_sourceId_key" ON "ImportRecordLink"("batchId","targetType","targetId","sourceId");
CREATE INDEX "ImportRecordLink_batchId_ownership_operation_idx" ON "ImportRecordLink"("batchId","ownership","operation");
CREATE INDEX "ImportRecordLink_targetType_targetId_idx" ON "ImportRecordLink"("targetType","targetId");
CREATE INDEX "ImportRecordLink_candidateId_idx" ON "ImportRecordLink"("candidateId");
