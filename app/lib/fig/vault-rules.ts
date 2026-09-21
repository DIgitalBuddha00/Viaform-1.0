import type {FigRulesetLevel,FigVault} from "./types";
export function figLevel(value?:string|null):FigRulesetLevel{return String(value||"").toUpperCase().includes("JUNIOR")?"JUNIOR":"SENIOR"}
export function validateVaultPair(_level:FigRulesetLevel,first:FigVault|null,second:FigVault|null){
 const issues:string[]=[];
 if(!first)issues.push("Choose a primary vault.");
 if(!second)issues.push("Choose a second vault.");
 if(first&&second&&first.id===second.id)issues.push("The same performed vault cannot be repeated.");
 return {valid:issues.length===0,issues,averageD:first&&second?(first.dValue+second.dValue)/2:null};
}
export function allAroundVaultScore(firstVaultFinal:number){return firstVaultFinal}
export function vaultEventScore(firstFinal:number,secondFinal:number){return (firstFinal+secondFinal)/2}
