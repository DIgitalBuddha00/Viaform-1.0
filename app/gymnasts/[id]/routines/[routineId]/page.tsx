import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import {
  addRoutineElement,
  addRoutineVault,
  archiveGymnastRoutine,
  moveRoutineElement,
  removeRoutineElement,
  removeRoutineVault,
  updateRoutineContext,
  updateRoutineElement,
  updateRoutineVault,
} from "@/app/actions/routines";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext, getRulesetSnapshotRules, type RulesetApparatus } from "@/app/lib/rulesets/context";
import { evaluateStoredFigRoutine } from "@/app/lib/routines/evaluation";

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
      routines: {
        where: { id: routineId, status: "ACTIVE" },
        include: {
          elements: { include: { elementDefinition: true }, orderBy: { orderIndex: "asc" } },
          vaults: { include: { vaultDefinition: true }, orderBy: { orderIndex: "asc" } },
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
  const figEvaluation = routine.rulesetProgramCode === "FIG_WAG"
    ? evaluateStoredFigRoutine({
        apparatus: routine.apparatus,
        levelCode: routine.rulesetLevelCode,
        elements: routine.elements,
        rules: applicableRules,
      })
    : null;
  const rulesContextChanged = Boolean(
    currentRules &&
    (currentRules.package.code !== routine.rulesetPackageCode || currentRules.level.code !== routine.rulesetLevelCode),
  );
  const href = "/gymnasts/" + gymnast.id + "/routines/" + routine.id;

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

  const recognised = routine.elements.filter((item) => item.recognition === "RECOGNISED");
  const rawRecognisedDv = recognised.reduce((sum, item) => sum + (difficultyValue[item.elementDefinition.difficulty ?? ""] ?? 0), 0);

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href={"/gymnasts/" + gymnast.id + "/routines"} className="text-sm font-semibold text-[var(--muted)]">← {gymnast.name} · Routines</a>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{labels[routine.apparatus] ?? routine.apparatus} · {routine.purpose === "CURRENT" ? "Current" : "Alternative"}</p>
            <h1 className="mt-2 text-3xl font-semibold">{routine.name}</h1>
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
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Saved vaults</span><strong className="mt-1 block text-2xl">{routine.vaults.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Primary D-value</span><strong className="mt-1 block text-2xl">{routine.vaults.find((item) => item.role === "PRIMARY")?.vaultDefinition.dValue.toFixed(1) ?? "—"}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Groups represented</span><strong className="mt-1 block text-2xl">{new Set(routine.vaults.map((item) => item.vaultDefinition.groupNumber)).size}</strong></div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Elements</span><strong className="mt-1 block text-2xl">{routine.elements.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Recognised</span><strong className="mt-1 block text-2xl">{recognised.length}</strong></div>
                  <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Raw recognised DV</span><strong className="mt-1 block text-2xl">{rawRecognisedDv.toFixed(1)}</strong></div>
                </div>
              )}
              {figEvaluation ? (
                <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div><span className="text-xs text-[var(--muted)]">Verified FIG evaluation</span><strong className="mt-1 block text-2xl">{figEvaluation.difficulty.toFixed(1)} counting DV</strong></div>
                    <span className="text-xs font-semibold">{figEvaluation.status === "READY" ? "Evaluation complete" : "Coach / judge review required"}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <span>Counted {figEvaluation.countedElements.length}</span>
                    <span>Excluded {figEvaluation.excludedElements.length}</span>
                    <span>CR {figEvaluation.composition.toFixed(1)}</span>
                    <span>CV {figEvaluation.connectionValue.toFixed(1)}</span>
                  </div>
                  {figEvaluation.findings.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold">{figEvaluation.findings.length} unresolved evaluation {figEvaluation.findings.length === 1 ? "item" : "items"}</summary>
                      <div className="mt-2 grid gap-2">
                        {figEvaluation.findings.map((finding, index) => <p key={finding.code + index} className="rounded-lg border border-[var(--border)] p-2 text-xs text-[var(--muted)]">{finding.message}</p>)}
                      </div>
                    </details>
                  )}
                  <p className="mt-3 text-xs leading-5 text-[var(--muted)]">A D-score is not presented while required recognition, composition, connection, series or dismount decisions remain unresolved.</p>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Raw recognised DV is descriptive only. This ruleset is not being passed through the FIG evaluator.</p>
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
              <div className="mt-4 grid gap-2">
                {routine.elements.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-xs font-semibold">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.elementDefinition.officialNumber}{item.elementDefinition.variantKey !== "a" ? item.elementDefinition.variantKey : ""} · {item.elementDefinition.difficulty ?? "—"}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.elementDefinition.name}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{item.elementDefinition.groupName}</p>
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
                {!routine.elements.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No elements added yet.</p>}
              </div>
            </article>
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
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
              ) : <p className="mt-3 text-sm text-[var(--muted)]">No verified element catalogue is stored for this routine’s ruleset package.</p>}
              <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Elements are drawn only from the verified canonical package snapshotted when this plan was created.</p>
            </aside>
          </div>
        )}

        {tab === "build" && routine.apparatus === "VAULT" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold text-[var(--muted)]">Build</p>
              <h2 className="mt-1 text-xl font-semibold">Vault selection</h2>
              <div className="mt-4 grid gap-3">
                {routine.vaults.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="font-semibold">{item.vaultDefinition.officialNumber}{item.vaultDefinition.variantKey !== "a" ? item.vaultDefinition.variantKey : ""} · D {item.vaultDefinition.dValue.toFixed(1)}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.vaultDefinition.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Group {item.vaultDefinition.groupNumber} · {item.vaultDefinition.secondFlightDirection.toLowerCase()}</p>
                    <form action={updateRoutineVault} className="mt-3 grid gap-2 sm:grid-cols-[150px_1fr_auto]">
                      <input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/>
                      <select name="role" defaultValue={item.role} className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"><option value="PRIMARY">Primary</option><option value="SECONDARY">Secondary</option></select>
                      <input name="coachNote" defaultValue={item.coachNote ?? ""} placeholder="Coach note" className="rounded-lg border border-[var(--border)] px-2 py-2 text-sm"/>
                      <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                    </form>
                    <form action={removeRoutineVault} className="mt-2"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="itemId" value={item.id}/><button className="text-xs font-semibold text-[var(--muted)]">Remove vault</button></form>
                  </div>
                ))}
                {!routine.vaults.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">No vaults selected yet.</p>}
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
              ) : <p className="mt-3 text-sm text-[var(--muted)]">No verified vault catalogue is stored for this routine’s ruleset package.</p>}
            </aside>
          </div>
        )}

        {tab === "strategy" && (
          <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Coach-owned strategy</p><h2 className="mt-1 text-xl font-semibold">Strategy</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Record the coach’s intended competitive or developmental approach. Viaform can place evidence beside this decision, but does not choose the strategy.</p>
            <form action={updateRoutineContext} className="mt-4"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="name" value={routine.name}/><input type="hidden" name="purpose" value={routine.purpose}/><input type="hidden" name="pathwayNote" value={routine.pathwayNote ?? ""}/><textarea name="strategyNote" defaultValue={routine.strategyNote ?? ""} placeholder="Coach strategy…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3"/><button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save strategy</button></form>
          </article>
        )}

        {tab === "pathway" && (
          <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Training pathway</p><h2 className="mt-1 text-xl font-semibold">Pathway</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Capture what the coach wants to develop toward. Evidence and training links can be layered onto this without automatic progression.</p>
            <form action={updateRoutineContext} className="mt-4"><input type="hidden" name="routineId" value={routine.id}/><input type="hidden" name="name" value={routine.name}/><input type="hidden" name="purpose" value={routine.purpose}/><input type="hidden" name="strategyNote" value={routine.strategyNote ?? ""}/><textarea name="pathwayNote" defaultValue={routine.pathwayNote ?? ""} placeholder="Coach pathway focus…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3"/><button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save pathway</button></form>
          </article>
        )}

        <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">Evidence → Context → Guidance → Coach judgement.</p>
      </section>
    </AppShell>
  );
}
