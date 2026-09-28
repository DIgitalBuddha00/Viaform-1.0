import { notFound } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { createGymnastRoutine } from "@/app/actions/routines";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { gymnastScopeWhere } from "@/app/lib/coaching-scope";
import { getGymnastRulesContext, rulesByApparatus } from "@/app/lib/rulesets/context";

export const dynamic = "force-dynamic";

const apparatus = [
  { key: "VAULT", label: "Vault", note: "Vault is constructed as a selection plan rather than an element sequence." },
  { key: "BARS", label: "Uneven Bars", note: "Element sequence, composition and connection context." },
  { key: "BEAM", label: "Balance Beam", note: "Element sequence, composition, series and dismount context." },
  { key: "FLOOR", label: "Floor Exercise", note: "Passes, dance content, composition and routine structure." },
] as const;

export default async function GymnastRoutinesPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireAuthContext();
  if (!c.access.canUseCoachingWorkspace) notFound();
  const { id } = await params;
  const gymnast = await prisma.gymnast.findFirst({
    where: { id, ...gymnastScopeWhere(c.organisation.id, c.membership.id, c.access) },
    include: { routines: { where: { status: "ACTIVE" }, orderBy: [{ apparatus: "asc" }, { updatedAt: "desc" }] } },
  });
  if (!gymnast) notFound();
  const rules = await getGymnastRulesContext(gymnast.id, c.organisation.id);
  const ruleCounts = new Map(rulesByApparatus(rules).map((entry) => [entry.apparatus, entry.applicableRuleCount]));

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href={"/gymnasts/" + gymnast.id} className="text-sm font-semibold text-[var(--muted)]">← {gymnast.name}</a>
        <p className="mt-5 text-sm font-semibold text-[var(--muted)]">Routines & technical coaching</p>
        <h1 className="mt-2 text-3xl font-semibold">{gymnast.name} · Routines</h1>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          Build and compare apparatus plans without changing the gymnast’s assigned pathway. Viaform keeps verified rules and evidence in view; routine strategy remains a coach decision.
        </p>

        <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold">Current rules context</p>
          {rules ? (
            <>
              <p className="mt-2">{rules.program.name} · {rules.level.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{rules.package.name} · {rules.package.versionLabel}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">No verified canonical rules context is currently assigned.</p>
          )}
        </article>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {apparatus.map((item) => {
            const routines = gymnast.routines.filter((routine) => routine.apparatus === item.key);
            const current = routines.find((routine) => routine.purpose === "CURRENT") ?? routines[0] ?? null;
            return (
              <article key={item.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold">{item.label}</h2>
                  {rules && <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px]">{ruleCounts.get(item.key) ?? 0} rules</span>}
                </div>
                <p className="mt-2 min-h-12 text-sm text-[var(--muted)]">{item.note}</p>
                {current ? (
                  <a href={"/gymnasts/" + gymnast.id + "/routines/" + current.id} className="mt-4 block rounded-xl border border-[var(--border)] p-3">
                    <span className="block font-semibold">{current.name}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{current.purpose === "CURRENT" ? "Current plan" : "Alternative"} · updated {current.updatedAt.toISOString().slice(0, 10)}</span>
                  </a>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-3 text-sm text-[var(--muted)]">No routine plan yet.</p>
                )}
                {routines.length > 1 && <p className="mt-2 text-xs text-[var(--muted)]">{routines.length - 1} other saved {routines.length === 2 ? "option" : "options"}</p>}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold">New {item.label} plan</summary>
                  <form action={createGymnastRoutine} className="mt-3 grid gap-2">
                    <input type="hidden" name="gymnastId" value={gymnast.id} />
                    <input type="hidden" name="apparatus" value={item.key} />
                    <input name="name" placeholder="Plan name" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                    <select name="purpose" defaultValue={current ? "ALTERNATIVE" : "CURRENT"} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                      <option value="CURRENT">Current</option>
                      <option value="ALTERNATIVE">Alternative</option>
                    </select>
                    <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Create plan</button>
                  </form>
                </details>
              </article>
            );
          })}
        </div>

        {gymnast.routines.length > 0 && (
          <section className="mt-8">
            <p className="text-sm font-semibold text-[var(--muted)]">Saved options</p>
            <div className="mt-3 grid gap-2">
              {gymnast.routines.map((routine) => (
                <a key={routine.id} href={"/gymnasts/" + gymnast.id + "/routines/" + routine.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <span><strong>{routine.name}</strong><span className="ml-2 text-sm text-[var(--muted)]">{apparatus.find((item) => item.key === routine.apparatus)?.label ?? routine.apparatus}</span></span>
                  <span className="text-xs text-[var(--muted)]">{routine.purpose}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </section>
    </AppShell>
  );
}
