export type FigRulesetLevel="SENIOR"|"JUNIOR";
export type VaultDirection="FORWARD"|"BACKWARD"|"NON_SALTO";
export type FigVault={id:string;officialNumber:string;variantKey:string;group:number;name:string;aliases:string[];dValue:number;secondFlightDirection:VaultDirection;doubleSalto:boolean};
export type VaultProgrammeMode="ONE_VAULT"|"TWO_VAULT"|"DEVELOPING_SECOND";
