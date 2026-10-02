import {AppShell} from "@/app/components/app-shell";
import {requireAuthContext} from "@/app/lib/auth";

export const dynamic="force-dynamic";

export default async function More(){
  const c=await requireAuthContext();
  const items=[
    {label:"Coach profile & settings",href:"/profile",description:"Profile, coach PIN and account settings.",show:true},
    {label:"Video workspace",href:"/video",description:"Capture, review, compare and annotate coaching video.",show:c.access.canUseCoachingWorkspace},
    {label:"Ask Mentor",href:"/mentor",description:"Ask questions using Viaform evidence and approved coaching methodology.",show:c.access.canUseCoachingWorkspace},
    {label:"Analysis",href:"/analysis",description:"Explore and compare evidence across Viaform.",show:c.access.canUseCoachingWorkspace},
    {label:"Organisation & access",href:"/people",description:"People, roles and organisation access.",show:c.access.canManagePeopleAndRoles},
    {label:"Programmes & methodology",href:"/programmes",description:"Programmes, stages and coaching methodology.",show:c.access.canManageProgrammesAndMethodology||c.access.canUseCoachingWorkspace},
    {label:"Facilities & resources",href:"/facilities",description:"Locations, training spaces and equipment.",show:c.access.canConfigureFacilities||c.access.canUseCoachingWorkspace},
    {label:"Coach handoffs",href:"/handoffs",description:"Coverage, handoffs and coaching continuity.",show:c.access.canUseCoachingWorkspace},
    {label:"Rotations",href:"/rotations",description:"Training-space and rotation operations.",show:c.access.canManageRotations||c.access.canUseCoachingWorkspace},
  ].filter(item=>item.show);
  const supporting=[
    {label:"Appearance",href:"/appearance",show:true},
    {label:"Updates",href:"/updates",show:c.access.canUseCoachingWorkspace||c.access.canManageProgrammesAndMethodology},
    {label:"Methodology",href:"/methodology",show:c.access.canUseCoachingWorkspace||c.access.canManageProgrammesAndMethodology},
    {label:"Rulesets",href:"/rulesets",show:c.access.canManageProgrammesAndMethodology||c.access.canUseCoachingWorkspace},
    {label:"Archive",href:"/archive",show:c.access.canUseCoachingWorkspace||c.access.canManagePeopleAndRoles},
    {label:"Programme leadership",href:"/programme-leads",show:c.access.canManageProgrammesAndMethodology},
    {label:"Trusted contributors",href:"/contributors",show:c.access.canManageProgrammesAndMethodology},
  ].filter(item=>item.show);
  return <AppShell organisationName={c.organisation.name} displayName={c.user.displayName} access={c.access}>
    <section className="workspace-page">
      <div className="workspace-hero"><div><p className="workspace-kicker">More</p><h1>More</h1><p className="workspace-meta">Settings, organisation and specialist workspaces</p></div></div>
      <section className="mt-8"><div className="more-grid">{items.map(item=><a key={item.href} href={item.href}><span><strong>{item.label}</strong><small className="mt-1 block font-normal text-[var(--muted)]">{item.description}</small></span><b>→</b></a>)}</div></section>
      {supporting.length>0&&<section className="mt-9"><h2 className="text-sm font-semibold text-[var(--muted)]">Related settings and administration</h2><div className="more-grid mt-3">{supporting.map(item=><a key={item.href} href={item.href}><span>{item.label}</span><b>→</b></a>)}</div></section>}
    </section>
  </AppShell>;
}
