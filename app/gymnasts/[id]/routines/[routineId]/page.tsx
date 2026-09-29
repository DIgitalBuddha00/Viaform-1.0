import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import {
  addRoutineCustomItem,
  addRoutineElement,
  addRoutineVault,
  addRoutineSection,
  assignRoutineItemSection,
  archiveGymnastRoutine,
  moveRoutineCustomItem,
  moveRoutineElement,
  moveRoutineSection,
  removeRoutineCustomItem,
  removeRoutineElement,
  removeRoutineVault,
  removeRoutineSection,
  updateRoutineContext,
  updateRoutineCustomItem,
  updateRoutineElement,
  updateRoutineSection,
  updateRoutineStructureContext,
  updateRoutineVault,
} from "@/app/actions/routines";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext, getRulesetSnapshotRules, type RulesetApparatus } from "@/app/lib/rulesets/context";
import { evaluateStoredRoutine } from "@/app/lib/routines/ruleset-evaluation";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { VAULT: "Vault", BARS: "Uneven Bars", BEAM: "Balance Beam", FLOOR: "Floor Exercise" };
const tabs = ["overview", "build", "strategy", "pathway"] as const;
const difficultyValue: Record<string, number> = { A: .1, B: .2, C: .3, D: .4, E: .5, F: .6, G: .7, H: .8, I: .9, J: 1 };

