import { redirect } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { currentAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if ((await prisma.user.count()) === 0) redirect("/setup");
  if (await currentAuthContext()) redirect("/dashboard");
  const { error } = await searchParams;
  return <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12"><section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Viaform 1.0</p><h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
    {error && <p className="mt-5 rounded-xl border border-[var(--border)] p-3 text-sm">{error === "access" ? "This account has no active organisation access." : "Email or password was not recognised."}</p>}
    <form action={signIn} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-medium">Email<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="email" type="email" required /></label>
      <label className="grid gap-2 text-sm font-medium">Password<input className="rounded-xl border border-[var(--border)] px-4 py-3" name="password" type="password" required /></label>
      <button className="mt-2 rounded-xl bg-[var(--foreground)] px-5 py-3 font-semibold text-white">Sign in</button>
    </form>
  </section></main>;
}
