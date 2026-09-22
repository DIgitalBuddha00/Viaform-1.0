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

## Phase 3 — FIG rule audit gate

The current FIG package is the authority. Legacy evaluation code is not treated as verified merely because it previously shipped. The first current-source audit removed legacy Vault pair assumptions from executable 1.0 logic until the applicable Senior/Junior rules are verified against the Aug 2026 CoP. Shared element/rule tables remain ready for verified imports. Beam generated extraction remains quarantined.

## Phase 3 — verified FIG rule batch 1

Current-source verification promotes only rules supported by the pinned CoP: Senior Vault context distinguishes Team/AA, Apparatus Qualification and Apparatus Final rather than applying the final-only different-group rule globally; Senior Bars stores the 8-DV/dismount rule and same-root chronological limit; Senior Beam stores the 8-DV, 3 Dance, 3 Acro, 2 optional composition. Floor and Junior-specific records remain behind the audit gate until their current-source passages are verified. No legacy element row is promoted solely from the frozen app.

## Phase 3 — verified FIG rules batch 2

The pinned current CoP verifies the shared A–J DV scale and chronological repetition rules, Senior Floor counting/acro-line/CR structure, and the Junior appendix rules for DV cap, short exercise, no DMT bonus and Vault pair/prohibition differences. The routine helper now selects highest difficulty values rather than the first eight entered and applies the Junior E-value cap to F–J. Element identity/repetition and apparatus-specific counting constraints remain separate concerns and are not guessed by the helper.

## Phase 3 — verified FIG rules batch 3

The current-source audit corrects the Batch 1 Senior Vault scope: the different-group requirement applies in both qualification for the Apparatus Final and the Apparatus Final; Team Final and All-Around still use one vault. The 0.20 different-second-flight-direction bonus requires both vaults without a fall. The canonical rule layer now also records Senior short-exercise and dismount-bonus rules, shared CV recognition boundaries, complete Senior Bars and Beam composition requirements and connection structures, and the Junior UB/BB/FX prohibited-element modifications. Junior pair validation enforces different official vault numbers without imposing the Senior different-group rule. No element-table row is promoted by this batch.

## Phase 3 — verified FIG rules batch 4

The current CoP now supplies structured evaluation boundaries for shared CR fulfilment and direct connections, Bars flight/no-dismount recognition, Beam timing/fall/no-dismount recognition, and Floor timing, dismount construction, dance-passage construction, connection formulas and Floor-specific dismount-bonus conditions. The short-exercise helper implements the distinct Senior seven-element and Junior six-element no-penalty thresholds. It remains a bounded helper rather than a claim of complete D-score evaluation. No legacy registry or element-table row is imported by this batch.

## Phase 3 — verified FIG content batch 5

The first canonical Vault registry subset contains exactly the 24 populated Group 1 entries on current CoP pages 60–62. Official numbers, names and D-values were checked against rendered source pages as well as extracted text. Blank numbered cells remain absent. Aliases are deliberately empty until separately evidenced; all Group 1 entries are non-salto second flights and are not double saltos. No legacy Vault value is used as authority.
