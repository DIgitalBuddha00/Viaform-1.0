-- Core Coaching 2C: canonical group coaching assignments.
-- Structure only. No users, coaches, groups, gymnasts or demo records are inserted.
CREATE TABLE "TrainingGroupCoach" (
  "trainingGroupId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "assignmentRole" TEXT NOT NULL DEFAULT 'COACH',
  "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("trainingGroupId", "membershipId"),
  CONSTRAINT "TrainingGroupCoach_trainingGroupId_fkey" FOREIGN KEY ("trainingGroupId") REFERENCES "TrainingGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TrainingGroupCoach_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "OrganisationMembership" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TrainingGroupCoach_membershipId_idx" ON "TrainingGroupCoach"("membershipId");
