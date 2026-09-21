# Viaform 1.0

Viaform is a decision-support platform for artistic gymnastics coaching.

## Product principle

**Evidence → Context → Guidance → Coach judgement**

Viaform supports coaching decisions. It does not replace coach judgement, make autonomous progression decisions, or turn incomplete evidence into certainty.

## Repository status

This repository is the clean Viaform 1.0 implementation.

The previous development repository is retained only as a behavioural reference at its frozen `legacy-final` state. Historical build scripts, compatibility migrations, demo-enrichment chains, and prototype architecture are not to be copied here by default.

## 1.0 implementation rules

1. Rebuild proven behaviour deliberately; do not bulk-copy the legacy repository.
2. Keep one canonical schema and a small, intentional migration history.
3. Production builds must build the application, not replay product-development history.
4. Tests belong in explicit verification workflows, not an ever-growing deployment command.
5. Demo/QA data must be opt-in and removable; it is not production initialization.
6. Preserve tenant boundaries and the established role/capability model.
7. Preserve apparatus-specific routine and technical-coaching behaviour where the domain genuinely differs.
8. Unknown or missing evidence remains unknown; it is never silently converted into a negative assessment.
9. Widgets summarize and navigate; working environments perform work.
10. Tablet is the primary coaching device; phone workflows must remain usable.
11. New capability is added only when it belongs to the 1.0 scope or real gym testing demonstrates the need.

## Initial 1.0 sequence

- Foundation: application shell, canonical schema, authentication/tenant boundary, build pipeline.
- Core coaching: groups, gymnasts, planning, live training, testing.
- Technical coaching: evidence and apparatus-specific attempt capture.
- Routines: gymnast-first routine workspace with Overview / Build / Strategy / Pathway.
- Mentor: evidence/context/guidance presentation with provenance and uncertainty.
- Competition/progress: established official-result and longitudinal workflows.
- Parity QA against the frozen legacy reference.
- Clean gym-test dataset and real-world testing.

This README is intentionally architectural rather than a copy of the legacy roadmap. The legacy application is evidence of expected behaviour, not the source architecture for Viaform 1.0.
