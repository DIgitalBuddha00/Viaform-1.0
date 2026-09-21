-- Phase 3D canonical FIG WAG identity. This is Viaform-managed reference data, not demo/QA data.
INSERT INTO "RulesetProgram" ("id","code","name","governingBody","discipline","status","sourceUrl","createdAt","updatedAt")
SELECT 'canonical_fig_wag','FIG_WAG','FIG Women''s Artistic Gymnastics','FIG','WAG','ACTIVE','https://www.gymnastics.sport/site/rules/',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "RulesetProgram" WHERE "code"='FIG_WAG');
INSERT INTO "RulesetLevel" ("id","programId","code","name","orderIndex","status","notes","createdAt","updatedAt")
SELECT 'canonical_fig_wag_junior',"id",'JUNIOR','Junior',10,'ACTIVE','FIG WAG 2025–2028 Junior modifications.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM "RulesetProgram" WHERE "code"='FIG_WAG'
AND NOT EXISTS (SELECT 1 FROM "RulesetLevel" WHERE "programId"=(SELECT "id" FROM "RulesetProgram" WHERE "code"='FIG_WAG') AND "code"='JUNIOR');
INSERT INTO "RulesetLevel" ("id","programId","code","name","orderIndex","status","notes","createdAt","updatedAt")
SELECT 'canonical_fig_wag_senior',"id",'SENIOR','Senior',20,'ACTIVE',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM "RulesetProgram" WHERE "code"='FIG_WAG'
AND NOT EXISTS (SELECT 1 FROM "RulesetLevel" WHERE "programId"=(SELECT "id" FROM "RulesetProgram" WHERE "code"='FIG_WAG') AND "code"='SENIOR');
