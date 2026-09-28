"use client";
import type {ReactNode} from "react";
import {usePathname} from "next/navigation";
import {signOut} from "@/app/actions/auth";
import type {AccessProfile} from "@/app/lib/access-control";
import {coachingRoleLabel,primaryNavigation} from "@/app/lib/navigation";
import {ViaformMark} from "@/app/components/viaform-mark";
type Props={children:ReactNode;organisationName:string;displayName:string;access:AccessProfile};
const icon:Record<string,string>={Home:"⌂",Calendar:"□","My Groups":"◉",Planning:"◇",Training:"△",Testing:"○",Routines:"≡",Competitions:"☆",More:"•••"};
export function AppShell({children,organisationName,displayName,access}:Props){
 const pathname=usePathname(),navigation=primaryNavigation(access).filter(x=>x.enabled);
 const phone=access.canUseCoachingWorkspace?navigation.filter(x=>["Home","My Groups","Planning","Training","More"].includes(x.label)):navigation;
 const roles=[...(access.isAdministrator?["Administrator"]:[]),...access.coachingRoles.map(coachingRoleLabel)];
 const active=(href:string)=>href==="/dashboard"?pathname==="/dashboard":pathname===href||pathname.startsWith(href+"/");
 const links=(items:typeof navigation,cls:string)=>items.map(item=><a key={item.href} href={item.href} aria-current={active(item.href)?"page":undefined} className={cls+(active(item.href)?" nav-active":"")}><span className="nav-symbol" aria-hidden="true">{icon[item.label]??"·"}</span><span>{item.label==="My Groups"?"Groups":item.label}</span></a>);
 return <div className="app-shell"><div className="app-frame"><aside className="app-sidebar"><div className="app-sidebar-inner"><a href="/dashboard" className="brand-lockup"><ViaformMark/><span><strong>VIAFORM</strong><small>See more. Know why. Coach your way.</small></span></a><div className="sidebar-identity"><small>COACHING AS</small><strong>{displayName}</strong><span>{roles.join(" · ")}</span></div><nav className="sidebar-nav">{links(navigation,"nav-link")}</nav><a href="/appearance" className="sidebar-profile-link">Your Viaform</a></div></aside><div className="app-content"><header className="app-banner"><a href="/dashboard" className="app-banner-brand"><ViaformMark/><span><strong>VIAFORM</strong><small>{organisationName}</small></span></a><div className="app-banner-tools"><div className="banner-identity"><strong>{displayName}</strong><small>{roles.join(" · ")}</small></div><form action={signOut}><button className="signout-button">Sign out</button></form></div></header><main className="content-main">{children}</main></div></div>
 {phone.length>1&&<nav className="phone-bottom-nav">{links(phone,"mobile-nav-link")}</nav>}
 {navigation.length>1&&<nav className="tablet-bottom-nav">{links(navigation,"mobile-nav-link")}</nav>}
 </div>;
}