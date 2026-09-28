import {notFound} from "next/navigation";
import {PortalShell} from "@/app/components/portal-shell";
import {PortalGymnastView} from "@/app/components/portal-gymnast-view";
import {requirePortalContext} from "@/app/lib/auth";
export const dynamic="force-dynamic";
export default async function FamilyPage(){const c=await requirePortalContext();const accesses=c.accesses.filter(x=>x.relationship==="GUARDIAN");if(!accesses.length)notFound();return <PortalShell displayName={c.user.displayName} organisationName={c.organisation.name} audience="GUARDIAN"><div><p className="text-sm font-semibold text-[var(--accent-strong)]">Family view</p><h1 className="mt-1 text-3xl font-semibold">Training & progress</h1></div>{accesses.map((a,i)=><section key={a.id} className={i?"mt-12 border-t border-[var(--border)] pt-10":"mt-7"}><PortalGymnastView gymnastId={a.gymnastId} organisationId={a.organisationId} audience="GUARDIAN"/></section>)}</PortalShell>}