export default async function RoutineWorkspace({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; routineId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id, routineId } = await params;
  const query = await searchParams;
  const tab = tabs.includes(query.tab as (typeof tabs)[number]) ? query.tab! : "overview";

  const gymnast = await prisma.gymnast.findFirst({
    where: { id, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) },
    include: {
      programmeAssignments: { include: { programme: true, stage: true } },
      routines: {
        where: { id: routineId, status: "ACTIVE" },
        include: {
          elements: { include: { elementDefinition: true }, orderBy: { orderIndex: "asc" } },
          vaults: { include: { vaultDefinition: true }, orderBy: { orderIndex: "asc" } },
          customItems: { orderBy: { orderIndex: "asc" } },
          sections: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });
  const routine = gymnast?.routines[0];
  if (!gymnast || !routine) notFound();

  const currentRules = await getGymnastRulesContext(gymnast.id, c.organisation.id);
  const applicableRules = await getRulesetSnapshotRules(
    routine.rulesetPackageCode,
    routine.rulesetLevelCode,
    routine.apparatus as RulesetApparatus,
  );
  const routineEvaluation = evaluateStoredRoutine({
    programCode: routine.rulesetProgramCode,
    apparatus: routine.apparatus,
    levelCode: routine.rulesetLevelCode,
    elements: routine.elements,
    rules: applicableRules,
  });
  const rulesContextChanged = Boolean(
    currentRules &&
    (currentRules.package.code !== routine.rulesetPackageCode || currentRules.level.code !== routine.rulesetLevelCode),
  );
  const href = "/gymnasts/" + gymnast.id + "/routines/" + routine.id;
  const trainingApparatus: Record<string, string> = { VAULT: "VAULT", BARS: "UNEVEN_BARS", BEAM: "BALANCE_BEAM", FLOOR: "FLOOR_EXERCISE" };
  const recentEvidence = await prisma.trainingEvidence.findMany({
    where: { gymnastId: gymnast.id, block: { apparatus: trainingApparatus[routine.apparatus] }, session: { organisationId: c.organisation.id } },
    include: {
      session: { select: { id: true, title: true, sessionDate: true } },
      block: { select: { title: true } },
      station: { select: { name: true } },
    },
    orderBy: { recordedAt: "desc" },
    take: 24,
  });
  const evidenceCounts = recentEvidence.reduce((counts, item) => {
    if (item.outcome === "MADE") counts.made += 1;
    if (item.outcome === "MISSED") counts.missed += 1;
    if (item.outcome === "SPOTTED") counts.spotted += 1;
    return counts;
  }, { made: 0, missed: 0, spotted: 0 });
  const programmeContext = gymnast.programmeAssignments[0] ?? null;
  const linkedEvidence = new Map<string, { total: number; made: number; missed: number; spotted: number }>();
  for (const entry of recentEvidence) {
    const key = entry.routineElementId ?? entry.routineVaultId ?? entry.routineCustomItemId;
    if (!key) continue;
    const counts = linkedEvidence.get(key) ?? { total: 0, made: 0, missed: 0, spotted: 0 };
    counts.total += 1;
    if (entry.outcome === "MADE") counts.made += 1;
    if (entry.outcome === "MISSED") counts.missed += 1;
    if (entry.outcome === "SPOTTED") counts.spotted += 1;
    linkedEvidence.set(key, counts);
  }

  const [catalogueElements, catalogueVaults] = routine.rulesetPackageCode
    ? await Promise.all([
        routine.apparatus !== "VAULT"
          ? prisma.figElementDefinition.findMany({
              where: {
                apparatus: routine.apparatus,
                verificationStatus: "VERIFIED",
                status: "ACTIVE",
                package: { code: routine.rulesetPackageCode, status: "ACTIVE" },
              },
              orderBy: [{ groupCode: "asc" }, { officialNumber: "asc" }, { variantKey: "asc" }],
            })
          : Promise.resolve([]),
        routine.apparatus === "VAULT"
          ? prisma.figVaultDefinition.findMany({
              where: {
                status: "ACTIVE",
                package: { code: routine.rulesetPackageCode, status: "ACTIVE" },
              },
              orderBy: [{ groupNumber: "asc" }, { officialNumber: "asc" }, { variantKey: "asc" }],
            })
          : Promise.resolve([]),
      ])
    : [[], []];

  const canonicalRoutineRequirements = routine.rulesetProgramCode === "GI_WAG" && routine.rulesetLevelCode
    ? await prisma.rulesetRoutineRequirement.findMany({
        where: {
          level: { code: routine.rulesetLevelCode, program: { code: routine.rulesetProgramCode } },
          apparatus: routine.apparatus,
        },
        include: { skill: true },
        orderBy: { sequenceIndex: "asc" },
      })
    : [];
  const expandedCanonicalRequirements = canonicalRoutineRequirements.flatMap((requirement) =>
    Array.from({ length: Math.max(1, requirement.repetitions) }, (_, repetitionIndex) => ({
      id: requirement.id + ":" + repetitionIndex,
      skillName: requirement.skill.name,
      repetition: repetitionIndex + 1,
      repetitions: Math.max(1, requirement.repetitions),
      occurrenceContext: requirement.occurrenceContext,
      sourcePage: requirement.sourcePage,
      notes: requirement.notes,
    })),
  );

  const recognised = routine.elements.filter((item) => item.recognition === "RECOGNISED");
  const rawRecognisedDv = recognised.reduce((sum, item) => sum + (difficultyValue[item.elementDefinition.difficulty ?? ""] ?? 0), 0);

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section className="workspace-page"><a href={"/gymnasts/" + gymnast.id + "/routines"} className="workspace-back">← {gymnast.name} · Routines</a><div className="workspace-hero"><div><p className="workspace-kicker">{labels[routine.apparatus] ?? routine.apparatus} · {routine.purpose === "CURRENT" ? "Current" : "Alternative"}</p><h1>{routine.name}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {routine.rulesetProgramName && routine.rulesetLevelName
                ? "Created under " + routine.rulesetProgramName + " · " + routine.rulesetLevelName + (routine.rulesetVersionLabel ? " · " + routine.rulesetVersionLabel : "")
                : "Created without a verified ruleset snapshot"}
            </p>
          </div>
          <details className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold">Plan settings</summary>
            <form action={updateRoutineContext} className="mt-3 grid gap-2">
              <input type="hidden" name="routineId" value={routine.id} />
              <input name="name" defaultValue={routine.name} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
              <select name="purpose" defaultValue={routine.purpose} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <option value="CURRENT">Current</option><option value="ALTERNATIVE">Alternative</option>
              </select>
              <input type="hidden" name="strategyNote" value={routine.strategyNote ?? ""} />
              <input type="hidden" name="pathwayNote" value={routine.pathwayNote ?? ""} />
              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save settings</button>
            </form>
            <form action={updateRoutineStructureContext} className="mt-4 grid gap-2 border-t border-[var(--border)] pt-3">
              <input type="hidden" name="routineId" value={routine.id}/>
              {routine.apparatus === "VAULT" && <label className="grid gap-1 text-xs font-semibold">Vault programme<select name="vaultMode" defaultValue={routine.vaultMode} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-normal"><option value="ONE_VAULT">One vault</option><option value="TWO_VAULT">Two vaults</option></select></label>}
              {(routine.apparatus === "FLOOR" || routine.apparatus === "BEAM") && <label className="grid gap-1 text-xs font-semibold">Routine duration (seconds)<input type="number" min="0" name="routineDurationSeconds" defaultValue={routine.routineDurationSeconds ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-normal"/></label>}
              {routine.apparatus === "FLOOR" && <><label className="grid gap-1 text-xs font-semibold">Music name<input name="musicFileName" defaultValue={routine.musicFileName ?? ""} placeholder="Track / file name" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-normal"/></label><label className="grid gap-1 text-xs font-semibold">Music reference<input name="musicStorageRef" defaultValue={routine.musicStorageRef ?? ""} placeholder="Storage reference" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-normal"/></label><label className="grid gap-1 text-xs font-semibold">Music duration (seconds)<input type="number" step="0.1" min="0" name="musicDurationSeconds" defaultValue={routine.musicDurationSeconds ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-normal"/></label></>}
              <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save routine structure</button>
            </form>
            <form action={archiveGymnastRoutine} className="mt-2">
              <input type="hidden" name="routineId" value={routine.id} />
              <button className="text-xs font-semibold text-[var(--muted)]">Archive plan</button>
            </form>
          </details>
        </div>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((item) => (
            <a key={item} href={href + "?tab=" + item} className={"rounded-xl border px-4 py-2 text-sm font-semibold capitalize " + (tab === item ? "border-[var(--foreground)] bg-[var(--foreground)] text-white" : "border-[var(--border)]")}>{item}</a>
          ))}
        </nav>

        {tab === "overview" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Evidence snapshot</p>
              <h2 className="mt-1 text-xl font-semibold">Routine overview</h2>
              {routine.apparatus === "VAULT" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Saved vaults</span><strong className="mt-1 block text-2xl">{routine.vaults.length + routine.customItems.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Primary D-value</span><strong className="mt-1 block text-2xl">{routine.vaults.find((item) => item.role === "PRIMARY")?.vaultDefinition.dValue.toFixed(1) ?? "—"}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Groups represented</span><strong className="mt-1 block text-2xl">{new Set(routine.vaults.map((item) => item.vaultDefinition.groupNumber)).size}</strong></div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Elements</span><strong className="mt-1 block text-2xl">{routine.elements.length + routine.customItems.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Canonical recognised</span><strong className="mt-1 block text-2xl">{recognised.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Raw recognised DV</span><strong className="mt-1 block text-2xl">{rawRecognisedDv.toFixed(1)}</strong></div>
                </div>
              )}
              {routineEvaluation ? (
                <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><span className="text-xs text-[var(--muted)]">Verified {routineEvaluation.provider} evaluation</span><strong className="mt-1 block text-2xl">{routineEvaluation.headline}</strong></div>
                    <span className="text-xs font-semibold">{routineEvaluation.status === "READY" ? "Evaluation complete" : "Coach / judge review required"}</span>
                  </div>
                  {routineEvaluation.metrics.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{routineEvaluation.metrics.map((metric) => <span key={metric.label}>{metric.label} {metric.value}</span>)}</div>}
                  {routineEvaluation.findings.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold">{routineEvaluation.findings.length} unresolved evaluation {routineEvaluation.findings.length === 1 ? "item" : "items"}</summary>
                      <div className="mt-2 grid gap-2">
                        {routineEvaluation.findings.map((finding, index) => <p key={finding.code + index} className="rounded-lg border border-[var(--border)] p-2 text-xs text-[var(--muted)]">{finding.message}{finding.sourcePage ? " · source p. " + finding.sourcePage : ""}</p>)}
                      </div>
                    </details>
                  )}
                  <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{routineEvaluation.note}</p>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Raw recognised DV is descriptive only. No bounded canonical evaluator is available for this saved ruleset context.</p>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Strategy</span><p className="mt-2 text-sm">{routine.strategyNote || "Not yet recorded"}</p></div>
                <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Pathway focus</span><p className="mt-2 text-sm">{routine.pathwayNote || "Not yet recorded"}</p></div>
              </div>
            </article>
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold">Current verified context</p>
              {routine.rulesetProgramName && routine.rulesetLevelName ? (
                <>
                  <p className="mt-2 text-sm">{routine.rulesetProgramName} · {routine.rulesetLevelName}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{routine.rulesetVersionLabel ?? "Version snapshot unavailable"}</p>
                  <p className="mt-4 text-2xl font-semibold">{applicableRules.length}</p>
                  <p className="text-xs text-[var(--muted)]">verified snapshot rules in use</p>
                  {rulesContextChanged && <p className="mt-4 rounded-lg border border-[var(--border)] p-3 text-xs text-[var(--muted)]">The gymnast’s current rules assignment has changed since this plan was created. This routine continues to use its saved rules snapshot.</p>}
                </>
              ) : <p className="mt-2 text-sm text-[var(--muted)]">No verified canonical context was snapshotted for this plan.</p>}
            </article>
          </div>
        )}

        {tab === "build" && routine.apparatus !== "VAULT" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Build</p>
              <h2 className="mt-1 text-xl font-semibold">Routine sequence</h2>
              {routine.apparatus === "FLOOR" && routine.sections.length > 0 && (
                <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Floor map</p><span className="text-xs text-[var(--muted)]">Coach-authored spatial context</span></div>
                  <div className="relative mx-auto mt-3 aspect-square w-full max-w-md border-2 border-[var(--border)] bg-[var(--background)]">
                    <div className="absolute inset-1/2 border-l border-t border-dashed border-[var(--border)] opacity-50"/>
                    {routine.sections.map((section, index) => (
                      <div key={section.id}>
                        {section.startX !== null && section.startY !== null && <span title={section.title + " start"} className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--foreground)] bg-[var(--surface)] text-xs font-semibold" style={{ left: (section.startX * 100) + "%", top: (section.startY * 100) + "%" }}>{index + 1}</span>}
                        {section.endX !== null && section.endY !== null && <span title={section.title + " end"} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--foreground)] bg-[var(--foreground)]" style={{ left: (section.endX * 100) + "%", top: (section.endY * 100) + "%" }}/>}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Coordinates run 0–1 from the top-left to bottom-right of the floor. Numbered markers are section starts; small markers are section ends. This records choreography and travel context only and is not a judging inference.</p>
                </div>
              )}
              {routine.apparatus === "BEAM" && routine.sections.length > 0 && (
                <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Beam sequence</p><span className="text-xs text-[var(--muted)]">Coach-authored routine context</span></div>
                  <div className="mt-4 overflow-x-auto pb-2">
                    <div className="relative min-w-[560px] px-6 py-8">
                      <div className="absolute left-6 right-6 top-1/2 h-2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)]"/>
                      <div className="relative grid grid-flow-col auto-cols-fr gap-3">
                        {routine.sections.map((section, index) => (
                          <div key={section.id} className="relative flex min-w-24 flex-col items-center text-center">
                            <span className="z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--foreground)] bg-[var(--background)] text-xs font-semibold">{index + 1}</span>
                            <p className="mt-3 text-xs font-semibold">{section.title}</p>
                            <p className="mt-1 text-[11px] text-[var(--muted)]">{section.sectionType.replaceAll("_", " ").toLowerCase()}</p>
                            {(section.startTimeSec !== null || section.endTimeSec !== null) && <p className="mt-1 text-[11px] text-[var(--muted)]">{section.startTimeSec ?? "—"}–{section.endTimeSec ?? "—"}s</p>}
                            {(section.startPosition || section.endPosition) && <p className="mt-1 text-[11px] text-[var(--muted)]">{section.startPosition || "—"} → {section.endPosition || "—"}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {routine.apparatus === "BARS" && routine.sections.length > 0 && (
                <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Bars sequence</p><span className="text-xs text-[var(--muted)]">Coach-authored rail context</span></div>
                  <div className="mt-4 overflow-x-auto pb-2">
                    <div className="min-w-[620px]">
                      <div className="grid grid-cols-[80px_1fr] items-center gap-3"><span className="text-xs font-semibold text-[var(--muted)]">High rail</span><div className="h-2 rounded-full border border-[var(--border)] bg-[var(--surface)]"/></div>
                      <div className="my-4 grid grid-cols-[80px_1fr] gap-3"><span/><div className="grid grid-flow-col auto-cols-fr gap-2">{routine.sections.map((section, index) => <div key={section.id} className="rounded-lg border border-[var(--border)] p-2 text-center"><p className="text-xs font-semibold">{index + 1}. {section.title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{section.startRail || "—"} → {section.endRail || "—"}</p>{(section.startPosition || section.endPosition) && <p className="mt-1 text-[11px] text-[var(--muted)]">{section.startPosition || "—"} → {section.endPosition || "—"}</p>}<p className="mt-1 text-[11px] text-[var(--muted)]">{section.sectionType.replaceAll("_", " ").toLowerCase()}</p></div>)}</div></div>
                      <div className="grid grid-cols-[80px_1fr] items-center gap-3"><span className="text-xs font-semibold text-[var(--muted)]">Low rail</span><div className="h-2 rounded-full border border-[var(--border)] bg-[var(--surface)]"/></div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Routine structure</p><span className="text-xs text-[var(--muted)]">{routine.sections.length} section{routine.sections.length === 1 ? "" : "s"}</span></div>
                <div className="mt-3 grid gap-2">
                  {routine.sections.map((section, index) => (
                    <details key={section.id} className="rounded-lg border border-[var(--border)] p-3">
                      <summary className="cursor-pointer text-sm font-semibold">{index + 1}. {section.title} · {section.sectionType.replaceAll("_", " ").toLowerCase()}</summary>
                      <form action={updateRoutineSection} className="mt-3 grid gap-2">
                        <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="sectionId" value={section.id}/>
                        <div className="grid gap-2 sm:grid-cols-2"><input name="title" defaultValue={section.title} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><select name="sectionType" defaultValue={section.sectionType} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm">{(routine.apparatus === "FLOOR" ? ["DANCE_PASSAGE","ACRO_LINE","CHOREOGRAPHY","TRANSITION","OTHER"] : routine.apparatus === "BEAM" ? ["ACRO_SERIES","DANCE_SERIES","MIXED_SERIES","CHOREOGRAPHY","TRANSITION","DISMOUNT","OTHER"] : ["SEQUENCE","CONNECTION","TRANSITION","FLIGHT","DISMOUNT","OTHER"]).map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></div>
                        {(routine.apparatus === "FLOOR" || routine.apparatus === "BEAM") && <div className="grid grid-cols-2 gap-2"><input type="number" step="0.1" min="0" name="startTimeSec" defaultValue={section.startTimeSec ?? ""} placeholder="Start sec" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><input type="number" step="0.1" min="0" name="endTimeSec" defaultValue={section.endTimeSec ?? ""} placeholder="End sec" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></div>}
                        {routine.apparatus === "FLOOR" && <>
                          <div className="grid grid-cols-2 gap-2"><input name="musicCue" defaultValue={section.musicCue ?? ""} placeholder="Music cue" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><input name="direction" defaultValue={section.direction ?? ""} placeholder="Direction" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <input type="number" step="0.1" min="0" max="1" name="startX" defaultValue={section.startX ?? ""} placeholder="Start X 0–1" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                            <input type="number" step="0.1" min="0" max="1" name="startY" defaultValue={section.startY ?? ""} placeholder="Start Y 0–1" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                            <input type="number" step="0.1" min="0" max="1" name="endX" defaultValue={section.endX ?? ""} placeholder="End X 0–1" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                            <input type="number" step="0.1" min="0" max="1" name="endY" defaultValue={section.endY ?? ""} placeholder="End Y 0–1" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                          </div>
                        </>}
                        {routine.apparatus === "BEAM" && <><div className="grid grid-cols-2 gap-2"><input name="startPosition" defaultValue={section.startPosition ?? ""} placeholder="Start position" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><input name="endPosition" defaultValue={section.endPosition ?? ""} placeholder="End position" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></div><input name="direction" defaultValue={section.direction ?? ""} placeholder="Travel / direction" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></>}
                        {routine.apparatus === "BARS" && <><div className="grid grid-cols-2 gap-2"><select name="startRail" defaultValue={section.startRail ?? ""} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="">Start rail</option><option value="LOW">Low rail</option><option value="HIGH">High rail</option></select><select name="endRail" defaultValue={section.endRail ?? ""} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="">End rail</option><option value="LOW">Low rail</option><option value="HIGH">High rail</option></select></div><div className="grid grid-cols-2 gap-2"><input name="startPosition" defaultValue={section.startPosition ?? ""} placeholder="Start position / grip" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><input name="endPosition" defaultValue={section.endPosition ?? ""} placeholder="End position / grip" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></div><input name="direction" defaultValue={section.direction ?? ""} placeholder="Swing / transition direction" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></>}
                        <div className="grid grid-cols-2 gap-2"><input name="rhythm" defaultValue={section.rhythm ?? ""} placeholder="Rhythm / tempo" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/><input name="facing" defaultValue={section.facing ?? ""} placeholder="Facing" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/></div>
                        <textarea name="notes" defaultValue={section.notes ?? ""} placeholder="Section notes" className="min-h-20 rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save section</button>
                      </form>
                      <div className="mt-2 flex gap-2">
                        <form action={moveRoutineSection}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="sectionId" value={section.id}/><input type="hidden" name="direction" value="UP"/><button disabled={index === 0} className="text-xs font-semibold disabled:opacity-30">Move up</button></form>
                        <form action={moveRoutineSection}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="sectionId" value={section.id}/><input type="hidden" name="direction" value="DOWN"/><button disabled={index === routine.sections.length - 1} className="text-xs font-semibold disabled:opacity-30">Move down</button></form>
                        <form action={removeRoutineSection}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="sectionId" value={section.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove</button></form>
                      </div>
                    </details>
                  ))}
                </div>
                <form action={addRoutineSection} className="mt-3 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
                  <input type="hidden" name="routineId" value={routine.id}/><input name="title" placeholder="Section title" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                  <select name="sectionType" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm">{(routine.apparatus === "FLOOR" ? ["DANCE_PASSAGE","ACRO_LINE","CHOREOGRAPHY","TRANSITION","OTHER"] : routine.apparatus === "BEAM" ? ["ACRO_SERIES","DANCE_SERIES","MIXED_SERIES","CHOREOGRAPHY","TRANSITION","DISMOUNT","OTHER"] : ["SEQUENCE","CONNECTION","TRANSITION","FLIGHT","DISMOUNT","OTHER"]).map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select>
                  <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add section</button>
                </form>
              </div>
              <div className="mt-4 grid gap-2">
                {routine.elements.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.elementDefinition.officialNumber}{item.elementDefinition.variantKey !== "a" ? item.elementDefinition.variantKey : ""} · {item.elementDefinition.difficulty ?? "—"}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.elementDefinition.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{item.elementDefinition.groupName}</p>
                        {linkedEvidence.has(item.id) && <p className="mt-2 text-xs font-semibold">{linkedEvidence.get(item.id)!.total} recent linked observations · {linkedEvidence.get(item.id)!.made} made · {linkedEvidence.get(item.id)!.spotted} spotted · {linkedEvidence.get(item.id)!.missed} missed</p>}
                        {routine.sections.length > 0 && <form action={assignRoutineItemSection} className="mt-2 flex items-center gap-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="itemType" value="ELEMENT"/><select name="sectionId" defaultValue={item.sectionId ?? ""} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs"><option value="">No section</option>{routine.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select><button className="text-xs font-semibold">Set section</button></form>}
                      </div>
                      <div className="flex gap-1">
                        <form action={moveRoutineElement}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="direction" value="UP"/><button disabled={index === 0} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30">↑</button></form>
                        <form action={moveRoutineElement}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="direction" value="DOWN"/><button disabled={index === routine.elements.length - 1} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30">↓</button></form>
                      </div>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-semibold">{item.recognition === "UNKNOWN" ? "Recognition not yet assessed" : item.recognition.replaceAll("_", " ")}</summary>
                      <form action={updateRoutineElement} className="mt-2 grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                        <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/>
                        <select name="recognition" defaultValue={item.recognition} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="UNKNOWN">Unknown</option><option value="RECOGNISED">Recognised</option><option value="NOT_RECOGNISED">Not recognised</option></select>
                        <input name="coachNote" defaultValue={item.coachNote ?? ""} placeholder="Coach note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                        <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isDismount" value="true" defaultChecked={item.isDismount}/> Dismount</label>
                        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save review</button>
                      </form>
                      <form action={removeRoutineElement} className="mt-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove from routine</button></form>
                    </details>
                  </div>
                ))}
                {!catalogueElements.length && routine.customItems.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">Coach-authored content · not a canonical skill definition</p>
                        {linkedEvidence.has(item.id) && <p className="mt-2 text-xs font-semibold">{linkedEvidence.get(item.id)!.total} recent linked observations · {linkedEvidence.get(item.id)!.made} made · {linkedEvidence.get(item.id)!.spotted} spotted · {linkedEvidence.get(item.id)!.missed} missed</p>}
                      </div>
                      <div className="flex gap-1">
                        <form action={moveRoutineCustomItem}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="direction" value="UP"/><button disabled={index === 0} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30">↑</button></form>
                        <form action={moveRoutineCustomItem}><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><input type="hidden" name="direction" value="DOWN"/><button disabled={index === routine.customItems.length - 1} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30">↓</button></form>
                      </div>
                    </div>
                    <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">Coach notes</summary>
                      <form action={updateRoutineCustomItem} className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/>
                        <input name="label" defaultValue={item.label} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                        <input name="coachNote" defaultValue={item.coachNote ?? ""} placeholder="Coach note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                        <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                      </form>
                      <form action={removeRoutineCustomItem} className="mt-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove from routine</button></form>
                    </details>
                  </div>
                ))}
                {!routine.elements.length && !routine.customItems.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No elements added yet.</p>}
              </div>
            </article>
            <aside className="grid content-start gap-4">
              {expandedCanonicalRequirements.length > 0 && (
                <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className="text-sm font-semibold">Canonical routine requirements</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Verified governing-body sequence for {routine.rulesetLevelName ?? routine.rulesetLevelCode}. This is reference context; it does not automatically alter the coach-built routine.</p>
                  <ol className="mt-4 grid gap-2">
                    {expandedCanonicalRequirements.map((requirement, index) => (
                      <li key={requirement.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold">{index + 1}</span>
                          <div>
                            <p className="font-semibold">{requirement.skillName}{requirement.repetitions > 1 ? " · " + requirement.repetition + "/" + requirement.repetitions : ""}</p>
                            {requirement.occurrenceContext && <p className="mt-1 text-xs text-[var(--muted)]">{requirement.occurrenceContext.replaceAll("_", " ").toLowerCase()}</p>}
                            {(requirement.sourcePage || requirement.notes) && <p className="mt-1 text-xs text-[var(--muted)]">{requirement.sourcePage ? "Source p. " + requirement.sourcePage : ""}{requirement.sourcePage && requirement.notes ? " · " : ""}{requirement.notes ?? ""}</p>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </article>
              )}
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold">Add verified element</p>
              {catalogueElements.length ? (
                <form action={addRoutineElement} className="mt-3 grid gap-3">
                  <input type="hidden" name="routineId" value={routine.id}/>
                  <select name="elementDefinitionId" required className="min-h-12 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                    <option value="">Choose element…</option>
                    {catalogueElements.map((element) => <option key={element.id} value={element.id}>{element.officialNumber}{element.variantKey !== "a" ? element.variantKey : ""} · {element.difficulty ?? "—"} · {element.name}</option>)}
                  </select>
                  <button className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Add to sequence</button>
                </form>
              ) : (
                <>
                  <p className="mt-3 text-sm text-[var(--muted)]">No verified element catalogue is stored for this routine’s ruleset package. You can still record the coach’s routine content without treating it as a canonical definition.</p>
                  <form action={addRoutineCustomItem} className="mt-3 grid gap-3">
                    <input type="hidden" name="routineId" value={routine.id}/>
                    <input name="label" required placeholder="Skill / element description" className="min-h-12 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"/>
                    <button className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Add coach-authored item</button>
                  </form>
                </>
              )}
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{catalogueElements.length ? "Elements are drawn only from the verified canonical package snapshotted when this plan was created." : "Coach-authored items remain clearly separate from verified governing-body definitions and are not included in FIG evaluation."}</p>
              </article>
            </aside>
          </div>
        )}

        {tab === "build" && routine.apparatus === "VAULT" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Build</p>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="mt-1 text-xl font-semibold">Vault programme</h2><p className="mt-1 text-sm text-[var(--muted)]">{routine.vaultMode === "TWO_VAULT" ? "Two-vault programme" : "One-vault programme"} · coach-owned selection</p></div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">{routine.rulesetLevelName ?? routine.rulesetLevelCode ?? "Ruleset context not saved"}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {["PRIMARY","SECONDARY"].map((role) => {
                  const canonical = routine.vaults.find((item) => item.role === role);
                  const custom = routine.customItems.find((item) => item.role === role);
                  const required = role === "PRIMARY" || routine.vaultMode === "TWO_VAULT";
                  return <div key={role} className="rounded-xl border border-[var(--border)] p-4">
                    <span className="text-xs font-semibold text-[var(--muted)]">{role === "PRIMARY" ? "Primary vault" : "Secondary vault"}</span>
                    {canonical ? <><p className="mt-2 font-semibold">{canonical.vaultDefinition.officialNumber}{canonical.vaultDefinition.variantKey !== "a" ? canonical.vaultDefinition.variantKey : ""} · D {canonical.vaultDefinition.dValue.toFixed(1)}</p><p className="mt-1 text-sm">{canonical.vaultDefinition.name}</p><p className="mt-1 text-xs text-[var(--muted)]">Group {canonical.vaultDefinition.groupNumber} · {canonical.vaultDefinition.secondFlightDirection.toLowerCase()}</p></> : custom ? <><p className="mt-2 font-semibold">{custom.label}</p><p className="mt-1 text-xs text-[var(--muted)]">Coach-authored · canonical identity not assigned</p></> : <p className="mt-2 text-sm text-[var(--muted)]">{required ? "Not selected yet" : "Not required for this one-vault programme"}</p>}
                  </div>;
                })}
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Programme mode records the coach’s intended vault structure. Competition qualification/final requirements remain part of verified rules context and are not inferred from this selection alone.</p>
              <div className="mt-4 grid gap-3">
                {routine.vaults.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="font-semibold">{item.vaultDefinition.officialNumber}{item.vaultDefinition.variantKey !== "a" ? item.vaultDefinition.variantKey : ""} · D {item.vaultDefinition.dValue.toFixed(1)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.vaultDefinition.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Group {item.vaultDefinition.groupNumber} · {item.vaultDefinition.secondFlightDirection.toLowerCase()}</p>
                    {linkedEvidence.has(item.id) && <p className="mt-2 text-xs font-semibold">{linkedEvidence.get(item.id)!.total} recent linked observations · {linkedEvidence.get(item.id)!.made} made · {linkedEvidence.get(item.id)!.spotted} spotted · {linkedEvidence.get(item.id)!.missed} missed</p>}
                    <form action={updateRoutineVault} className="mt-3 grid gap-2 sm:grid-cols-[150px_1fr_auto]">
                      <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/>
                      <select name="role" defaultValue={item.role} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="PRIMARY">Primary</option><option value="SECONDARY">Secondary</option></select>
                      <input name="coachNote" defaultValue={item.coachNote ?? ""} placeholder="Coach note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                    </form>
                    <form action={removeRoutineVault} className="mt-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove vault</button></form>
                  </div>
                ))}
                {!catalogueVaults.length && routine.customItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="font-semibold">{item.role === "PRIMARY" ? "Primary" : "Secondary"} · {item.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Coach-authored vault selection · not a canonical vault definition</p>
                    {linkedEvidence.has(item.id) && <p className="mt-2 text-xs font-semibold">{linkedEvidence.get(item.id)!.total} recent linked observations · {linkedEvidence.get(item.id)!.made} made · {linkedEvidence.get(item.id)!.spotted} spotted · {linkedEvidence.get(item.id)!.missed} missed</p>}
                    <form action={updateRoutineCustomItem} className="mt-3 grid gap-2 sm:grid-cols-[150px_1fr_1fr_auto]">
                      <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/>
                      <select name="role" defaultValue={item.role ?? "SECONDARY"} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="PRIMARY">Primary</option><option value="SECONDARY">Secondary</option></select>
                      <input name="label" defaultValue={item.label} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                      <input name="coachNote" defaultValue={item.coachNote ?? ""} placeholder="Coach note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                    </form>
                    <form action={removeRoutineCustomItem} className="mt-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove vault</button></form>
                  </div>
                ))}
                {!routine.vaults.length && !routine.customItems.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No vaults selected yet.</p>}
              </div>
            </article>
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold">Add verified vault</p>
              {catalogueVaults.length ? (
                <form action={addRoutineVault} className="mt-3 grid gap-3">
                  <input type="hidden" name="routineId" value={routine.id}/>
                  <select name="vaultDefinitionId" required className="min-h-12 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm">
                    <option value="">Choose vault…</option>
                    {catalogueVaults.map((vault) => <option key={vault.id} value={vault.id}>{vault.officialNumber}{vault.variantKey !== "a" ? vault.variantKey : ""} · G{vault.groupNumber} · D {vault.dValue.toFixed(1)} · {vault.name}</option>)}
                  </select>
                  <button className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Add vault</button>
                </form>
              ) : (
                <>
                  <p className="mt-3 text-sm text-[var(--muted)]">No verified vault catalogue is stored for this routine’s ruleset package. Record the coach’s selected vault without assigning canonical number, group or D-value.</p>
                  <form action={addRoutineCustomItem} className="mt-3 grid gap-3">
                    <input type="hidden" name="routineId" value={routine.id}/>
                    <input name="label" required placeholder="Vault description" className="min-h-12 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"/>
                    <button className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Add coach-authored vault</button>
                  </form>
                </>
              )}
            </aside>
          </div>
        )}

        {tab === "strategy" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Coach-owned strategy</p>
              <h2 className="mt-1 text-xl font-semibold">Strategy</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Record the intended competitive or developmental approach. Evidence and verified rule context sit beside the decision; Viaform does not choose the routine strategy.</p>
              <form action={updateRoutineContext} className="mt-4">
                <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="name" value={routine.name}/><input type="hidden" name="purpose" value={routine.purpose}/><input type="hidden" name="pathwayNote" value={routine.pathwayNote ?? ""}/>
                <textarea name="strategyNote" defaultValue={routine.strategyNote ?? ""} placeholder="Coach strategy…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3"/>
                <button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save strategy</button>
              </form>
              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <p className="text-sm font-semibold">Worth considering</p>
                {routineEvaluation ? (routineEvaluation.findings.length ? (
                  <div className="mt-3 grid gap-2">
                    {routineEvaluation.findings.slice(0, 8).map((finding, index) => (
                      <div key={finding.code + index} className="rounded-xl border border-[var(--border)] p-3">
                        <p className="text-sm">{finding.message}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">Verified canonical evaluation context · coach or judge decision required</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-3 text-sm text-[var(--muted)]">No unresolved canonical evaluation items in the saved plan.</p>) : (
                  <p className="mt-3 text-sm text-[var(--muted)]">No bounded canonical evaluation is available for this plan. Use the verified rules snapshot and coaching evidence as context.</p>
                )}
              </div>
            </article>
            <aside className="grid content-start gap-4">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm font-semibold">Recent apparatus evidence</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-[var(--border)] p-3"><strong className="block text-xl">{evidenceCounts.made}</strong><span className="text-xs text-[var(--muted)]">Made</span></div>
                  <div className="rounded-xl border border-[var(--border)] p-3"><strong className="block text-xl">{evidenceCounts.spotted}</strong><span className="text-xs text-[var(--muted)]">Spotted</span></div>
                  <div className="rounded-xl border border-[var(--border)] p-3"><strong className="block text-xl">{evidenceCounts.missed}</strong><span className="text-xs text-[var(--muted)]">Missed</span></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{recentEvidence.length} recent observations shown as context only. Outcome counts do not determine readiness or routine selection.</p>
                <a href={"/progress?gymnast=" + gymnast.id} className="mt-3 inline-block text-sm font-semibold">Open full Progress Hub →</a>
              </article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm font-semibold">Verified rule context</p>
                <p className="mt-2 text-sm">{routine.rulesetProgramName && routine.rulesetLevelName ? routine.rulesetProgramName + " · " + routine.rulesetLevelName : "No canonical snapshot"}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{applicableRules.length} verified rules available to this saved plan.</p>
                <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold">Show rule areas</summary>
                  <div className="mt-2 flex flex-wrap gap-2">{[...new Set(applicableRules.map((rule) => rule.ruleType))].map((type) => <span key={type} className="rounded-full border border-[var(--border)] px-2 py-1 text-xs">{type.replaceAll("_", " ")}</span>)}</div>
                </details>
              </article>
            </aside>
          </div>
        )}

        {tab === "pathway" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Training pathway</p>
              <h2 className="mt-1 text-xl font-semibold">Pathway</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Capture what the coach wants to develop toward. The pathway is a coaching plan, not an automatic progression recommendation.</p>
              <form action={updateRoutineContext} className="mt-4">
                <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="name" value={routine.name}/><input type="hidden" name="purpose" value={routine.purpose}/><input type="hidden" name="strategyNote" value={routine.strategyNote ?? ""}/>
                <textarea name="pathwayNote" defaultValue={routine.pathwayNote ?? ""} placeholder="Coach pathway focus…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3"/>
                <button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save pathway</button>
              </form>
              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <p className="text-sm font-semibold">Recent evidence context</p>
                <div className="mt-3 grid gap-2">
                  {recentEvidence.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2"><strong>{entry.outcome} · {entry.station?.name ?? entry.block.title}</strong><span className="text-xs text-[var(--muted)]">{entry.session.sessionDate.toISOString().slice(0, 10)}</span></div>
                      <p className="mt-1 text-xs text-[var(--muted)]">{entry.session.title}{entry.note ? " · " + entry.note : ""}</p>
                    </div>
                  ))}
                  {!recentEvidence.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">No recent apparatus-specific live-training evidence has been recorded.</p>}
                </div>
              </div>
            </article>
            <aside className="grid content-start gap-4">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm font-semibold">Programme context</p>
                {programmeContext ? (<><p className="mt-2 text-sm">{programmeContext.programme.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{programmeContext.stage ? "Current stage · " + programmeContext.stage.name : "No individual programme stage assigned"}</p></>) : <p className="mt-2 text-sm text-[var(--muted)]">No individual programme pathway is assigned; group programme context may still apply.</p>}
                <a href={"/gymnasts/" + gymnast.id} className="mt-3 inline-block text-sm font-semibold">Open gymnast context →</a>
              </article>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <p className="text-sm font-semibold">Evidence boundary</p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Made, Missed, Spotted, testing results and rule evaluation can inform the pathway. None of them independently authorise progression, removal of content or competition selection.</p>
                <a href={"/progress?gymnast=" + gymnast.id} className="mt-3 inline-block text-sm font-semibold">Review longitudinal evidence →</a>
              </article>
            </aside>
          </div>
        )}

        <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">Evidence → Context → Guidance → Coach judgement.</p>
      </section>
    </AppShell>
  );
}
