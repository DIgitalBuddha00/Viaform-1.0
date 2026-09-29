-- Coach-facing skill identity audit, verified segment 1.
-- FIG wording remains in FigElementDefinition.name. ViaformSkill.name is the coach-facing display name.
-- Shared FIG boxes are split into stable Viaform variants where the performed movement is materially distinct.

-- Existing display names: Bars.
UPDATE "ViaformSkill" SET "name"='Straddle/Pike Cast to Handstand' WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.101:a';
UPDATE "ViaformSkill" SET "name"='Cast to Handstand' WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.201:a';
UPDATE "ViaformSkill" SET "name"='Clear Hip to Handstand' WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.305:a';
UPDATE "ViaformSkill" SET "name"='Back Giant' WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:a';
UPDATE "ViaformSkill" SET "name"='Back Giant 1/2 Turn' WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.201:b';
UPDATE "ViaformSkill" SET "name"='Front Giant' WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.206:a';
UPDATE "ViaformSkill" SET "name"='Stalder to Handstand' WHERE "canonicalKey"='FIG:ELEMENT:BARS:4.304:a';
UPDATE "ViaformSkill" SET "name"='Toe-on to Handstand' WHERE "canonicalKey"='FIG:ELEMENT:BARS:5.308:a';
UPDATE "ViaformSkill" SET "name"='Van Leeuwen' WHERE "canonicalKey"='FIG:ELEMENT:BARS:5.509:a';
UPDATE "ViaformSkill" SET "name"='Seitz' WHERE "canonicalKey"='FIG:ELEMENT:BARS:5.509:b';

-- Helper pattern repeated below: create a package-specific FIG variant, then its stable Viaform identity.
INSERT OR IGNORE INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
VALUES
('fig25_ub_2_101_b','canonical_fig_wag_2025_2028','BARS','2.101','b','Cast to hstd with legs straddled or hips bent; with hop-grip change','["cast hop","cast hop grip change","straddle cast hop"]','A','Casts & clear hips','Casts & clear hips',78,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_2_201_b','canonical_fig_wag_2025_2028','BARS','2.201','b','Cast to hstd with legs together and hips extended; with hop-grip change','["cast handstand hop","cast hop grip change","straight cast hop"]','B','Casts & clear hips','Casts & clear hips',78,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_2_201_c','canonical_fig_wag_2025_2028','BARS','2.201','c','Cast with 1/2 turn (180°), legs together or straddled, to hstd','["cast half","cast half turn","cast 1/2 turn"]','B','Casts & clear hips','Casts & clear hips',78,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_2_305_b','canonical_fig_wag_2025_2028','BARS','2.305','b','Clear hip circle to hstd with hop-grip change in hstd phase','["clear hip hop","clear hip hop grip change"]','C','Casts & clear hips','Casts & clear hips',80,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_2_305_c','canonical_fig_wag_2025_2028','BARS','2.305','c','Clear hip circle with 1/2 turn (180°) to hstd','["clear hip half","clear hip half turn"]','C','Casts & clear hips','Casts & clear hips',80,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_3_401_b','canonical_fig_wag_2025_2028','BARS','3.401','b','Giant circle bwd with 2/1 turn (720°) to hstd','["giant double","back giant double","giant 2/1"]','D','Giant circles','Giant circles',83,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_3_401_c','canonical_fig_wag_2025_2028','BARS','3.401','c','Giant circle bwd with hop 1/1 turn (360°) to hstd (Chusovitina)','["chusovitina","giant hop full","back giant hop full"]','D','Giant circles','Giant circles',83,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_3_206_b','canonical_fig_wag_2025_2028','BARS','3.206','b','Giant circle fwd with 1/2 turn (180°) to hstd','["front giant half","forward giant half"]','B','Giant circles','Giant circles',87,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_4_304_b','canonical_fig_wag_2025_2028','BARS','4.304','b','Stalder bwd to hstd with hop-grip change in hstd phase','["stalder hop","stalder hop grip change"]','C','Stalder circles','Stalder circles',91,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_4_304_c','canonical_fig_wag_2025_2028','BARS','4.304','c','Stalder bwd with 1/2 turn (180°) to hstd','["stalder half","stalder half turn"]','C','Stalder circles','Stalder circles',91,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_5_308_b','canonical_fig_wag_2025_2028','BARS','5.308','b','Pike sole circle bwd to hstd with hop-grip change to reverse grip','["toe-on hop","toe handstand hop","toe-on hop grip change"]','C','Pike circles','Pike circles',98,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_5_308_c','canonical_fig_wag_2025_2028','BARS','5.308','c','Pike sole circle bwd with 1/2 turn (180°) to hstd','["toe half","toe-on half","toe handstand half"]','C','Pike circles','Pike circles',98,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE'),
('fig25_ub_6_104_b','canonical_fig_wag_2025_2028','BARS','6.104','b','Flyaway salto backward piked','["flyaway pike","piked flyaway"]','A','Dismounts','Dismounts',102,'{"viaformVariantReason":"shared FIG box; distinct body shape"}','VERIFIED','ACTIVE'),
('fig25_ub_6_104_c','canonical_fig_wag_2025_2028','BARS','6.104','c','Flyaway salto backward stretched','["flyaway layout","layout flyaway","stretched flyaway"]','A','Dismounts','Dismounts',102,'{"viaformVariantReason":"shared FIG box; distinct body shape"}','VERIFIED','ACTIVE'),
('fig25_ub_6_405_b','canonical_fig_wag_2025_2028','BARS','6.405','b','Double salto backward piked with 1/1 turn (360°)','["full-in double pike","full twisting double pike"]','D','Dismounts','Dismounts',103,'{"viaformVariantReason":"shared FIG box; distinct body shape"}','VERIFIED','ACTIVE');

INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","figElementDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT 'fig_element_'||"id",'WAG','BARS',
CASE "id"
 WHEN 'fig25_ub_2_101_b' THEN 'Cast to Handstand — Hop Grip Change'
 WHEN 'fig25_ub_2_201_b' THEN 'Cast to Handstand — Hop Grip Change'
 WHEN 'fig25_ub_2_201_c' THEN 'Cast 1/2 Turn to Handstand'
 WHEN 'fig25_ub_2_305_b' THEN 'Clear Hip to Handstand — Hop Grip Change'
 WHEN 'fig25_ub_2_305_c' THEN 'Clear Hip 1/2 Turn to Handstand'
 WHEN 'fig25_ub_3_401_b' THEN 'Back Giant 2/1 Turn'
 WHEN 'fig25_ub_3_401_c' THEN 'Back Giant Hop Full (Chusovitina)'
 WHEN 'fig25_ub_3_206_b' THEN 'Front Giant 1/2 Turn'
 WHEN 'fig25_ub_4_304_b' THEN 'Stalder to Handstand — Hop Grip Change'
 WHEN 'fig25_ub_4_304_c' THEN 'Stalder 1/2 Turn to Handstand'
 WHEN 'fig25_ub_5_308_b' THEN 'Toe-on to Handstand — Hop Grip Change'
 WHEN 'fig25_ub_5_308_c' THEN 'Toe-on 1/2 Turn to Handstand'
 WHEN 'fig25_ub_6_104_b' THEN 'Flyaway Pike'
 WHEN 'fig25_ub_6_104_c' THEN 'Flyaway Layout'
 WHEN 'fig25_ub_6_405_b' THEN 'Full-in Double Pike'
 ELSE "name" END,
"aliases",'FIG',"id",'FIG:ELEMENT:BARS:'||"officialNumber"||':'||"variantKey",'ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
FROM "FigElementDefinition" WHERE "id" IN ('fig25_ub_2_101_b','fig25_ub_2_201_b','fig25_ub_2_201_c','fig25_ub_2_305_b','fig25_ub_2_305_c','fig25_ub_3_401_b','fig25_ub_3_401_c','fig25_ub_3_206_b','fig25_ub_4_304_b','fig25_ub_4_304_c','fig25_ub_5_308_b','fig25_ub_5_308_c','fig25_ub_6_104_b','fig25_ub_6_104_c','fig25_ub_6_405_b');

