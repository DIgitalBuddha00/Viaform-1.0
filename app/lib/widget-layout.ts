export type OverviewSurface="HOME"|"GROUP"|"GYMNAST"|"TESTING"|"COMPETITION";
export type WidgetSize="S"|"M"|"L";
export type WidgetLayout={order:string[];hidden:string[];sizes:Record<string,WidgetSize>};
type Stored={ [key:string]: unknown };
function object(value:string|undefined|null):Stored{try{const x=JSON.parse(value??"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{};}catch{return{}}}
function strings(x:unknown){return Array.isArray(x)?x.filter((v):v is string=>typeof v==="string"):[]}
export function readOverviewLayout(pref:{homeWidgetOrder:string;homeWidgetHidden:string;homeWidgetWide:string}|null|undefined,surface:OverviewSurface):WidgetLayout|null{
 if(!pref)return null;const orders=object(pref.homeWidgetOrder),hidden=object(pref.homeWidgetHidden),sizes=object(pref.homeWidgetWide);
 if(!Object.prototype.hasOwnProperty.call(orders,surface))return null;
 const rawSizes=sizes[surface],cleanSizes:Record<string,WidgetSize>={};
 if(rawSizes&&typeof rawSizes==="object"&&!Array.isArray(rawSizes))for(const [k,v] of Object.entries(rawSizes as Record<string,unknown>))if(v==="S"||v==="M"||v==="L")cleanSizes[k]=v;
 return{order:strings(orders[surface]),hidden:strings(hidden[surface]),sizes:cleanSizes};
}
