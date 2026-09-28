export const ROTATION_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function clock(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function monday(date: Date) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  value.setUTCDate(value.getUTCDate() - (value.getUTCDay() + 6) % 7);
  return value;
}

export function rotationVariant(plan: { anchorDate: Date; weeksPerVariant: number; variantCount: number }, date: Date) {
  const weeks = Math.floor((monday(date).getTime() - monday(plan.anchorDate).getTime()) / 604800000);
  return ((Math.floor(weeks / plan.weeksPerVariant) % plan.variantCount) + plan.variantCount) % plan.variantCount;
}

export function rotationDay(date: Date) {
  return ROTATION_DAYS[(date.getUTCDay() + 6) % 7];
}

export function overlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return minutes(aStart) < minutes(bEnd) && minutes(aEnd) > minutes(bStart);
}
