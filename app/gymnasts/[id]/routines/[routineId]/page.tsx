import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { archiveGymnastRoutine, updateRoutineContext } from "@/app/actions/routines";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext, rulesForApparatus, type RulesetApparatus } from "@/app/lib/rulesets/context";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { VAULT: "Vault", BARS: "Uneven Bars", BEAM: "Balance Beam", FLOOR: "Floor Exercise" };
const tabs = ["overview", "build", "strategy", "pathway"] as const;

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
    include: { routines: { where: { id: routineId, status: "ACTIVE" } } },
  });
  const routine = gymnast?.routines[0];
  if (!gymnast || !routine) notFound();

  const currentRules = await getGymnastRulesContext(gymnast.id, c.organisation.id);
  const applicableRules = rulesForApparatus(currentRules, routine.apparatus as RulesetApparatus);
  const href = "/gymnasts/" + gymnast.id + "/routines/" + routine.id;

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
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                The workspace is established. Canonical {routine.apparatus === "VAULT" ? "vault selection" : "element construction"} will be added through Build without replacing coach judgement.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Strategy</span><p className="mt-2 text-sm">{routine.strategyNote || "Not yet recorded"}</p></div>
                <div className="rounded-xl border border-[var(--border)] p-4"><span className="text-xs text-[var(--muted)]">Pathway focus</span><p className="mt-2 text-sm">{routine.pathwayNote || "Not yet recorded"}</p></div>
              </div>
            </article>
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm font-semibold">Current verified context</p>
              {currentRules ? (
                <>
                  <p className="mt-2 text-sm">{currentRules.program.name} · {currentRules.level.name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{currentRules.package.versionLabel}</p>
                  <p className="mt-4 text-2xl font-semibold">{applicableRules.length}</p>
                  <p className="text-xs text-[var(--muted)]">applicable verified rules</p>
                </>
              ) : <p className="mt-2 text-sm text-[var(--muted)]">No verified canonical context assigned.</p>}
            </article>
          </div>
        )}

        {tab === "build" && (
          <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm font-semibold text-[var(--muted)]">Build</p>
            <h2 className="mt-1 text-xl font-semibold">{routine.apparatus === "VAULT" ? "Vault selection" : "Routine construction"}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {routine.apparatus === "VAULT"
                ? "Vault remains distinct from sequence-based apparatus. Verified vault definitions and competition-context requirements will be connected here."
                : "Verified canonical elements, ordering and apparatus evaluation will be connected here in the next apparatus batches."}
            </p>
          </article>
        )}

        {tab === "strategy" && (
          <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Coach-owned strategy</p>
            <h2 className="mt-1 text-xl font-semibold">Strategy</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Record the coach’s intended competitive or developmental approach. Viaform can later place evidence beside this decision, but does not choose the strategy.</p>
            <form action={updateRoutineContext} className="mt-4">
              <input type="hidden" name="routineId" value={routine.id} />
              <input type="hidden" name="name" value={routine.name} /><input type="hidden" name="purpose" value={routine.purpose} />
              <input type="hidden" name="pathwayNote" value={routine.pathwayNote ?? ""} />
              <textarea name="strategyNote" defaultValue={routine.strategyNote ?? ""} placeholder="Coach strategy…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
              <button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save strategy</button>
            </form>
          </article>
        )}

        {tab === "pathway" && (
          <article className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold text-[var(--muted)]">Training pathway</p>
            <h2 className="mt-1 text-xl font-semibold">Pathway</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Capture what the coach wants to develop toward. Evidence and training links can be layered onto this without automatic progression.</p>
            <form action={updateRoutineContext} className="mt-4">
              <input type="hidden" name="routineId" value={routine.id} />
              <input type="hidden" name="name" value={routine.name} /><input type="hidden" name="purpose" value={routine.purpose} />
              <input type="hidden" name="strategyNote" value={routine.strategyNote ?? ""} />
              <textarea name="pathwayNote" defaultValue={routine.pathwayNote ?? ""} placeholder="Coach pathway focus…" className="min-h-40 w-full rounded-xl border border-[var(--border)] px-3 py-3" />
              <button className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold">Save pathway</button>
            </form>
          </article>
        )}

        <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">Evidence → Context → Guidance → Coach judgement.</p>
      </section>
    </AppShell>
  );
}
