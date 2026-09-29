ALTER TABLE "OrganisationMembership" ADD COLUMN "pinHash" TEXT;
ALTER TABLE "OrganisationMembership" ADD COLUMN "pinSalt" TEXT;
ALTER TABLE "AuthSession" ADD COLUMN "activeMembershipId" TEXT;
