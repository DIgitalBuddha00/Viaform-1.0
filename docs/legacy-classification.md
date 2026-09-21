# Viaform 1.0 legacy classification

The frozen legacy application is behavioural evidence, not source architecture.

## Dispositions

- **KEEP** — proven behaviour or concept belongs in Viaform 1.0.
- **REBUILD** — behaviour belongs, implementation does not.
- **CONSOLIDATE** — overlapping legacy implementations become one canonical 1.0 implementation.
- **DEFER** — valid capability, but not required for the current 1.0/gym-test slice.
- **REMOVE** — prototype or compatibility behaviour that does not belong in 1.0.
- **TEST-ONLY** — useful for validation but prohibited from the pristine production baseline.

## Foundation 1B — identity, organisation, permissions

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| User authentication identity | Security/Permissions | REBUILD | Canonical User identity |
| Organisation tenant | Data | KEEP / REBUILD | Organisation is the direct tenant boundary |
| Organisation membership | Security/Permissions | REBUILD | One membership joins a user to an organisation |
| Administrator separate from coaching role | Security/Permissions | KEEP | Explicit membership authority, independently stackable |
| Head Coach whole-club coaching visibility | Security/Permissions | KEEP | Derived from coaching role |
| Scoped coaching access | Security/Permissions | KEEP | Applied as coaching domains are rebuilt |
| Delegated capabilities | Security/Permissions | KEEP / CONSOLIDATE | Canonical capability list |
| Apparatus/specialist roles | Security/Permissions | KEEP | Stored on membership; enforced when those domains arrive |
| Gymnast/coach explicit access | Security/Permissions | KEEP / DEFER | Add with gymnast domain rather than premature schema |
| Club / ClubCoach compatibility layer | Refactor | REMOVE | No legacy club model |
| legacyClubId | Refactor | REMOVE | No compatibility tenant bridge |
| Legacy COACH fallback | Refactor | REMOVE | Roles are explicit |
| Runtime repair of archived coach state | Refactor | REMOVE | No historical-state repair in normal requests |
| Separate coach identity session | Security/Permissions | REBUILD / CONSOLIDATE | User session + organisation membership is canonical |
| QA/demo users, clubs and profiles | Data | TEST-ONLY | Never seed production main |
| Demo/QA production initialization | Data | REMOVE | Test environments own their own data |

## Foundation 1C — authentication and sessions

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Email/password authentication | Security/Permissions | REBUILD | Canonical User authentication |
| Salted password hashing | Security/Permissions | KEEP / REBUILD | scrypt with per-user salt |
| Hashed session tokens | Security/Permissions | KEEP / REBUILD | Random browser token; hash persisted |
| First-user bootstrap | Security/Permissions | REBUILD | One-time real organisation onboarding from empty state |
| Legacy coach session/repair | Refactor | REMOVE | Membership is the access identity |

## Foundation 1D — application shell

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Role-aware authenticated shell | UI / Security | REBUILD | Shell derives only from canonical AccessProfile |
| Tablet primary navigation | UI | KEEP / REBUILD | Established nine destinations retained as product architecture |
| Phone primary navigation | UI | KEEP / REBUILD | Home, My Groups, Planning, Training, More |
| Internal role codes in UI | UI | REMOVE | Human-readable role labels |
| Working links to unbuilt domains | UI | DEFER | Destinations shown as unavailable until their domain exists |
| Widget dashboards | UI | DEFER | Add widgets with real domains; shell does not invent empty widgets |

## Blank-slate rule

A fresh Viaform 1.0 database contains no organisations, users, coaches, groups,
gymnasts, sessions, results, routines, evidence, competitions, QA fixtures, or
demo history. Production builds generate application code only; they do not
seed product data or mutate the database.

## Core Coaching 2A — groups and gymnast identity

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Gymnast as coach-owned record | Data / Permissions | REMOVE | Gymnast belongs directly to Organisation |
| Training group as coach-owned record | Data / Permissions | REBUILD | Group belongs directly to Organisation |
| Multi-group gymnast membership | Data | KEEP / REBUILD | Canonical many-to-many membership |
| Primary group | Data | KEEP | Membership can identify the primary group |
| My Groups workspace | UI | KEEP / REBUILD | First live core-coaching destination |
| Group schedules/hours | Feature | DEFER | Add with planning/calendar domain |
| Programme/ruleset assignment during gymnast creation | Rules / Data | DEFER | Add only with canonical programme/ruleset domains |
| Shared-coach access side effects | Security/Permissions | REBUILD / DEFER | Scope from canonical memberships; no legacy Coach bridge |
| Legacy QA roster and simulated history | Data | TEST-ONLY | Never populate production main |

## Core Coaching 2B — roster operations

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Rename/delete groups | Feature | KEEP / REBUILD | Organisation-scoped mutations |
| Edit/delete gymnasts | Feature | KEEP / REBUILD | Organisation-scoped mutations |
| Add/remove group membership | Feature | KEEP / REBUILD | Canonical membership mutations |
| Transfer gymnast | Feature | CONSOLIDATE | Add/remove memberships; primary group is explicit |
| Automatic primary reassignment | Data | KEEP | Earliest remaining membership becomes primary |
| Group/gymnast management drawer complexity | UI | REBUILD | Progressive disclosure inside My Groups |

## Core Coaching 2C — coaching scope and group access

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Coach-owned groups | Security/Permissions | REMOVE | Organisation owns groups; memberships are assigned access |
| Shared group coaches | Security/Permissions | KEEP / REBUILD | TrainingGroupCoach joins group to OrganisationMembership |
| Head Coach whole-club visibility | Security/Permissions | KEEP | Bypasses assignment filter inside organisation |
| Regular coach assigned scope | Security/Permissions | KEEP / REBUILD | Groups and gymnasts derive from group assignments |
| GymnastCoachAccess side effects | Security/Permissions | CONSOLIDATE / DEFER | Group-derived scope first; direct temporary gymnast access later |
| Separate legacy Coach identity | Refactor | REMOVE | OrganisationMembership remains canonical coaching identity |

