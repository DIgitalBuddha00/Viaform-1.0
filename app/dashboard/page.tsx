import { signOut } from "@/app/actions/auth";
import { requireAuthContext } from "@/app/lib/auth";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const context = await requireAuthContext();
  const roles = [...(context.access.isAdministrator ? ["Administrator"] : []), ...context.access.coachingRoles];
  return <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
    <header className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Viaform 1.0</p><h1 className="mt-2 text-3xl font-semibold">{context.organisation.name}</h1></div><form action={signOut}><button className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold">Sign out</button></form></header>
    <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm"><p className="text-sm text-[var(--muted)]">Signed in as</p><h2 className="mt-1 text-2xl font-semibold">{context.user.displayName}</h2><p className="mt-2 text-[var(--muted)]">{roles.join(" · ")}</p><div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"><p className="font-semibold">Foundation workspace</p><p className="mt-2 text-sm text-[var(--muted)]">Authentication and the organisation boundary are active.</p></div></section>
  </main>;
}
