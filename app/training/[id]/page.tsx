import { notFound } from "next/navigation";
import { LiveGymnastCard } from "@/app/components/live-gymnast-card";
import { AppShell } from "@/app/components/app-shell";
import {
  finishTrainingSession,
  pauseTrainingSession,
  resumeTrainingSession,
  markAllTrainingPresent,
  recordTrainingAttendance,
  setLeavingEarly,
  recordTrainingCheckIn,
  recordTrainingEvidence,
  reopenTrainingSession,
  startTrainingSession,
  decrementTrainingEvidence,
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
  BALK: "Balk",
};

export default async function LiveTrainingSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ block?: string; station?: string; work?: string; phase?: string }>;
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
        include: { targetGymnast: { select: { name: true } }, workItems: { include: { targetGymnast: { select: { name: true } }, elementDefinition:true, vaultDefinition:true, trainingResource:true, landingResource:true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] }, stations: { include: { workItem: true, skill: true }, orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }] } },
      },
      gymnasts: { include: { gymnast: true }, orderBy: { assignedAt: "asc" } },
      evidence: { orderBy: { recordedAt: "asc" } },
      attendance: true,
      checkIns: true,
      facilityAssignment: { include: { location: true } },
    },
  });
  if (!session) notFound();

  const arrivalSelected = query.phase === "arrival" || (!query.block && !session.attendance.length);
  const selectedBlock = arrivalSelected ? null : (
    session.blocks.find((block) => block.id === query.block) ?? session.blocks[0] ?? null
  );

  const selectedStation = selectedBlock?.stations.find((station) => station.id === query.station) ?? null;
  const selectedWorkItems = selectedBlock?.workItems ?? [];
  const selectedWorkItem = selectedWorkItems.find(item=>item.id===query.work) ?? (selectedStation?.workItemId ? selectedWorkItems.find(item=>item.id===selectedStation.workItemId) : null) ?? (!selectedStation ? selectedWorkItems[0] : null) ?? null;
  const blockEvidence = selectedBlock
    ? session.evidence.filter((entry) =>
        entry.blockId === selectedBlock.id && (!selectedStation || entry.stationId === selectedStation.id)
      )
    : [];
  const made = blockEvidence.filter((entry) => entry.outcome === "MADE").length;
  const missed = blockEvidence.filter((entry) => entry.outcome === "MISSED").length;
  const spotted = blockEvidence.filter((entry) => entry.outcome === "SPOTTED").length;
  const balked = blockEvidence.filter((entry) => entry.outcome === "BALK").length;
  const isLive = session.status === "IN_PROGRESS";
  const attendanceByGymnast = new Map(session.attendance.map((entry) => [entry.gymnastId, entry]));
  const presentCount = session.attendance.filter((entry) => entry.status === "PRESENT" || entry.status === "LATE").length;
  const routineApparatusByTraining: Record<string, string> = {
    VAULT: "VAULT",
    UNEVEN_BARS: "BARS",
    BALANCE_BEAM: "BEAM",
    FLOOR_EXERCISE: "FLOOR",
  };
  const guidedBlock = !!selectedBlock && selectedBlock.behaviour==="GUIDED";
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
            {["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status) && (<><form action={pauseTrainingSession}><input type="hidden" name="sessionId" value={session.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Pause session</button></form><form action={finishTrainingSession}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Finish session</button></form></>)}
            {session.status === "PAUSED" && (<><form action={resumeTrainingSession}><input type="hidden" name="sessionId" value={session.id} /><button className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white">Resume session</button></form><form action={finishTrainingSession}><input type="hidden" name="sessionId" value={session.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Finish session</button></form></>)}
          </div>
        </div>

        {arrivalSelected && <details className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5" open>
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Attendance</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{presentCount} present / late · {session.gymnasts.length} assigned</p>
              </div>
              <span className="text-sm font-semibold">Arrival & check-in</span>
            </div>
          </summary>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            {isLive && (
              <form action={markAllTrainingPresent} className="mb-3">
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">Mark all present</button>
              </form>
            )}
            <div className="live-arrival-grid">
              {session.gymnasts.map((entry) => {
                const attendance = attendanceByGymnast.get(entry.gymnastId); const status = attendance?.status ?? "NOT_RECORDED";
                return (
                  <div key={entry.gymnastId} className="live-arrival-card">
                    <div>
                      <p className="font-medium">{entry.gymnast.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{status.replaceAll("_", " ")}</p>
                    </div>
                    {["PLANNED","IN_PROGRESS","PAUSED"].includes(session.status) && (
                      <div className="live-arrival-actions">
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
                      <form action={setLeavingEarly}><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="gymnastId" value={entry.gymnastId}/><button className={attendance?.leavingEarly?"is-selected":""}>Leaving early</button></form></div>
                    )}
                    <div className="live-checkin"><span>How are you feeling?</span><div>{[["GREAT","Great"],["GOOD","Good"],["OKAY","Okay"],["LOW","Low"],["NOT_WELL","Not well"]].map(([v,l])=><form key={v} action={recordTrainingCheckIn}><input type="hidden" name="sessionId" value={session.id}/><input type="hidden" name="gymnastId" value={entry.gymnastId}/><input type="hidden" name="feeling" value={v}/><button>{l}</button></form>)}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </details>}

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2"><a href={"/training/"+session.id+"?phase=arrival"} className={"rounded-xl border px-4 py-3 text-sm "+(arrivalSelected?"border-[var(--foreground)] font-semibold":"border-[var(--border)]")}><span className="block">Arrival & check-in</span><span className="mt-1 block text-xs text-[var(--muted)]">{presentCount} of {session.gymnasts.length} arrived</span></a>
            {session.blocks.map((block) => (
              <a
                key={block.id}
                href={"/training/" + session.id + "?block=" + block.id}
                className={"rounded-xl border px-4 py-3 text-sm " + (selectedBlock?.id === block.id ? "border-[var(--foreground)] font-semibold" : "border-[var(--border)]")}
              >
                <span className="block">{block.title}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{block.targetGymnast?.name??"Whole group"} · {block.apparatus ? apparatusLabel[block.apparatus] ?? block.apparatus : block.category==="WARM_UP"?"Warm-up":block.category==="COOLDOWN"?"Cooldown":block.category.replaceAll("_"," ")}</span>
              </a>
            ))}
          </div>
        </div>

        {arrivalSelected ? null : !selectedBlock ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <h2 className="font-semibold">No planned blocks</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Add blocks in Planning before capturing block-level training evidence.</p>
            <a href={"/planning/" + session.id} className="mt-4 inline-block text-sm font-semibold">Open plan →</a>
          </div>
        ) : (
          <>
            <article className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Current block</p>
                  <h2 className="mt-1 text-2xl font-semibold">{selectedBlock.title}</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {selectedBlock.apparatus ? apparatusLabel[selectedBlock.apparatus] ?? selectedBlock.apparatus : selectedBlock.category==="WARM_UP"?"Warm-up":selectedBlock.category==="COOLDOWN"?"Cooldown":selectedBlock.category.replaceAll("_"," ")}
                    {selectedBlock.durationMin ? " · " + selectedBlock.durationMin + " min" : ""}
                    {selectedBlock.targetCount ? " · target " + selectedBlock.targetCount : ""}
                    {selectedBlock.targetGymnast ? " · " + selectedBlock.targetGymnast.name : " · whole group"}
                  </p>
                  {selectedBlock.notes&&<p className="mt-2 text-sm text-[var(--muted)]">{selectedBlock.notes}</p>}
                  {selectedBlock.groupObjective && <p className="mt-3 text-sm">{selectedBlock.groupObjective}</p>}
                  {selectedStation && (
                    <div className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm">
                      <p className="font-semibold">{selectedStation.name}</p>
                      {selectedStation.objective && <p className="mt-1">{selectedStation.objective}</p>}{selectedStation.skill && <p className="mt-1 text-xs font-semibold">Future / library skill · {selectedStation.skill.name}</p>}
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
                {!guidedBlock&&<div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Made {made}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Missed {missed}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Spotted {spotted}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1">Balk {balked}</span>
                </div>}
              </div>
            </article>

            {guidedBlock ? <section className="live-guided-block mt-5"><h3>{selectedBlock.title}</h3><p>{selectedBlock.groupObjective||selectedBlock.notes||"Follow the planned sequence."}</p><div>{selectedWorkItems.map((item,i)=><div key={item.id} className="live-guided-item"><strong>{i+1}</strong><span>{item.title}{item.notes?" · "+item.notes:""}</span></div>)}</div></section> : <div className="live-gymnast-board mt-5">{session.gymnasts.filter(entry=>!selectedBlock.targetGymnastId||entry.gymnastId===selectedBlock.targetGymnastId).map(entry=>{const works=selectedWorkItems.filter(item=>!item.targetGymnastId||item.targetGymnastId===entry.gymnastId).map(item=>({id:item.id,title:item.title,targetCount:item.targetCount,targetGymnastId:item.targetGymnastId}));const evidence=blockEvidence.filter(e=>e.gymnastId===entry.gymnastId).map(e=>({workItemId:e.workItemId,stationId:e.stationId,outcome:e.outcome}));const latestCheck=session.checkIns.filter(c=>c.gymnastId===entry.gymnastId&&c.blockId===selectedBlock.id).sort((a,b)=>b.recordedAt.getTime()-a.recordedAt.getTime())[0]??null;return <LiveGymnastCard key={entry.gymnastId} sessionId={session.id} blockId={selectedBlock.id} gymnast={{id:entry.gymnastId,name:entry.gymnast.name,profileImageUrl:entry.gymnast.profileImageUrl}} isLive={isLive} works={works} stations={selectedBlock.stations.map(s=>({id:s.id,name:s.name,workItemId:s.workItemId}))} evidence={evidence} latestCheck={latestCheck?{feeling:latestCheck.feeling,confidence:latestCheck.confidence,recordedAt:latestCheck.recordedAt.toISOString()}:null}/>} )}</div>}

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
          
        </div>
      </section>
    </AppShell>
  );
}
