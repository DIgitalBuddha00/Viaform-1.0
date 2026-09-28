"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
const value = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

function timeMinutes(time: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

async function planningManager() {
  const context = await requireAuthContext();
  if (!context.access.canManageRotations) redirect("/groups?error=permission");
  return context;
}

async function groupInOrganisation(id: string, organisationId: string) {
  return prisma.trainingGroup.findFirst({ where: { id, organisationId } });
}

function slotInput(data: FormData) {
  const dayOfWeek = value(data, "dayOfWeek");
  const startTime = value(data, "startTime");
  const endTime = value(data, "endTime");
  const start = timeMinutes(startTime);
  const end = timeMinutes(endTime);
  if (!DAYS.includes(dayOfWeek as (typeof DAYS)[number]) || start === null || end === null || end <= start) {
    return null;
  }
  return {
    dayOfWeek,
    startTime,
    endTime,
    notes: value(data, "notes") || null,
    orderIndex: DAYS.indexOf(dayOfWeek as (typeof DAYS)[number]) * 1440 + start,
    start,
    end,
  };
}

async function overlaps(trainingGroupId: string, dayOfWeek: string, start: number, end: number, excludeId?: string) {
  const slots = await prisma.trainingGroupSchedule.findMany({
    where: {
      trainingGroupId,
      dayOfWeek,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { startTime: true, endTime: true },
  });
  return slots.some((slot) => {
    const existingStart = timeMinutes(slot.startTime);
    const existingEnd = timeMinutes(slot.endTime);
    return existingStart !== null && existingEnd !== null && start < existingEnd && end > existingStart;
  });
}

export async function createGroupScheduleSlot(data: FormData) {
  const context = await planningManager();
  const trainingGroupId = value(data, "groupId");
  const group = await groupInOrganisation(trainingGroupId, context.organisation.id);
  const slot = slotInput(data);
  if (!group || !slot) return;
  if (await overlaps(trainingGroupId, slot.dayOfWeek, slot.start, slot.end)) return;
  await prisma.trainingGroupSchedule.create({
    data: {
      trainingGroupId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: slot.notes,
      orderIndex: slot.orderIndex,
    },
  }).catch(() => null);
  revalidatePath("/groups/" + trainingGroupId);
}

export async function updateGroupScheduleSlot(data: FormData) {
  const context = await planningManager();
  const trainingGroupId = value(data, "groupId");
  const scheduleId = value(data, "scheduleId");
  const group = await groupInOrganisation(trainingGroupId, context.organisation.id);
  const existing = await prisma.trainingGroupSchedule.findFirst({ where: { id: scheduleId, trainingGroupId } });
  const slot = slotInput(data);
  if (!group || !existing || !slot) return;
  if (await overlaps(trainingGroupId, slot.dayOfWeek, slot.start, slot.end, scheduleId)) return;
  await prisma.trainingGroupSchedule.update({
    where: { id: scheduleId },
    data: {
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: slot.notes,
      orderIndex: slot.orderIndex,
    },
  }).catch(() => null);
  revalidatePath("/groups/" + trainingGroupId);
}

export async function deleteGroupScheduleSlot(data: FormData) {
  const context = await planningManager();
  const trainingGroupId = value(data, "groupId");
  const scheduleId = value(data, "scheduleId");
  if (!await groupInOrganisation(trainingGroupId, context.organisation.id)) return;
  await prisma.trainingGroupSchedule.deleteMany({ where: { id: scheduleId, trainingGroupId } });
  revalidatePath("/groups/" + trainingGroupId);
}
