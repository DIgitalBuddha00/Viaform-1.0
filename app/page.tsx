export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Viaform 1.0</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">A clean foundation for coaching decision support.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">Evidence → Context → Guidance → Coach judgement.</p>
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
          <p className="font-semibold">Foundation initialized</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The 1.0 application shell is independent of the legacy build chain. Database connectivity can be verified without seeding or mutating the new workspace.</p>
        </div>
      </section>
    </main>
  );
}
