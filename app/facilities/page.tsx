import { AppShell } from "@/app/components/app-shell";
import {
  createFacilityLocation,
  updateFacilityLocation,
  deleteFacilityLocation,
  createTrainingSpace,
  updateTrainingSpace,
  deleteTrainingSpace,
  createFacilityResource,
  updateFacilityResource,
  deleteFacilityResource,
} from "@/app/actions/facilities";
import { requireAuthContext } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const c = await requireAuthContext();
  const locations = await prisma.facilityLocation.findMany({
    where: { organisationId: c.organisation.id, status: "ACTIVE" },
    include: {
      spaces: {
        where: { status: "ACTIVE" },
        include: { resources: { where: { status: "ACTIVE" }, orderBy: [{ orderIndex: "asc" }, { name: "asc" }] } },
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });
  const canConfigure = c.access.canConfigureFacilities;

  return (
    <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
      <section>
        <a href="/programmes" className="text-sm font-semibold text-[var(--muted)]">← More</a>
        <p className="mt-5 text-sm font-semibold text-[var(--muted)]">Facilities & equipment</p>
        <h1 className="mt-2 text-3xl font-semibold">Training environment</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
          Define the real spaces and equipment available to planning. These are club-owned operational resources, not governing-body rules.
        </p>

        {canConfigure && (
          <form action={createFacilityLocation} className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:grid-cols-[1fr_2fr_auto]">
            <input name="name" required placeholder="Facility name" className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <input name="notes" placeholder="Optional facility note" className="rounded-xl border border-[var(--border)] px-3 py-3" />
            <button className="rounded-xl bg-[var(--foreground)] px-4 py-3 font-semibold text-white">Add facility</button>
          </form>
        )}

        <div className="mt-8 grid gap-5">
          {locations.length ? locations.map((location) => (
            <article key={location.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{location.name}</h2>
                  {location.notes && <p className="mt-2 text-sm text-[var(--muted)]">{location.notes}</p>}
                </div>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm">{location.spaces.length} spaces</span>
              </div>

              {canConfigure && (
                <details className="mt-4 border-t border-[var(--border)] pt-4">
                  <summary className="cursor-pointer text-sm font-semibold">Edit facility</summary>
                  <form action={updateFacilityLocation} className="mt-3 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                    <input type="hidden" name="locationId" value={location.id} />
                    <input name="name" required defaultValue={location.name} className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <input name="notes" defaultValue={location.notes ?? ""} className="rounded-lg border border-[var(--border)] px-3 py-2" />
                    <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save</button>
                  </form>
                  <form action={deleteFacilityLocation} className="mt-3">
                    <input type="hidden" name="locationId" value={location.id} />
                    <button className="text-sm text-[var(--muted)]">Delete facility</button>
                  </form>
                </details>
              )}

              <div className="mt-5 grid gap-4">
                {location.spaces.map((space) => (
                  <details key={space.id} open className="rounded-xl border border-[var(--border)] p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="font-semibold">{space.name}</span>
                          <span className="ml-2 text-xs text-[var(--muted)]">{space.shareable ? "Shareable" : "Exclusive"}{space.capacity ? " · capacity " + space.capacity : ""}</span>
                        </div>
                        <span className="text-sm text-[var(--muted)]">{space.resources.length} resources</span>
                      </div>
                    </summary>

                    {space.notes && <p className="mt-2 text-sm text-[var(--muted)]">{space.notes}</p>}

                    <div className="mt-3 grid gap-2">
                      {space.resources.map((resource) => (
                        <details key={resource.id} className="rounded-lg border border-[var(--border)] px-3 py-2">
                          <summary className="cursor-pointer list-none">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{resource.name}</span>
                              <span className="text-xs text-[var(--muted)]">{resource.category} · qty {resource.quantity} · cap {resource.capacity} · {resource.availability}</span>
                            </div>
                          </summary>
                          {resource.setupNotes && <p className="mt-2 text-xs text-[var(--muted)]">{resource.setupNotes}</p>}
                          {canConfigure && (
                            <>
                              <form action={updateFacilityResource} className="mt-3 grid gap-2 md:grid-cols-3">
                                <input type="hidden" name="resourceId" value={resource.id} />
                                <input name="name" required defaultValue={resource.name} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                                <input name="category" defaultValue={resource.category} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                                <select name="availability" defaultValue={resource.availability} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                                  <option value="AVAILABLE">Available</option>
                                  <option value="LIMITED">Limited</option>
                                  <option value="UNAVAILABLE">Unavailable</option>
                                </select>
                                <input name="quantity" type="number" min="1" required defaultValue={resource.quantity} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                                <input name="capacity" type="number" min="1" required defaultValue={resource.capacity} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                                <input name="setupNotes" defaultValue={resource.setupNotes ?? ""} placeholder="Setup notes" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                                <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold md:w-fit">Save resource</button>
                              </form>
                              <form action={deleteFacilityResource} className="mt-2">
                                <input type="hidden" name="resourceId" value={resource.id} />
                                <button className="text-xs text-[var(--muted)]">Delete resource</button>
                              </form>
                            </>
                          )}
                        </details>
                      ))}
                      {!space.resources.length && <p className="text-sm text-[var(--muted)]">No equipment or resources added yet.</p>}
                    </div>

                    {canConfigure && (
                      <>
                        <form action={createFacilityResource} className="mt-4 grid gap-2 rounded-lg border border-[var(--border)] p-3 md:grid-cols-3">
                          <input type="hidden" name="spaceId" value={space.id} />
                          <input name="name" required placeholder="Equipment/resource name" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                          <input name="category" placeholder="Category (e.g. apparatus, mat)" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                          <input name="setupNotes" placeholder="Setup notes" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                          <input name="quantity" type="number" min="1" defaultValue="1" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                          <input name="capacity" type="number" min="1" defaultValue="1" className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm" />
                          <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add resource</button>
                        </form>
                        <details className="mt-4 border-t border-[var(--border)] pt-3">
                          <summary className="cursor-pointer text-sm font-semibold">Edit space</summary>
                          <form action={updateTrainingSpace} className="mt-3 grid gap-2 md:grid-cols-3">
                            <input type="hidden" name="spaceId" value={space.id} />
                            <input name="name" required defaultValue={space.name} className="rounded-lg border border-[var(--border)] px-3 py-2" />
                            <input name="capacity" type="number" min="1" defaultValue={space.capacity ?? ""} placeholder="Capacity (optional)" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                              <input name="shareable" type="checkbox" defaultChecked={space.shareable} /> Shareable
                            </label>
                            <input name="notes" defaultValue={space.notes ?? ""} placeholder="Space notes" className="rounded-lg border border-[var(--border)] px-3 py-2 md:col-span-2" />
                            <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Save space</button>
                          </form>
                          <form action={deleteTrainingSpace} className="mt-2">
                            <input type="hidden" name="spaceId" value={space.id} />
                            <button className="text-xs text-[var(--muted)]">Delete space</button>
                          </form>
                        </details>
                      </>
                    )}
                  </details>
                ))}
              </div>

              {canConfigure && (
                <form action={createTrainingSpace} className="mt-4 grid gap-2 rounded-xl border border-[var(--border)] p-4 md:grid-cols-[1fr_140px_160px_2fr_auto]">
                  <input type="hidden" name="locationId" value={location.id} />
                  <input name="name" required placeholder="Training space" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                  <input name="capacity" type="number" min="1" placeholder="Capacity" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                  <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                    <input name="shareable" type="checkbox" defaultChecked /> Shareable
                  </label>
                  <input name="notes" placeholder="Optional note" className="rounded-lg border border-[var(--border)] px-3 py-2" />
                  <button className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">Add space</button>
                </form>
              )}
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
              <h2 className="font-semibold">No facilities configured</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Add the club’s real training environment when ready. Viaform does not seed demo facilities.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
