WITH "verifiedVaults" ("id","officialNumber","name","dValue") AS (
  VALUES
    ('fig25_vt_1_00','1.00','Handspring fwd',1.60),
    ('fig25_vt_1_01','1.01','Handspring fwd on - 1/2 turn (180°) off',2.00),
    ('fig25_vt_1_02','1.02','Handspring fwd on - 1/1 turn (360°) off',2.60),
    ('fig25_vt_1_03','1.03','Handspring fwd on - 1 1/2 turn (540°) off (Kim)',3.20),
    ('fig25_vt_1_04','1.04','Handspring fwd on - 2/1 turn (720°) off',3.60),
    ('fig25_vt_1_05','1.05','Handspring fwd on - 2 1/2 turn (900°) off',4.00),
    ('fig25_vt_1_10','1.10','Yamashita',2.00),
    ('fig25_vt_1_11','1.11','Yamashita with 1/2 turn (180°) off',2.40),
    ('fig25_vt_1_12','1.12','Yamashita with 1/1 turn (360°) off',2.80),
    ('fig25_vt_1_20','1.20','Handspring fwd with 1/2 turn (180°) on - repulsion off',1.60),
    ('fig25_vt_1_21','1.21','Handspring fwd with 1/2 turn (180°) on - 1/2 turn (180°) off (in either direction)',2.40),
    ('fig25_vt_1_22','1.22','Handspring fwd with 1/2 turn (180°) on - 1/1 turn (360°) off',2.60),
    ('fig25_vt_1_23','1.23','Handspring fwd with 1/2 turn (180°) on - 1 1/2 turn (540°) off',3.20),
    ('fig25_vt_1_24','1.24','Handspring fwd with 1/2 turn (180°) on - 2/1 turn (720°) off',3.60),
    ('fig25_vt_1_30','1.30','Handspring fwd with 1/1 turn (360°) on - Handspring fwd off',3.20),
    ('fig25_vt_1_31','1.31','Handspring fwd with 1/1 turn (360°) on - 1/1 turn (360°) off (Korbut)',3.60),
    ('fig25_vt_1_40','1.40','Round-off, flic-flac on - repulsion off',2.00),
    ('fig25_vt_1_50','1.50','Round-off, flic-flac with 1/2 turn (180°) on - Handspring fwd off',2.20),
    ('fig25_vt_1_51','1.51','Round-off, flic-flac with 1/2 turn (180°) on - 1/2 turn (180°) off',2.60),
    ('fig25_vt_1_52','1.52','Round-off, flic-flac with 1/2 turn (180°) on - 1/1 turn (360°) off',3.00),
    ('fig25_vt_1_53','1.53','Round-off, flic-flac with 1/2 turn (180°) on - 1 1/2 turn (540°) off',3.40),
    ('fig25_vt_1_60','1.60','Round-off, flic-flac with 1/1 turn (360°) on - repulsion off',2.40),
    ('fig25_vt_1_61','1.61','Round-off, flic-flac with 1/1 turn (360°) on - 1/2 turn (180°) off',2.80),
    ('fig25_vt_1_62','1.62','Round-off, flic-flac with 1/1 turn (360°) on - 1/1 turn (360°) off',3.20)
)
INSERT INTO "FigVaultDefinition" ("id","packageId","officialNumber","variantKey","groupNumber","name","aliases","dValue","secondFlightDirection","doubleSalto","status")
SELECT "id",'canonical_fig_wag_2025_2028',"officialNumber",'a',1,"name",'[]',"dValue",'NON_SALTO',0,'ACTIVE'
FROM "verifiedVaults"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigVaultDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."officialNumber"="verifiedVaults"."officialNumber"
      AND existing."variantKey"='a'
  );