## Phase 3A — programme context foundation

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Organisation coaching programmes | Data | KEEP / REBUILD | Organisation-owned programme identity |
| Programme stages | Data | KEEP / REBUILD | Ordered stages within a programme |
| Competitive/recreational programme type | Data | KEEP | Explicit programme context, not inferred from group names |
| Programme on group | Data | KEEP / REBUILD | Explicit group assignment |
| Programme on gymnast | Data | KEEP / REBUILD | Explicit gymnast assignment for exceptions/individual pathways |
| Programme history | Data | DEFER | Add when transitions/pathway evidence is implemented |
| Ruleset program/level on Gymnast | Rules / Data | REBUILD / DEFER | Rulesets remain a separate canonical domain; do not conflate with club programme |
| Recreational curriculum/progress | Feature | DEFER | Build after programme identity is stable |
| Legacy programme seed/demo records | Data | TEST-ONLY | Never populate production main |

## Core Coaching 2D — overview hierarchy

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| My Groups as directory | UI | KEEP / REBUILD | Directory links into canonical overview pages |
| Group Overview | UI | KEEP / REBUILD | Group roster/coaching context plus future workspace entry points |
| Gymnast Overview | UI | KEEP / REBUILD | Gymnast context plus future workspace entry points |
| Overview widgets | UI | DEFER | Add summaries only when underlying domains contain real evidence |
| Editing inside overview widgets | UI | REMOVE | Overview remains summary/navigation; workspaces own work |

## Phase 3B — programme management and assignment

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Programme management | Feature | KEEP / REBUILD | Permission-gated club pathway workspace |
| Group programme/stage context | Feature | KEEP / REBUILD | Explicit assignment visible from Group Overview |
| Individual gymnast programme override | Feature | KEEP / REBUILD | Optional individual pathway; otherwise group context applies |
| Preset/demo programmes | Data | TEST-ONLY | Club creates real programme data explicitly |

## Phase 3C — canonical ruleset identity

| Legacy concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Ruleset programme | Rules / Data | KEEP / REBUILD | Global governing-body programme identity, separate from club programme |
| Ruleset level | Rules / Data | KEEP / REBUILD | Ordered level within a ruleset programme |
| Club ruleset availability | Rules / Data | REBUILD | Organisation explicitly enables relevant canonical ruleset programmes |
| Gymnast ruleset/level | Rules / Data | KEEP / REBUILD | Explicit gymnast assignment to enabled external rules context |
| Loose gymnast ruleset/level strings | Data | REMOVE | Canonical relations replace duplicated text fields |
| Ruleset packages/versions | Rules | DEFER | Add with effective-date rule evaluation |
| FIG/GI preset records | Data | DEFER | Add canonical content only after structure is verified |

## Phase 3D — governing-body ownership boundary

| Concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Club-created ruleset definitions | Rules / Permissions | REMOVE | Clubs cannot create or alter governing-body rulesets |
| Viaform canonical ruleset catalogue | Rules / Data | KEEP / REBUILD | Viaform-managed reference data |
| Organisation ruleset selection | Feature | KEEP / REBUILD | Club enables or stops using available canonical rulesets |
| FIG WAG identity | Rules / Data | KEEP / REBUILD | Canonical FIG_WAG with Junior and Senior levels |
| FIG technical rule package | Rules | DEFER | Import separately from the proven legacy registries after identity/catalogue verification |

## Phase 3E — FIG WAG rules foundation and Vault

| Concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Versioned FIG rules package | Rules / Data | KEEP / REBUILD | Rules attach to an effective-dated canonical package, not directly to club data |
| FIG Vault registry | Rules / Data | KEEP / REBUILD | Canonical vault definitions belong to a rules package |
| Vault pair evaluation | Rules | KEEP / REBUILD | Pure evaluation logic remains separate from UI and athlete data |
| Legacy FIG vault records | Data | AUDIT BEFORE IMPORT | Registry structure retained; values are not copied into 1.0 until checked against the current FIG source |
| FIG source provenance | Rules / Data | REBUILD | Package records source document, URL, publication/effective context |

## Phase 3 — accelerated FIG WAG four-apparatus foundation

| Concept | Type | Disposition | 1.0 direction |
| --- | --- | --- | --- |
| Shared UB/BB/FX element model | Rules / Data | KEEP / REBUILD | One canonical element table with apparatus-specific metadata |
| Apparatus and Junior/Senior rules | Rules / Data | KEEP / REBUILD | Structured rule records scoped by package, apparatus and level |
| Legacy Bars core registry | Rules / Data | AUDIT BEFORE IMPORT | Useful coach-facing metadata; verify against current FIG edition before canonical import |
| Legacy Beam generated registry | Rules / Data | REBUILD | Extraction contains visibly garbled rows; do not promote unverified text |
| Legacy Floor registry | Rules / Data | AUDIT BEFORE IMPORT | Strong structured base, but source edition predates current Aug 2026 CoP |
| Current FIG WAG source | Rules / Provenance | KEEP | 2025–2028 CoP currently listed by World Gymnastics as updated 27 Aug 2026 |

## Phase 3 — current FIG package provenance

The canonical 2025–2028 WAG package is pinned to the World Gymnastics rules catalogue revision dated 27 Aug 2026. The August 2026 WAG Help Desk is a companion clarification source. Legacy apparatus records remain outside canonical tables until each record/rule passes the current-source audit; this deliberately prevents stale or garbled extracted content from being promoted merely because it existed in the frozen app.
