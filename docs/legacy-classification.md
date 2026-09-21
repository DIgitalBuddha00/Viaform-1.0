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

## Blank-slate rule

A fresh Viaform 1.0 database contains no organisations, users, coaches, groups,
gymnasts, sessions, results, routines, evidence, competitions, QA fixtures, or
demo history. Production builds generate application code only; they do not
seed product data or mutate the database.
