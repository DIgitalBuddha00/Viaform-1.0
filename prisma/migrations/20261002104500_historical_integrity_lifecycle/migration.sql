ALTER TABLE "Gymnast" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Gymnast" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "Gymnast" ADD COLUMN "transferredAt" DATETIME;
CREATE INDEX "Gymnast_organisationId_status_name_idx" ON "Gymnast"("organisationId","status","name");

CREATE TABLE "GymnastProgrammeAssignmentHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "programmeId" TEXT,
  "stageId" TEXT,
  "programmeName" TEXT NOT NULL,
  "stageName" TEXT,
  "startedAt" DATETIME NOT NULL,
  "endedAt" DATETIME,
  "changeReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "GymnastProgrammeAssignmentHistory_organisationId_gymnastId_startedAt_idx" ON "GymnastProgrammeAssignmentHistory"("organisationId","gymnastId","startedAt");
CREATE INDEX "GymnastProgrammeAssignmentHistory_gymnastId_endedAt_idx" ON "GymnastProgrammeAssignmentHistory"("gymnastId","endedAt");

CREATE TABLE "TrainingGroupProgrammeAssignmentHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "trainingGroupId" TEXT NOT NULL,
  "programmeId" TEXT,
  "stageId" TEXT,
  "programmeName" TEXT NOT NULL,
  "stageName" TEXT,
  "startedAt" DATETIME NOT NULL,
  "endedAt" DATETIME,
  "changeReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "TrainingGroupProgrammeAssignmentHistory_organisationId_trainingGroupId_startedAt_idx" ON "TrainingGroupProgrammeAssignmentHistory"("organisationId","trainingGroupId","startedAt");
CREATE INDEX "TrainingGroupProgrammeAssignmentHistory_trainingGroupId_endedAt_idx" ON "TrainingGroupProgrammeAssignmentHistory"("trainingGroupId","endedAt");

CREATE TABLE "GymnastRulesetAssignmentHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organisationId" TEXT NOT NULL,
  "gymnastId" TEXT NOT NULL,
  "programId" TEXT,
  "levelId" TEXT,
  "programCode" TEXT NOT NULL,
  "programName" TEXT NOT NULL,
  "levelCode" TEXT,
  "levelName" TEXT,
  "startedAt" DATETIME NOT NULL,
  "endedAt" DATETIME,
  "changeReason" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "GymnastRulesetAssignmentHistory_organisationId_gymnastId_startedAt_idx" ON "GymnastRulesetAssignmentHistory"("organisationId","gymnastId","startedAt");
CREATE INDEX "GymnastRulesetAssignmentHistory_gymnastId_endedAt_idx" ON "GymnastRulesetAssignmentHistory"("gymnastId","endedAt");

INSERT INTO "GymnastProgrammeAssignmentHistory" ("id","organisationId","gymnastId","programmeId","stageId","programmeName","stageName","startedAt")
SELECT 'gph_' || a."gymnastId", g."organisationId", a."gymnastId", a."programmeId", a."stageId", p."name", s."name", a."assignedAt"
FROM "GymnastProgrammeAssignment" a
JOIN "Gymnast" g ON g."id"=a."gymnastId"
JOIN "CoachingProgramme" p ON p."id"=a."programmeId"
LEFT JOIN "ProgrammeStage" s ON s."id"=a."stageId";

INSERT INTO "TrainingGroupProgrammeAssignmentHistory" ("id","organisationId","trainingGroupId","programmeId","stageId","programmeName","stageName","startedAt")
SELECT 'tgh_' || a."trainingGroupId", g."organisationId", a."trainingGroupId", a."programmeId", a."stageId", p."name", s."name", a."assignedAt"
FROM "TrainingGroupProgrammeAssignment" a
JOIN "TrainingGroup" g ON g."id"=a."trainingGroupId"
JOIN "CoachingProgramme" p ON p."id"=a."programmeId"
LEFT JOIN "ProgrammeStage" s ON s."id"=a."stageId";

INSERT INTO "GymnastRulesetAssignmentHistory" ("id","organisationId","gymnastId","programId","levelId","programCode","programName","levelCode","levelName","startedAt")
SELECT 'grh_' || a."gymnastId", g."organisationId", a."gymnastId", a."programId", a."levelId", p."code", p."name", l."code", l."name", a."assignedAt"
FROM "GymnastRulesetAssignment" a
JOIN "Gymnast" g ON g."id"=a."gymnastId"
JOIN "RulesetProgram" p ON p."id"=a."programId"
LEFT JOIN "RulesetLevel" l ON l."id"=a."levelId";
