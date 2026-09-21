"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

export async function createGroup(data: FormData) {
  const context = await requireAuthContext();
  if (!context.access.canManagePeopleAndRoles) redirect("/groups?error=permission");
  const name = value(data, "name");
  if (!name) redirect("/groups?error=group-name");
  await prisma.trainingGroup.create({ data: { name, organisationId: context.organisation.id } }).catch(() => null);
  revalidatePath("/groups");
}

export async function createGymnast(data: FormData) {
  const context = await requireAuthContext();
  if (!context.access.canManagePeopleAndRoles) redirect("/groups?error=permission");
  const name = value(data, "name");
  if (!name) redirect("/groups?error=gymnast-name");
  const dateText = value(data, "dateOfBirth");
  const groupId = value(data, "groupId");
  const group = groupId ? await prisma.trainingGroup.findFirst({ where: { id: groupId, organisationId: context.organisation.id } }) : null;
  await prisma.gymnast.create({
    data: {
      name, organisationId: context.organisation.id,
      dateOfBirth: dateText ? new Date(dateText + "T00:00:00.000Z") : null,
      groups: group ? { create: { trainingGroupId: group.id, isPrimary: true } } : undefined,
    },
  });
  revalidatePath("/groups");
}
