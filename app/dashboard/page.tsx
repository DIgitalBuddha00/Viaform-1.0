import { AppShell } from "@/app/components/app-shell";
import { requireAuthContext } from "@/app/lib/auth";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const context = await requireAuthContext();
  return <AppShell organisationName={context.organisation.name} displayName={context.user.displayName} access={context.access}>
    <section>
      <p className="text-sm font-semibold text-[var(--muted)]">Home</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your coaching workspace</h1>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Viaform will bring together the evidence, context and working environments you use to support coaching decisions.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"><p className="text-sm font-semibold text-[var(--muted)]">Workspace status</p><h2 className="mt-2 text-xl font-semibold">Ready for core coaching</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Identity, coaching scope, groups and gymnast overviews are active. Programme and pathway context is now being rebuilt on the canonical 1.0 model.</p></article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"><p className="text-sm font-semibold text-[var(--muted)]">Decision support</p><h2 className="mt-2 text-xl font-semibold">Evidence → Context → Guidance → Coach judgement</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Working environments will appear here as they are rebuilt from the canonical 1.0 model.</p></article>
      </div>
    </section>
  </AppShell>;
}
