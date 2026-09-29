-- Repair/synchronise the stable Viaform skill library from the already-verified FIG catalogue.
-- Safe to run after 20260930010000_canonical_skill_library; existing canonical keys are left unchanged.
INSERT OR IGNORE INTO "ViaformSkill"
  ("id","discipline","apparatus","name","aliases","provenance","figElementDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT
  'fig_element_' || "id",'WAG',"apparatus","name","aliases",'FIG',"id",
  'FIG:ELEMENT:' || "apparatus" || ':' || "officialNumber" || ':' || "variantKey",
  "status",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM "FigElementDefinition";

INSERT OR IGNORE INTO "ViaformSkill"
  ("id","discipline","apparatus","name","aliases","provenance","figVaultDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT
  'fig_vault_' || "id",'WAG','VAULT',"name","aliases",'FIG',"id",
  'FIG:VAULT:' || "officialNumber" || ':' || "variantKey",
  "status",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM "FigVaultDefinition";
