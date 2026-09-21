import { redirect } from "next/navigation";
import { createFirstOrganisation } from "@/app/actions/auth";
import { prisma } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Setup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if ((await prisma.user.count()) > 0) redirect("/login");
  const { error } = await searchParams;
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12"><section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Viaform 1.0</p>
    <h1 className="mt-3 text-3xl font-semibold">Create your organisation</h1>
    <p className="mt-3 leading-7 text-[var(--muted)]">Set up the first real Viaform workspace. The first account starts as Administrator and Head Coach; those roles can be separated later.</p>
    {error && <p className="mt-5 rounded-xl border border-[var(--border)] p-3 text-sm">Complete every field and use at least 10 characters for the password.</p>}
    <form action={createFirstOrganisation} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-medium">Your name<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="displayName" required /></label>
      <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="email" type="email" required /></label>
      <label className="grid gap-2 text-sm font-medium">Organisation name<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="organisationName" required /></label>
      <label className="grid gap-2 text-sm font-medium">Password<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="password" type="password" minLength={10} required /></label>
      <button className="mt-2 rounded-xl bg-[var(--foreground)] px-5 py-3 font-semibold text-white">Create Viaform workspace</button>
    </form>
  </section></main>;
}