UPDATE "ViaformSkill" SET "name"='Back Giant 1 1/2 Turn',"aliases"='["giant 1.5","back giant 1.5"]' WHERE "canonicalKey"='FIG:ELEMENT:BARS:3.401:a';
UPDATE "ViaformSkill" SET "name"='Flyaway Tuck',"aliases"='["flyaway","flyaway tuck","tucked flyaway"]' WHERE "canonicalKey"='FIG:ELEMENT:BARS:6.104:a';
UPDATE "ViaformSkill" SET "name"='Full-in Double Tuck',"aliases"='["full-in","full twisting double back","morio","chusovitina"]' WHERE "canonicalKey"='FIG:ELEMENT:BARS:6.405:a';

-- Floor 3.105: three distinct coaching skills sharing one FIG box.
UPDATE "ViaformSkill" SET "name"='Front Handspring',"aliases"='["front handspring","front hand spring","fhs","handspring forward","forward handspring","step-out front handspring"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.105:a';
UPDATE "ViaformSkill" SET "name"='Back 1/2 to Front Handspring',"aliases"='["back half to front handspring","jump back half front handspring"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.105:b';
UPDATE "ViaformSkill" SET "name"='Flyspring',"aliases"='["flyspring","fly spring","front handspring from two feet","two-foot front handspring","two foot front handspring","bounder"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.105:c';

-- Floor 3.107: split the FIG box into coach-meaningful performed movements.
UPDATE "FigElementDefinition" SET "name"='Flic-flac / back handspring',"aliases"='["back handspring","back hand spring","bhs","flic-flac","flic flac"]' WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "officialNumber"='3.107' AND "variantKey"='a';
UPDATE "ViaformSkill" SET "name"='Back Handspring',"aliases"='["back handspring","back hand spring","bhs","flic-flac","flic flac"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:a';
UPDATE "FigElementDefinition" SET "name"='Gainer flic-flac',"aliases"='["gainer back handspring","gainer flic-flac","gainer back flick"]' WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "officialNumber"='3.107' AND "variantKey"='c';
UPDATE "ViaformSkill" SET "name"='Gainer Back Handspring',"aliases"='["gainer back handspring","gainer flic-flac","gainer back flick"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:c';
UPDATE "FigElementDefinition" SET "name"='Flic-flac with one-arm support',"aliases"='["one-arm back handspring","one arm back handspring","one-handed back handspring"]' WHERE "packageId"='canonical_fig_wag_2025_2028' AND "apparatus"='FLOOR' AND "officialNumber"='3.107' AND "variantKey"='d';
UPDATE "ViaformSkill" SET "name"='One-arm Back Handspring',"aliases"='["one-arm back handspring","one arm back handspring","one-handed back handspring"]' WHERE "canonicalKey"='FIG:ELEMENT:FLOOR:3.107:d';
INSERT OR IGNORE INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
VALUES ('fig25_fx_3_107_e','canonical_fig_wag_2025_2028','FLOOR','3.107','e','Arabian (bwd take-off) with 1/4 twist (90°) – free (aerial) cartwheel – continuing with 1/4 twist (90°) to front lying support (Tsavdaridou)','["tsavdaridou","arabian aerial cartwheel to front support"]','A','3','Hand support elements',165,'{"viaformVariantReason":"shared FIG box; distinct performed movement"}','VERIFIED','ACTIVE');
INSERT OR IGNORE INTO "ViaformSkill" ("id","discipline","apparatus","name","aliases","provenance","figElementDefinitionId","canonicalKey","status","createdAt","updatedAt")
SELECT 'fig_element_'||"id",'WAG','FLOOR','Tsavdaridou',"aliases",'FIG',"id",'FIG:ELEMENT:FLOOR:3.107:e','ACTIVE',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM "FigElementDefinition" WHERE "id"='fig25_fx_3_107_e';
