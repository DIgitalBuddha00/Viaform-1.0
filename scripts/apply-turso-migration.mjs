import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createClient } from "@libsql/client";

const migrationDirectory = process.env.MIGRATION_DIRECTORY;
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!migrationDirectory || !/^[0-9]{14}_[a-z0-9_]+$/.test(migrationDirectory)) {
  throw new Error("MIGRATION_DIRECTORY must be a timestamped Prisma migration directory name.");
}
if (!databaseUrl || !authToken) {
  throw new Error("Turso connection secrets are unavailable.");
}

const migrationsRoot = resolve(process.cwd(), "prisma", "migrations");
const migrationRoot = resolve(migrationsRoot, migrationDirectory);
if (!migrationRoot.startsWith(`${migrationsRoot}${sep}`)) {
  throw new Error("Migration path escaped prisma/migrations.");
}

const sql = await readFile(resolve(migrationRoot, "migration.sql"), "utf8");
const client = createClient({ url: databaseUrl, authToken });

try {
  await client.executeMultiple(sql);

  try {
    const verificationSql = await readFile(resolve(migrationRoot, "verify.sql"), "utf8");
    const result = await client.execute(verificationSql.replace(/;\s*$/, ""));
    const rows = result.rows.map((row) =>
      Object.fromEntries(
        result.columns.map((column) => {
          const value = row[column];
          return [column, typeof value === "bigint" ? value.toString() : value];
        }),
      ),
    );
    console.log(JSON.stringify({ verification: rows }, null, 2));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await client.execute("SELECT 1");
    console.log("Migration applied; no verify.sql was supplied.");
  }
} finally {
  client.close();
}
