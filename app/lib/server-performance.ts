import "server-only";

const DEFAULT_SLOW_THRESHOLD_MS = 750;

export function startServerTiming() {
  return Date.now();
}

function slowThresholdMs() {
  const configured = Number(process.env.VIAFORM_SLOW_QUERY_MS);
  return Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_SLOW_THRESHOLD_MS;
}

export function logServerTiming(
  operation: string,
  startedAt: number,
  details: Record<string, string | number | boolean | null> = {},
) {
  const durationMs = Date.now() - startedAt;
  if (process.env.VIAFORM_PERFORMANCE_LOGS !== "1" && durationMs < slowThresholdMs()) return;

  console.info(JSON.stringify({
    level: "info",
    event: "viaform.performance",
    operation,
    durationMs,
    region: process.env.VERCEL_REGION ?? null,
    ...details,
  }));
}
