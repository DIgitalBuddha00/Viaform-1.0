-- Core coaching baseline: organisation-owned groups, gymnasts and multi-group membership.
-- Structure only: no QA, demo, fixture or product data is inserted.

CREATE TABLE "TrainingGroup" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "TrainingGroup_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TrainingGroup_organisationId_name_key" ON "TrainingGroup"("organisationId", "name");
CREATE INDEX "TrainingGroup_organisationId_name_idx" ON "TrainingGroup"("organisationId", "name");

CREATE TABLE "Gymnast" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "dateOfBirth" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Gymnast_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Gymnast_organisationId_name_idx" ON "Gymnast"("organisationId", "name");

CREATE TABLE "GymnastTrainingGroup" (
  "gymnastId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("gymnastId", "trainingGroupId"),
  CONSTRAINT "GymnastTrainingGroup_gymnastId_fkey" FOREIGN KEY ("gymnastId") REFERENCES "Gymnast" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GymnastTrainingGroup_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "GymnastTrainingGroup_trainingGroupId_idx" ON "GymnastTrainingGroup"("trainingGroupId");
