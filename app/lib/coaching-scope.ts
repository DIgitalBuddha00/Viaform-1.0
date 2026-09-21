import type { AccessProfile } from "./access-control";

export function groupScopeWhere(organisationId:string,membershipId:string,access:AccessProfile){
  return access.canViewAllCoachingData
    ? { organisationId }
    : { organisationId, coachAssignments: { some: { membershipId } } };
}

export function gymnastScopeWhere(organisationId:string,membershipId:string,access:AccessProfile){
  return access.canViewAllCoachingData
    ? { organisationId }
    : { organisationId, groups: { some: { trainingGroup: { coachAssignments: { some: { membershipId } } } } } };
}
