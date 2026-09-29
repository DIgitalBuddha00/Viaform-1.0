"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COACHING_ROLES, DELEGATED_CAPABILITIES } from "@/app/lib/access-control";
import { makePassword, makePin, normaliseEmail, requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const field = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const checked = (data: FormData, key: string) => data.getAll(key).map(String);
const allowed = <T extends string>(values: string[], options: readonly T[]) =>
  Array.from(new Set(values.filter((value): value is T => options.includes(value as T))));

async function peopleManager() {
  const c = await requireAuthContext();
  if (!c.access.canManagePeopleAndRoles) redirect("/more?error=permission");
  return c;
}
async function member(id: string, organisationId: string) {
  return prisma.organisationMembership.findFirst({ where: { id, organisationId }, include: { user: true } });
}

export async function createStaffMember(data: FormData) {
  const c = await peopleManager();
  const displayName = field(data, "displayName");
  const email = normaliseEmail(data.get("email"));
  const password = String(data.get("password") ?? "");
  if (!displayName || !email || password.length < 10) return;
  const existing = await prisma.user.findUnique({ where: { email }, include: { memberships: true } });
  if (existing?.memberships.some((membership) => membership.organisationId === c.organisation.id)) return;
  const roles = allowed(checked(data, "coachingRoles"), COACHING_ROLES);
  const capabilities = allowed(checked(data, "delegatedCapabilities"), DELEGATED_CAPABILITIES);
  const credentials = makePassword(password);
  await prisma.$transaction(async (tx) => {
    const user = existing ?? await tx.user.create({
      data: { email, displayName, passwordHash: credentials.hash, passwordSalt: credentials.salt },
    });
    if (existing) await tx.user.update({ where: { id: user.id }, data: { displayName, isActive: true } });
    await tx.organisationMembership.create({
      data: {
        userId: user.id,
        organisationId: c.organisation.id,
        isAdministrator: c.access.canManageAdministratorRole && data.get("isAdministrator") === "on",
        coachingRoles: JSON.stringify(roles),
        delegatedCapabilities: JSON.stringify(capabilities),
      },
    });
  }).catch(() => null);
  revalidatePath("/people");
}

export async function updateStaffAccess(data: FormData) {
  const c = await peopleManager();
  const target = await member(field(data, "membershipId"), c.organisation.id);
  if (!target || (target.isAdministrator && !c.access.canManageAdministratorRole)) return;
  const roles = allowed(checked(data, "coachingRoles"), COACHING_ROLES);
  const capabilities = allowed(checked(data, "delegatedCapabilities"), DELEGATED_CAPABILITIES);
  const update: { coachingRoles: string; delegatedCapabilities: string; isAdministrator?: boolean } = {
    coachingRoles: JSON.stringify(roles),
    delegatedCapabilities: JSON.stringify(capabilities),
  };
  if (c.access.canManageAdministratorRole) {
    const requestedAdmin = data.get("isAdministrator") === "on";
    update.isAdministrator = target.id === c.membership.id ? true : requestedAdmin;
  }
  await prisma.organisationMembership.update({ where: { id: target.id }, data: update });
  revalidatePath("/people");
}

export async function updateStaffIdentity(data: FormData) {
  const c = await peopleManager();
  const target = await member(field(data, "membershipId"), c.organisation.id);
  const displayName = field(data, "displayName");
  if (!target || !displayName) return;
  await prisma.user.update({ where: { id: target.userId }, data: { displayName } });
  revalidatePath("/people");
}

export async function setStaffActive(data: FormData) {
  const c = await peopleManager();
  const target = await member(field(data, "membershipId"), c.organisation.id);
  if (!target || target.id === c.membership.id || (target.isAdministrator && !c.access.canManageAdministratorRole)) return;
  const isActive = field(data, "active") === "true";
  await prisma.organisationMembership.update({ where: { id: target.id }, data: { isActive } });
  if (!isActive) await prisma.authSession.deleteMany({ where: { userId: target.userId, organisationId: c.organisation.id } });
  revalidatePath("/people");
}

export async function resetStaffPassword(data: FormData) {
  const c = await peopleManager();
  const target = await member(field(data, "membershipId"), c.organisation.id);
  const password = String(data.get("password") ?? "");
  if (!target || password.length < 10 || (target.isAdministrator && !c.access.canManageAdministratorRole)) return;
  const credentials = makePassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: target.userId }, data: { passwordHash: credentials.hash, passwordSalt: credentials.salt } }),
    prisma.authSession.deleteMany({ where: { userId: target.userId } }),
  ]);
  revalidatePath("/people");
}

export async function resetStaffPin(data:FormData){const c=await peopleManager();const target=await member(field(data,"membershipId"),c.organisation.id),pin=field(data,"pin");if(!target||!/^\d{4,8}$/.test(pin))return;const x=makePin(pin);await prisma.organisationMembership.update({where:{id:target.id},data:{pinHash:x.hash,pinSalt:x.salt}});revalidatePath("/people");}
