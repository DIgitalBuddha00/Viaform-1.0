ALTER TABLE "OrganisationMembership" ADD COLUMN "pinHash" TEXT;
ALTER TABLE "OrganisationMembership" ADD COLUMN "pinSalt" TEXT;
ALTER TABLE "AuthSession" ADD COLUMN "activeMembershipId" TEXT;
ALTER TABLE "OrganisationMembership" ADD COLUMN "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrganisationMembership" ADD COLUMN "pinLockedUntil" DATETIME;
