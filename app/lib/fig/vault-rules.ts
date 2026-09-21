import type {FigRulesetLevel,FigVault} from "./types";
export type FigVaultContext="TEAM_OR_AA"|"APPARATUS_QUALIFICATION"|"APPARATUS_FINAL";
export function figLevel(value?:string|null):FigRulesetLevel{return String(value||"").toUpperCase().includes("JUNIOR")?"JUNIOR":"SENIOR"}
export function validateVaultPair(_level:FigRulesetLevel,first:FigVault|null,second:FigVault|null){const issues:string[]=[];if(!first)issues.push("Choose a primary vault.");if(!second)issues.push("Choose a second vault.");if(first&&second&&first.id===second.id)issues.push("The same performed vault cannot be repeated.");return {valid:issues.length===0,issues,averageD:first&&second?(first.dValue+second.dValue)/2:null};}
export function validateSeniorVaultForContext(context:FigVaultContext,first:FigVault|null,second:FigVault|null){const issues:string[]=[];if(!first)issues.push("Choose a primary vault.");if((context==="APPARATUS_QUALIFICATION"||context==="APPARATUS_FINAL")&&!second)issues.push("Choose a second vault.");if(context==="APPARATUS_FINAL"&&first&&second&&first.group===second.group)issues.push("Senior apparatus final requires two vaults from different groups.");return {valid:issues.length===0,issues};}
export function allAroundVaultScore(firstVaultFinal:number){return firstVaultFinal}
export function vaultEventScore(firstFinal:number,secondFinal:number){return (firstFinal+secondFinal)/2}
