"use client";
import {useMemo,useState,useTransition,type ReactNode} from "react";
import {resetOverviewWidgetLayout,saveOverviewWidgetLayout} from "@/app/actions/preferences";
import type {OverviewSurface,WidgetLayout,WidgetSize} from "@/app/lib/widget-layout";
export type OverviewWidget={id:string;title:string;category:string;default?:boolean;defaultSize?:WidgetSize;small:ReactNode;medium?:ReactNode;large?:ReactNode};
export function OverviewWidgets({surface,widgets,initialLayout}:{surface:OverviewSurface;widgets:OverviewWidget[];initialLayout?:WidgetLayout|null}){
 const ids=useMemo(()=>widgets.map(w=>w.id),[widgets]);
 const normalise=(layout?:WidgetLayout|null):WidgetLayout=>{const defaults=widgets.filter(w=>w.default!==false).map(w=>w.id),supplied=(layout?.order??[]).filter(x=>ids.includes(x)),order=layout?[...supplied,...ids.filter(x=>!supplied.includes(x))]:[...defaults,...ids.filter(x=>!defaults.includes(x))],hidden=layout?(layout.hidden??[]).filter(x=>ids.includes(x)):ids.filter(x=>!defaults.includes(x)),sizes:Record<string,WidgetSize>={};for(const w of widgets)sizes[w.id]=layout?.sizes?.[w.id]??w.defaultSize??"M";return{order,hidden,sizes}};
 const [editing,setEditing]=useState(false),[saved,setSaved]=useState<WidgetLayout>(()=>normalise(initialLayout)),[pending,startTransition]=useTransition();
 const persist=(next:WidgetLayout)=>{setSaved(next);startTransition(()=>saveOverviewWidgetLayout(surface,next))},map=new Map(widgets.map(w=>[w.id,w]));
 const visible=saved.order.filter(id=>!saved.hidden.includes(id)).map(id=>map.get(id)).filter(Boolean) as OverviewWidget[],hidden=saved.order.filter(id=>saved.hidden.includes(id)).map(id=>map.get(id)).filter(Boolean) as OverviewWidget[];
 const move=(id:string,d:number)=>{const active=saved.order.filter(x=>!saved.hidden.includes(x)),i=active.indexOf(id),j=i+d;if(i<0||j<0||j>=active.length)return;const o=[...saved.order],a=o.indexOf(id),b=o.indexOf(active[j]);[o[a],o[b]]=[o[b],o[a]];persist({...saved,order:o})};
 const toggle=(id:string)=>persist({...saved,hidden:saved.hidden.includes(id)?saved.hidden.filter(x=>x!==id):[...saved.hidden,id]});
 const size=(id:string,next:WidgetSize)=>persist({...saved,sizes:{...saved.sizes,[id]:next}});
 const reset=()=>{const next=normalise(null);setSaved(next);startTransition(()=>resetOverviewWidgetLayout(surface))};
 const groups=hidden.reduce<Record<string,OverviewWidget[]>>((a,w)=>{(a[w.category]??=[]).push(w);return a},{});
 return <section className="overview-widget-system"><div className="overview-widget-toolbar"><p>Overview</p><div><span>{pending?"Saving…":"Saved"}</span><button type="button" onClick={()=>setEditing(x=>!x)}>{editing?"Done":"Customise"}</button></div></div>
 {editing&&<div className="overview-widget-editor"><div className="overview-widget-editor-head"><strong>Layout</strong><button type="button" onClick={reset}>Reset default</button></div>{Object.keys(groups).length>0&&<details><summary>+ Add widget</summary><div className="overview-widget-library">{Object.entries(groups).map(([category,list])=><div key={category}><strong>{category}</strong><div>{list.map(w=><button type="button" disabled={pending} key={w.id} onClick={()=>toggle(w.id)}>+ {w.title}</button>)}</div></div>)}</div></details>}</div>}
 <div className="overview-widget-grid">{visible.map((w,i)=>{const s=saved.sizes[w.id]??"M",content=s==="L"?(w.large??w.medium??w.small):s==="M"?(w.medium??w.small):w.small;return <div key={w.id} className={"overview-widget-slot size-"+s.toLowerCase()}>{editing&&<div className="overview-widget-controls"><strong>{w.title}</strong><span><button type="button" disabled={i===0||pending} onClick={()=>move(w.id,-1)}>←</button><button type="button" disabled={i===visible.length-1||pending} onClick={()=>move(w.id,1)}>→</button>{(["S","M","L"] as WidgetSize[]).map(x=><button type="button" key={x} className={s===x?"active":""} disabled={pending} onClick={()=>size(w.id,x)}>{x}</button>)}<button type="button" disabled={pending} onClick={()=>toggle(w.id)}>Remove</button></span></div>}<div className="overview-widget-content">{content}</div></div>})}</div>
 </section>;
}
