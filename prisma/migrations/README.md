# Viaform 1.0 database migrations

Database changes are explicit operations and are not part of the Vercel production build.

The baseline migration creates only canonical structure. It deliberately inserts no
organisation, user, coach, gymnast, QA, demo, fixture, competition, routine, evidence,
or historical data.

For a new database, apply migration SQL in chronological order using an authorised
database administration environment. Application deployments continue to run
`prisma generate && next build` only.
