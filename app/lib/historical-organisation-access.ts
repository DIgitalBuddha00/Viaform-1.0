import "server-only";
import {prisma} from "./prisma";

export async function historicalOrganisationScope(userId:string,activeOrganisationId:string){
 const grants=await prisma.historicalOrganisationAccess.findMany({where:{userId,revokedAt:null,organisation:{status:"ARCHIVED"}},select:{organisationId:true,organisation:{select:{name:true,status:true,archivedAt:true}}},orderBy:{organisation:{name:"asc"}}});
 return [{organisationId:activeOrganisationId,name:null,status:"ACTIVE" as const,archivedAt:null},...grants.map(g=>({organisationId:g.organisationId,name:g.organisation.name,status:"ARCHIVED" as const,archivedAt:g.organisation.archivedAt}))];
}

export async function canReadHistoricalOrganisation(userId:string,organisationId:string){return !!await prisma.historicalOrganisationAccess.findFirst({where:{userId,organisationId,revokedAt:null,organisation:{status:"ARCHIVED"}},select:{id:true}})}
