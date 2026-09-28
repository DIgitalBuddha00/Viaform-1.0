import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import {
  finishTrainingSession,
  markAllTrainingPresent,
  recordTrainingAttendance,
  recordTrainingEvidence,
  reopenTrainingSession,
  startTrainingSession,
  undoLastTrainingEvidence,
} from "@/app/actions/live-training";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { groupScopeWhere } from "@/app/lib/coaching-scope";

export const dynamic = "force-dynamic";

const apparatusLabel: Record<string, string> = {
  VAULT: "Vault",
  UNEVEN_BARS: "Uneven Bars",
  BALANCE_BEAM: "Balance Beam",
  FLOOR_EXERCISE: "Floor Exercise",
  PHYSICAL_PREPARATION: "Physical Preparation",
};

const outcomeLabel: Record<string, string> = {
  MADE: "Made",
  MISSED: "Missed",
  SPOTTED: "Spotted",
};

export default async function LiveTrainingSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ block?: string; station?: string }>;
}) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const query = await searchParams;

  const session = await prisma.trainingSession.findFirst({
    where: {
      id,
      organisationId: c.organisation.id,
      trainingGroup: groupScopeWhere(c.organisation.id, c.membership.id, c.access),
    },
    include: {
      trainingGroup: true,
      blocks: {
        orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
        include: { targetGymnast: { select: { name: true } }, stations: { orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] } },
      },
      gymnasts: { include: { gymnast: true }, orderBy: { assignedAt: "asc" } },
      evidence: { orderBy: { recordedAt: "asc" } },
      attendance: true,
      facilityAssignment: { include: { location: true } },
    },
  });
  if (!session) notFound();

  const selectedBlock =
    session.blocks.find((block) => block.id === query.block) ??
    session.blocks.find((block) => block.category === "APPARATUS") ??
    session.blocks[0] ??
    null;

  const selectedStation = selectedBlock?.stations.find((station) => station.id === query.station) ?? null;
  const blockEvidence = selectedBlock
    ? session.evidence.filter((entry) =>
        entry.blockId === selectedBlock.id && (!selectedStation || entry.stationId === selectedStation.id)
      )
    : [];
  const made = blockEvidence.filter((entry) => entry.outcome === "MADE").length;
  const missed = blockEvidence.filter((entry) => entry.outcome === "MISSED").length;
  const spotted = blockEvidence.filter((entry) => entry.outcome === "SPOTTED").length;
  const isLive = session.status === "IN_PROGRESS";
  const attendanceByGymnast = new Map(session.attendance.map((entry) => [entry.gymnastId, entry.status]));
  const presentCount = session.attendance.filter((entry) => entry.status === "PRESENT" || entry.status === "LATE").length;
  const routineApparatusByTraining: Record<string, string> = {
    VAULT: "VAULT",
    UNEVEN_BARS: "BARS",
    BALANCE_BEAM: "BEAM",
    FLOOR_EXERCISE: "FLOOR",
  };
  const selectedRoutineApparatus = selectedBlock?.apparatus ? routineApparatusByTraining[selectedBlock.apparatus] : undefined;
  const currentRoutines = selectedRoutineApparatus && session.gymnasts.length
    ? await prisma.gymnastRoutine.findMany({
        where: {
          gymnastId: { in: session.gymnasts.map((entry) => entry.gymnastId) },
          apparatus: selectedRoutineApparatus,
          purpose: "CURRENT",
          status: "ACTIVE",
        },
        include: {
          elements: { include: { elementDefinition: true }, orderBy: { orderIndex: "asc" } },
          vaults: { include: { vaultDefinition: true }, orderBy: { orderIndex: "asc" } },
          customItems: { orderBy: { orderIndex: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];
  const currentRoutineByGymnast = new Map<string, (typeof currentRoutines)[number]>();
  for (const routine of currentRoutines) {
    if (!currentRoutineByGymnast.has(routine.gymnastId)) currentRoutineByGymnast.set(routine.gymnastId, routine);
  }

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page"><a href="/training" className="workspace-back">← Training</a><div className="workspace-hero"><div><p className="workspace-kicker">{session.trainingGroup.name}</p><h1>{session.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {session.startTime}–{session.endTime}
              {session.facilityAssignment ? " · " + session.facilityAssignment.location.name : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">{session.status}</span>
            <a href={"/planning/" + session.id} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Edit session</a>
            {session.status === "COMPLETED" && (
              <form action={reopenTrainingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Reopen session</button>
              </form>
            )}
            {session.status === "PLANNED" && (
              <form action={startTrainingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white">Start session</button>
              </form>
            )}
            {isLive && (
              <form action={finishTrainingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Finish session</button>
              </form>
            )}
          </div>
        </div>

        <details className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5" open={isLive && session.attendance.length < session.gymnasts.length}>
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Attendance</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{presentCount} present / late · {session.gymnasts.length} assigned</p>
              </div>
              {isLive && <span className="text-sm font-semibold">Tap to record →</span>}
            </div>
          </summary>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            {isLive && (
              <form action={markAllTrainingPresent} className="mb-3">
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Mark all present</button>
              </form>
            )}
            <div className="grid gap-2">
              {session.gymnasts.map((entry) => {
                const status = attendanceByGymnast.get(entry.gymnastId) ?? "NOT_RECORDED";
                return (
                  <div key={entry.gymnastId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3">
                    <div>
                      <p className="font-medium">{entry.gymnast.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{status.replaceAll("_", " ")}</p>
                    </div>
                    {isLive && (
                      <div className="flex flex-wrap gap-2">
                        {(["PRESENT", "ABSENT", "LATE"] as const).map((attendanceStatus) => (
                          <form key={attendanceStatus} action={recordTrainingAttendance}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <input type="hidden" name="gymnastId" value={entry.gymnastId} />
                            <button
                              name="status"
                              value={attendanceStatus}
                              className={"rounded-lg border px-3 py-2 text-xs font-semibold " + (status === attendanceStatus ? "border-[var(--foreground)]" : "border-[var(--border)]")}
                            >
                              {attendanceStatus === "PRESENT" ? "Present" : attendanceStatus === "ABSENT" ? "Absent" : "Late"}
                            </button>
                          </form>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {session.blocks.map((block) => (
              <a
                key={block.id}
                href={"/training/" + session.id + "?block=" + block.id}
                className={"rounded-xl border px-4 py-3 text-sm " + (selectedBlock?.id === block.id ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}
              >
                <span className="block">{block.title}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{block.targetGymnast?.name??"Whole group"} · {block.apparatus ? apparatusLabel[block.apparatus] ?? block.apparatus : block.category}</span>
              </a>
            ))}
          </div>
        </div>

        {!selectedBlock ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <h2 className="font-semibold">No planned blocks</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Add blocks in Planning before capturing block-level training evidence.</p>
            <a href={"/planning/" + session.id} className="mt-4 inline-block text-sm font-semibold">Open plan →</a>
          </div>
        ) : (
          <>
            {selectedBlock.stations.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Circuit / station</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={"/training/" + session.id + "?block=" + selectedBlock.id}
                    className={"rounded-xl border px-3 py-2 text-sm " + (!selectedStation ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}
                  >
                    Whole block
                  </a>
                  {selectedBlock.stations.map((station) => (
                    <a
                      key={station.id}
                      href={"/training/" + session.id + "?block=" + selectedBlock.id + "&station=" + station.id}
                      className={"rounded-xl border px-3 py-2 text-sm " + (selectedStation?.id === station.id ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}
                    >
                      {station.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <article className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Current block</p>
                  <h2 className="mt-1 text-2xl font-semibold">{selectedBlock.title}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {selectedBlock.apparatus ? apparatusLabel[selectedBlock.apparatus] ?? selectedBlock.apparatus : selectedBlock.category}
                    {selectedBlock.durationMin ? " · " + selectedBlock.durationMin + " min" : ""}
                    {selectedBlock.targetCount ? " · target " + selectedBlock.targetCount : ""}
                    {selectedBlock.targetGymnast ? " · " + selectedBlock.targetGymnast.name : " · whole group"}
                  </p>
                  {selectedBlock.notes&&<p className="mt-2 text-sm text-[var(--muted)]">{selectedBlock.notes}</p>}
                  {selectedBlock.groupObjective && <p className="mt-3 text-sm">{selectedBlock.groupObjective}</p>}
                  {selectedStation && (
                    <div className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm">
                      <p className="font-semibold">{selectedStation.name}</p>
                      {selectedStation.objective && <p className="mt-1">{selectedStation.objective}</p>}
                      {selectedStation.drills && <p className="mt-2 text-[var(--muted)]">Skills / drills: {selectedStation.drills}</p>}
                      {selectedStation.equipment && <p className="mt-1 text-[var(--muted)]">Equipment: {selectedStation.equipment}</p>}
                      {selectedStation.setup && <p className="mt-1 text-[var(--muted)]">Setup: {selectedStation.setup}</p>}
                      {selectedStation.cues && <p className="mt-1 text-[var(--muted)]">Cues: {selectedStation.cues}</p>}
                      {(selectedStation.easierOption || selectedStation.harderOption) && (
                        <p className="mt-1 text-[var(--muted)]">
                          {selectedStation.easierOption ? "Easier: " + selectedStation.easierOption : ""}
                          {selectedStation.easierOption && selectedStation.harderOption ? " · " : ""}
                          {selectedStation.harderOption ? "Harder: " + selectedStation.harderOption : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Made {made}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Missed {missed}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Spotted {spotted}</span>
                </div>
              </div>
            </article>

            <div className="mt-5 grid gap-3">
              {session.gymnasts.filter(entry=>!selectedBlock.targetGymnastId||entry.gymnastId===selectedBlock.targetGymnastId).map((entry) => {
                const evidence = blockEvidence.filter((item) => item.gymnastId === entry.gymnastId);
                const latest = evidence[evidence.length - 1];
                const routinePlan = currentRoutineByGymnast.get(entry.gymnastId) ?? null;
                return (
                  <article key={entry.gymnastId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_auto] lg:items-center">
                      <div>
                        <a href={"/gymnasts/" + entry.gymnastId} className="font-semibold hover:underline">{entry.gymnast.name}</a>
                        <p className="mt-1 text-xs text-[var(--muted)]">Attendance: {(attendanceByGymnast.get(entry.gymnastId) ?? "NOT_RECORDED").replaceAll("_", " ")}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {evidence.length
                            ? evidence.length + " observations · latest " + outcomeLabel[latest.outcome]
                            : "No evidence recorded for this block"}
                        </p>
                      </div>
                      {isLive ? (
                        <div className="flex flex-wrap gap-2">
                          {(["MADE", "MISSED", "SPOTTED"] as const).map((outcome) => (
                            <form key={outcome} action={recordTrainingEvidence}>
                              <input type="hidden" name="sessionId" value={session.id} />
                              <input type="hidden" name="blockId" value={selectedBlock.id} />
                              <input type="hidden" name="gymnastId" value={entry.gymnastId} />
                              <input type="hidden" name="stationId" value={selectedStation?.id ?? ""} />
                              <button name="outcome" value={outcome} className="min-w-24 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">
                                {outcomeLabel[outcome]}
                              </button>
                            </form>
                          ))}
                          {latest && (
                            <form action={undoLastTrainingEvidence}>
                              <input type="hidden" name="sessionId" value={session.id} />
                              <input type="hidden" name="blockId" value={selectedBlock.id} />
                              <input type="hidden" name="gymnastId" value={entry.gymnastId} />
                              <input type="hidden" name="stationId" value={selectedStation?.id ?? ""} />
                              <button className="rounded-xl px-3 py-3 text-sm text-[var(--muted)]">Undo</button>
                            </form>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--muted)]">
                          {latest ? "Latest: " + outcomeLabel[latest.outcome] : "—"}
                        </span>
                      )}
                    </div>
                    {routinePlan && (
                      <details className="mt-3 border-t border-[var(--border)] pt-3">
                        <summary className="cursor-pointer text-xs font-semibold">
                          Current {apparatusLabel[selectedBlock.apparatus ?? ""] ?? "apparatus"} plan · {routinePlan.name}
                        </summary>
                        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Record against a specific saved routine item when that is what is being trained. Whole-block capture above remains available for broader work.</p>
                        <div className="mt-3 grid gap-2">
                          {routinePlan.apparatus === "VAULT"
                            ? routinePlan.vaults.map((item) => {
                                const itemEvidence = evidence.filter((entry) => entry.routineVaultId === item.id);
                                return (
                                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div><p className="text-sm font-semibold">{item.role === "PRIMARY" ? "Primary" : "Secondary"} · {item.vaultDefinition.officialNumber} · D {item.vaultDefinition.dValue.toFixed(1)}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.vaultDefinition.name}</p></div>
                                      <span className="text-xs text-[var(--muted)]">{itemEvidence.length} observations</span>
                                    </div>
                                    {isLive && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {(["MADE", "MISSED", "SPOTTED"] as const).map((outcome) => (
                                          <form key={outcome} action={recordTrainingEvidence}>
                                            <input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={selectedBlock.id}/><input type="hidden" name="gymnastId" value={entry.gymnastId}/><input type="hidden" name="stationId" value={selectedStation?.id ?? ""}/><input type="hidden" name="routineVaultId" value={item.id}/>
                                            <button name="outcome" value={outcome} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">{outcomeLabel[outcome]}</button>
                                          </form>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            : routinePlan.elements.map((item, index) => {
                                const itemEvidence = evidence.filter((entry) => entry.routineElementId === item.id);
                                return (
                                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div><p className="text-sm font-semibold">{index + 1} · {item.elementDefinition.officialNumber} · {item.elementDefinition.difficulty ?? "—"}</p><p className="mt-1 text-xs text-[var(--muted)]">{item.elementDefinition.name}</p></div>
                                      <span className="text-xs text-[var(--muted)]">{itemEvidence.length} observations</span>
                                    </div>
                                    {isLive && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {(["MADE", "MISSED", "SPOTTED"] as const).map((outcome) => (
                                          <form key={outcome} action={recordTrainingEvidence}>
                                            <input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={selectedBlock.id}/><input type="hidden" name="gymnastId" value={entry.gymnastId}/><input type="hidden" name="stationId" value={selectedStation?.id ?? ""}/><input type="hidden" name="routineElementId" value={item.id}/>
                                            <button name="outcome" value={outcome} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">{outcomeLabel[outcome]}</button>
                                          </form>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          {routinePlan.customItems.map((item, index) => {
                            const itemEvidence = evidence.filter((entry) => entry.routineCustomItemId === item.id);
                            return (
                              <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div><p className="text-sm font-semibold">{routinePlan.apparatus === "VAULT" ? (item.role === "PRIMARY" ? "Primary" : "Secondary") : index + 1} · {item.label}</p><p className="mt-1 text-xs text-[var(--muted)]">Coach-authored routine content</p></div>
                                  <span className="text-xs text-[var(--muted)]">{itemEvidence.length} observations</span>
                                </div>
                                {isLive && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {(["MADE", "MISSED", "SPOTTED"] as const).map((outcome) => (
                                      <form key={outcome} action={recordTrainingEvidence}>
                                        <input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="blockId" value={selectedBlock.id}/><input type="hidden" name="gymnastId" value={entry.gymnastId}/><input type="hidden" name="stationId" value={selectedStation?.id ?? ""}/><input type="hidden" name="routineCustomItemId" value={item.id}/>
                                        <button name="outcome" value={outcome} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold">{outcomeLabel[outcome]}</button>
                                      </form>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <a href={"/gymnasts/" + entry.gymnastId + "/routines/" + routinePlan.id + "?tab=build"} className="mt-3 inline-block text-xs font-semibold">Open routine Build →</a>
                      </details>
                    )}
                  </article>
                );
              })}
            </div>

            {!session.gymnasts.length && (
              <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
                This session has no assigned gymnasts. Update its roster in Planning.
              </p>
            )}
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
          <p className="text-sm text-[var(--muted)]">
            Evidence records what happened in this training context. It does not make a progression or selection decision for the coach.
          </p>
          <a href={"/planning/" + session.id} className="text-sm font-semibold">View session plan →</a>
        </div>
      </section>
    </AppShell>
  );
}
