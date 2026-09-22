WITH "verifiedMounts" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_1_101a','1.101','a','Glide kip to support on LB','A',72),
    ('fig25_ub_1_101b','1.101','b','Glide with 1/2 turn (180°) kip to support on LB','A',72),
    ('fig25_ub_1_102a','1.102','a','Jump with 1/2 turn (180°) kip to support on LB','A',72),
    ('fig25_ub_1_102b','1.102','b','Jump with 1/2 turn (180°) stoop through to rear support on LB (back kip)','A',72),
    ('fig25_ub_1_202a','1.202','a','Jump with 1/1 turn (360°) and glide kip to support on LB','B',72),
    ('fig25_ub_1_103a','1.103','a','Glide on LB (or swing fwd on HB) and stoop through to rear support (back kip)','A',73),
    ('fig25_ub_1_103b','1.103','b','Straddle cut bwd to hang on same bar','A',73),
    ('fig25_ub_1_203a','1.203','a','Reverse kip from glide fwd on LB - stoop through to kip hang, back kip swing, seat (pike) circle bwd to rear support','B',73),
    ('fig25_ub_1_203b','1.203','b','Reverse kip from swing fwd on HB - stoop through to kip hang, back kip swing, seat (pike) circle bwd to rear support','B',73),
    ('fig25_ub_1_104a','1.104','a','Jump to hang on HB - kip to support','A',73),
    ('fig25_ub_1_104b','1.104','b','Jump to hang on HB with reverse grip - kip to support','A',73),
    ('fig25_ub_1_204a','1.204','a','Facing HB - jump with 1/2 turn (180°) - kip to support on HB','B',73),
    ('fig25_ub_1_204b','1.204','b','Free jump with 1/2 turn (180°) over LB to hang on HB','B',73),
    ('fig25_ub_1_304a','1.304','a','Jump with 1/2 turn (180°) over LB - kip to support on HB','C',73),
    ('fig25_ub_1_304b','1.304','b','Free jump with 1/2 turn (180°) over LB to hang on HB','C',73),
    ('fig25_ub_1_105a','1.105','a','Facing HB - jump with 1/1 turn (360°) to hang on HB','A',74),
    ('fig25_ub_1_106a','1.106','a','Straddle vault with hand repulsion over LB to catch HB','A',74),
    ('fig25_ub_1_206a','1.206','a','Free straddle jump over LB to hang on HB','B',74),
    ('fig25_ub_1_206b','1.206','b','Hecht jump (legs together) with hand repulsion over LB to hang on HB','B',74),
    ('fig25_ub_1_306a','1.306','a','Free stretch jump over LB with legs together to hang on HB (Makhautsova)','C',74),
    ('fig25_ub_1_406a','1.406','a','Hecht jump (legs together) with hand repulsion and 1/1 turn (360°) over LB to hang on HB (Gebeshian)','D',74),
    ('fig25_ub_1_406b','1.406','b','Free stretch jump (legs together) with 1/1 turn (360°) over LB to hang on HB (Petrova)','D',74),
    ('fig25_ub_1_207a','1.207','a','Salto fwd tucked over LB into L hang on LB','B',75),
    ('fig25_ub_1_207b','1.207','b','Salto fwd piked over LB into L hang on LB','B',75),
    ('fig25_ub_1_207c','1.207','c','Salto fwd straddled over LB into L hang on LB','B',75),
    ('fig25_ub_1_307a','1.307','a','Facing HB - salto fwd to hang on HB','C',75),
    ('fig25_ub_1_307b','1.307','b','Roll fwd piked with hand repulsion over LB with flight to hang on HB','C',75),
    ('fig25_ub_1_407a','1.407','a','Salto fwd tucked over LB to hang on HB without touching LB','D',75),
    ('fig25_ub_1_208a','1.208','a','Round-off in front of LB - flight bwd (straddled) through clear straddle support on LB','B',75),
    ('fig25_ub_1_308a','1.308','a','Round-off in front of LB - flight bwd over LB with legs together to hang on HB','C',75),
    ('fig25_ub_1_308b','1.308','b','Round-off in front of LB - flight bwd over LB straddled to hang on HB','C',75),
    ('fig25_ub_1_408a','1.408','a','Round-off in front of LB - flight bwd over LB with 1/1 turn (360°) to hang on HB','D',75),
    ('fig25_ub_1_409a','1.409','a','Round-off in front of LB - tucked salto bwd over LB to hang on LB (Jentsch)','D',76),
    ('fig25_ub_1_409b','1.409','b','Round-off in front of LB, flic-flac through hstd phase on LB (González)','D',76),
    ('fig25_ub_1_509a','1.509','a','Round-off in front of LB, flic-flac with 1/1 turn (360°) to clear support or through hstd phase on LB (Gurova)','E',76),
    ('fig25_ub_1_609a','1.609','a','Round-off in front of LB - tucked arabian salto over LB to hang on HB without touching the LB','F',76),
    ('fig25_ub_1_709a','1.709','a','Round-off in front of LB - piked arabian salto over LB to hang on HB without touching the LB','G',76),
    ('fig25_ub_1_210a','1.210','a','Jump to hstd on LB with hips bent, then extended, legs together','B',77),
    ('fig25_ub_1_210b','1.210','b','Jump to hstd on LB with hips bent, then extended, legs straddled','B',77),
    ('fig25_ub_1_210c','1.210','c','Jump to hstd on LB with hips bent, then extended, with 1/2 turn (180°) in hstd phase, legs together','B',77),
    ('fig25_ub_1_210d','1.210','d','Jump to hstd on LB with hips bent, then extended, with 1/2 turn (180°) in hstd phase, legs straddled','B',77),
    ('fig25_ub_1_310a','1.310','a','Jump to hstd on LB with hips bent, then extended and 1/1 turn (360°) in hstd phase, legs together','C',77),
    ('fig25_ub_1_310b','1.310','b','Jump to hstd on LB with hips bent, then extended and 1/1 turn (360°) in hstd phase, legs straddled','C',77),
    ('fig25_ub_1_310c','1.310','c','Jump with extended body to hstd on LB','C',77),
    ('fig25_ub_1_310d','1.310','d','Jump with extended body to hstd on LB with 1/2 turn (180°)','C',77),
    ('fig25_ub_1_410a','1.410','a','Jump with extended body to hstd on LB with 1/1 turn (360°) in hstd phase (Maaranen)','D',77),
    ('fig25_ub_1_411a','1.411','a','Jump to clear support on HB - clear hip circle to hstd on HB (McNamara)','D',77),
    ('fig25_ub_1_411b','1.411','b','Jump to clear support on HB - clear hip circle to hstd with 1/2 turn (180°) in hstd phase on HB (McNamara)','D',77)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'1','Mounts',"sourcePage",'{"mount":true}','VERIFIED','ACTIVE'
FROM "verifiedMounts"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedMounts"."officialNumber"
      AND existing."variantKey"="verifiedMounts"."variantKey"
  );
