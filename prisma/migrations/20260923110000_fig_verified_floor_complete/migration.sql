-- Verified against the current FIG WAG 2025–2028 Code of Points revision dated 27 August 2026.
-- Floor Exercise element tables: pages 149–169. Empty table cells are intentionally omitted.

WITH "verifiedElements" ("id","officialNumber","variantKey","name","aliases","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_fx_1_101a','1.101','a','Split leap fwd (leg separation 180°)','[]','A',149,'{"dance":true}'),
    ('fig25_fx_1_201a','1.201','a','Split leap with ½ turn (180°)','[]','B',149,'{"dance":true}'),
    ('fig25_fx_1_301a','1.301','a','Split leap with 1/1 turn (360°)','[]','C',149,'{"dance":true}'),
    ('fig25_fx_1_202a','1.202','a','Fouetté hop with leg change to cross split (leg separation 180°), also to ring position (tour jeté)','[]','B',150,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_302a','1.302','a','Tour jeté with additional ½ turn (180°), landing on one or both feet, or in split sit position (Produnova)','[]','C',150,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_302b','1.302','b','Leap fwd, through tour jeté technique, with ¾ turn (270°) into straddle pike position with additional ¼ turn (90°), landing on one or both feet (Csillag)','[]','C',150,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_402a','1.402','a','Tour jeté with additional 1/1 turn (360°), landing on one or both feet (Gogean)','[]','D',150,'{"dance":true}'),
    ('fig25_fx_1_103a','1.103','a','Tuck jump with separation of legs to cross split (180°) during flight phase','[]','A',151,'{"dance":true}'),
    ('fig25_fx_1_203a','1.203','a','Butterfly fwd torso parallel to floor, slightly arched, legs straddled and feet above hip height during flight','[]','B',151,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_203b','1.203','b','Butterfly bwd torso parallel to floor, slightly arched, legs straddled and feet at or slightly below hip height during flight, also landing in front lying support','[]','B',151,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_104a','1.104','a','Leap fwd with ¼ turn (90°) into straddle pike position (both legs above horizontal) or side split to land on one or both feet','[]','A',152,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_105a','1.105','a','Stride leap fwd with change of legs to wolf position','[]','A',152,'{"dance":true}'),
    ('fig25_fx_1_204a','1.204','a','Switch leap with ¼ turn (90°) to side split or to straddle pike position (both legs above horizontal) (Johnson)','[]','B',152,'{"dance":true}'),
    ('fig25_fx_1_205a','1.205','a','Leap fwd with leg change (free leg swing to 45°) to cross split (180° separation after leg change) (Switch leap)','[]','B',152,'{"dance":true}'),
    ('fig25_fx_1_304a','1.304','a','Switch leap with ½ turn (180°) in flight phase (Frolova)','[]','C',152,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_304b','1.304','b','Johnson with additional ½ turn (180°)','[]','C',152,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_305a','1.305','a','Switch leap to ring position (180° separation of legs)','[]','C',152,'{"dance":true}'),
    ('fig25_fx_1_404a','1.404','a','Switch leap with 1/1 turn (360°) in flight phase','[]','D',152,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_404b','1.404','b','Johnson with additional 1/1 turn (360°) (Bulimar)','[]','D',152,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_405a','1.405','a','Switch leap to ring position with ½ turn (180°) (Sankova)','[]','D',152,'{"dance":true}'),
    ('fig25_fx_1_106a','1.106','a','Pike jump (legs above horizontal)','[]','A',153,'{"dance":true}'),
    ('fig25_fx_1_107a','1.107','a','Straddle pike jump (both legs above horizontal), or side split jump (180° separation of legs)','[]','A',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_206a','1.206','a','Jump with upper back arch and head release with feet almost touching head (Sheep jump)','[]','B',153,'{"dance":true}'),
    ('fig25_fx_1_207a','1.207','a','Straddle pike or side split jump with ½ turn (180°)','[]','B',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_207b','1.207','b','Split Jump with ½ turn (180°)','[]','B',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_306a','1.306','a','Pike jump (legs above horizontal) with 1/1 turn (360°), also landing in front lying support (Moerz)','[]','C',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_307a','1.307','a','Straddle pike or side split jump with 1/1 turn (360°) (Popa)','[]','C',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_307b','1.307','b','Split Jump with 1/1 turn (360°)','[]','C',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_407a','1.407','a','Straddle pike or side split jump with 1½ turn (540°)','[]','D',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_407b','1.407','b','Split Jump with 1½ turn (540°)','[]','D',153,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_108a','1.108','a','Straddle pike (both legs above horizontal), or side split jump landing in front lying support, also with ½ turn (180°)','[]','A',154,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_108b','1.108','b','Hop with 1/1 turn (360°) to straddle and land in front lying support','[]','A',154,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_208a','1.208','a','Straddle pike (both legs above horizontal), or side split jump with 1/1 turn (360°) landing in front lying support','[]','B',154,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_208b','1.208','b','Hop with 1½ turn (540°) in horizontal plane to land in front lying support','[]','B',154,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_109a','1.109','a','Split jump (180° separation of legs), back leg straight or bent)','[]','A',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_109b','1.109','b','Stag jump (180° separation of legs), back leg straight or bent)','[]','A',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_109c','1.109','c','Stag jump with ½ turn (180°)','[]','A',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_109d','1.109','d','Sissone (180° separation of legs) on the diagonal/45°to the floor) take off two feet, to land on one foot','[]','A',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_209a','1.209','a','Sissone to ring position (rear foot at head height, body arched and head dropped bwd, 180° separation of legs), to land on one foot','[]','B',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_209b','1.209','b','Stag ring jump (rear foot at head height, body arched and head dropped bwd,), to land on both feet','[]','B',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_209c','1.209','c','Split jump to ring position (180° separation of legs) to land on both feet','[]','B',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_209d','1.209','d','Split jump to ring position with ½ turn (180°) to land on both feet','[]','B',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_309a','1.309','a','Split leap to ring position (ring leap) (180° separation of legs)','[]','C',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_309b','1.309','b','Split jump to ring position with 1/1 turn (360°) (Jurkowska-Kowalska)','[]','C',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_409a','1.409','a','Tour jeté, to ring position with additional ½ turn (180°) (Ferrari)','[]','D',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_409b','1.409','b','Split leap to ring position with ½ turn (180°) (Ting)','[]','D',155,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_509a','1.509','a','Split leap to ring position with 1/1 turn (360°) (Prat)','[]','E',155,'{"dance":true}'),
    ('fig25_fx_1_110a','1.110','a','Stretched hop or jump with 1/1 turn (360°)','[]','A',156,'{"dance":true}'),
    ('fig25_fx_1_111a','1.111','a','Leap with alternate leg change (knees above horizontal) (Cat leap)','[]','A',156,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_111b','1.111','b','Scissors leap fwd (legs above horizontal)','[]','A',156,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_211a','1.211','a','Cat leap with 1/1 turn (360°)','[]','B',156,'{"dance":true}'),
    ('fig25_fx_1_310a','1.310','a','Stretched hop or jump with 2/1 turn (720°)','[]','C',156,'{"dance":true}'),
    ('fig25_fx_1_311a','1.311','a','Cat leap with 2/1 turn (720°)','[]','C',156,'{"dance":true}'),
    ('fig25_fx_1_112a','1.112','a','Hop with ½ turn (180°) to land in arabesque with free leg above horizontal (Fouetté hop)','[]','A',157,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_112b','1.112','b','Hop with ½ turn (180°) free leg extended fwd at horizontal throughout','[]','A',157,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_213a','1.213','a','Tuck hop or jump with 1/1 turn (360°)','[]','B',157,'{"dance":true}'),
    ('fig25_fx_1_212a','1.212','a','Hop with 1/1 turn (360°), free leg extended fwd at horizontal throughout','[]','B',157,'{"dance":true}'),
    ('fig25_fx_1_313a','1.313','a','Tuck hop or jump with 2/1 turn (720°) also landing in front lying support','[]','C',157,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_114a','1.114','a','Hop or Jump with one leg bent and the other - extended straight, fwd above horizontal with knees together (Wolf hop or jump)','[]','A',158,'{"dance":true}'),
    ('fig25_fx_1_214a','1.214','a','Wolf hop or jump with 1/1 turn (360°), also landing in front lying support','[]','B',158,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_1_514a','1.514','a','Wolf hop or jump with 2/1 turn (720°)','[]','E',158,'{"dance":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','FLOOR',"officialNumber","variantKey","name","aliases","difficulty",'1','Gymnastic leaps, jumps and hops',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='FLOOR'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","aliases","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_fx_2_101a','2.101','a','1/1 turn (360°) on one leg - free leg optional below horizontal','[]','A',159,'{"dance":true}'),
    ('fig25_fx_2_201a','2.201','a','2/1 turn (720°) on one leg - free leg optional below horizontal','[]','B',159,'{"dance":true}'),
    ('fig25_fx_2_202a','2.202','a','1/1 turn (360°) with heel of extended free leg fwd at horizontal throughout turn (support leg may be straight or bent)','[]','B',159,'{"dance":true}'),
    ('fig25_fx_2_301a','2.301','a','3/1 turn (1080°) on one leg - free leg optional below horizontal','[]','C',159,'{"dance":true}'),
    ('fig25_fx_2_402a','2.402','a','2/1 turn (720°) with heel of extended free leg fwd at horizontal throughout turn (support leg may be straight or bent)','[]','D',159,'{"dance":true}'),
    ('fig25_fx_2_501a','2.501','a','4/1 turn (1440°) on one leg - free leg optional below horizontal (Gomez)','[]','E',159,'{"dance":true}'),
    ('fig25_fx_2_203a','2.203','a','1/1 turn (360°) with free leg held upward in 180° split position throughout turn','[]','B',160,'{"dance":true}'),
    ('fig25_fx_2_204a','2.204','a','1/1 turn (360°) in back attitude (thigh of free leg at horizontal throughout turn)','[]','B',160,'{"dance":true}'),
    ('fig25_fx_2_205a','2.205','a','1/1 turn (360°) in scale fwd with free leg above horizontal throughout turn','[]','B',160,'{"dance":true}'),
    ('fig25_fx_2_403a','2.403','a','2/1 turn (720°) with free leg held upward in 180° split position throughout turn (Memmel)','[]','D',160,'{"dance":true}'),
    ('fig25_fx_2_404a','2.404','a','2/1 turn (720°) in back attitude (thigh of free leg at horizontal throughout turn) (Semenova)','[]','D',160,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_2_404b','2.404','b','2/1 turn (720°) with free leg held with both hands bwd/upward throughout turn (Berar)','[]','D',160,'{"dance":true,"sameBoxChronologicalOnly":true}'),
    ('fig25_fx_2_503a','2.503','a','3/1 turn (1080°) with free leg held upward in 180° split position throughout turn (Mustafina)','[]','E',160,'{"dance":true}'),
    ('fig25_fx_2_206a','2.206','a','1/1 illusion turn (360°) through standing split without touching floor with hand','[]','B',161,'{"dance":true}'),
    ('fig25_fx_2_207a','2.207','a','1/1 turn (360°) in tuck stand on one leg - free leg straight throughout turn','[]','B',161,'{"dance":true}'),
    ('fig25_fx_2_208a','2.208','a','2/1 turn (720°) or more on back in kip position (hip-leg angle closed)','[]','B',161,'{"dance":true}'),
    ('fig25_fx_2_307a','2.307','a','2/1 turn (720°) starting with free leg at horizontal, lowering to complete the turn in wolf position (Nguyen)','[]','C',161,'{"dance":true}'),
    ('fig25_fx_2_407a','2.407','a','2/1 turn (720°) in tuck stand on one leg - free leg straight throughout turn (no turn initiation with a push from hands on floor)','[]','D',161,'{"dance":true}'),
    ('fig25_fx_2_507a','2.507','a','3/1 turn (1080°) in tuck stand on one leg - free leg straight throughout turn (no turn initiation with a push from hands on floor) (Mitchell)','[]','E',161,'{"dance":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','FLOOR',"officialNumber","variantKey","name","aliases","difficulty",'2','Gymnastic turns',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='FLOOR'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","aliases","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_fx_3_101a','3.101','a','Jump kick or press to hstd - return movement optional, also with ½ or 1/1 turn (180° or 360°) in hstd','[]','A',162,'{"acro":true}'),
    ('fig25_fx_3_201a','3.201','a','Jump kick or press to hstd with 1½ or 2/1 turn (540° or 720°) in hstd - return movement optional','[]','B',162,'{"acro":true}'),
    ('fig25_fx_3_102a','3.102','a','Hecht roll','[]','A',163,'{"acro":true}'),
    ('fig25_fx_3_103a','3.103','a','Roll bwd to hstd with ½ or 1/1 turn (180° or 360°) in hstd','[]','A',163,'{"acro":true}'),
    ('fig25_fx_3_104a','3.104','a','Walkover bwd from stand or extended tuck-sit to hstd with 1/1 turn (360°) in hstd - return movement optional','[]','A',163,'{"acro":true}'),
    ('fig25_fx_3_203a','3.203','a','Roll bwd to hstd with 1½ or 2/1 turn (540° or 720°) in hstd','[]','B',163,'{"acro":true}'),
    ('fig25_fx_3_105a','3.105','a','Handspring fwd, take-off from one leg or Flyspring fwd, take-off from both legs - with or without hecht phase before hand support - landing optional','[]','A',164,'{"acro":true}'),
    ('fig25_fx_3_105b','3.105','b','Jump bwd with ½ twist (180°) to handspring fwd - landing optional','[]','A',164,'{"acro":true}'),
    ('fig25_fx_3_106a','3.106','a','Round-off','[]','A',164,'{"acro":true}'),
    ('fig25_fx_3_305a','3.305','a','Handspring fwd with 1/1 twist (360°) after hand support or before (Mostepanova)','[]','C',164,'{"acro":true}'),
    ('fig25_fx_3_107a','3.107','a','All flic-flac and gainer flic-flac variations, also with support of one arm','[]','A',165,'{"acro":true}'),
    ('fig25_fx_3_107b','3.107','b','Arabian (bwd take-off) with ¼ twist (90°) - free (aerial) cartwheel - continuing with ¼ twist (90°) to front lying support (Tsavdaridou)','[]','A',165,'{"acro":true}'),
    ('fig25_fx_3_207a','3.207','a','Flic-flac with 1/1 twist (360°) before hand support','[]','B',165,'{"acro":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','FLOOR',"officialNumber","variantKey","name","aliases","difficulty",'3','Hand support elements',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='FLOOR'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","aliases","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_fx_4_101a','4.101','a','Salto fwd tucked or piked','[]','A',166,'{"acro":true}'),
    ('fig25_fx_4_201a','4.201','a','Salto fwd tucked with ½ or 1/1 twist (180° or 360°), also Salto fwd piked with ½ twist (180°)','[]','B',166,'{"acro":true}'),
    ('fig25_fx_4_202a','4.202','a','Salto fwd stretched, also with ½ twist (180°)','[]','B',166,'{"acro":true}'),
    ('fig25_fx_4_302a','4.302','a','Salto fwd stretched with 1/1 or 1½ twist (360° or 540°)','[]','C',166,'{"acro":true}'),
    ('fig25_fx_4_402a','4.402','a','Salto fwd stretched with 2/1 twist (720°) (Tarasevich)','[]','D',166,'{"acro":true}'),
    ('fig25_fx_4_501a','4.501','a','Double salto fwd tucked (Podkopayeva)','[]','E',166,'{"acro":true}'),
    ('fig25_fx_4_502a','4.502','a','Salto fwd stretched with 2½ twist (900°) (Cojocar)','[]','E',166,'{"acro":true}'),
    ('fig25_fx_4_601a','4.601','a','Double salto fwd tucked with ½ twist (180°) (Podkopayeva)','[]','F',166,'{"acro":true}'),
    ('fig25_fx_4_601b','4.601','b','Double salto fwd piked (Dowell)','[]','F',166,'{"acro":true}'),
    ('fig25_fx_4_602a','4.602','a','Salto fwd stretched with 3/1 twist (1080°) (Maldonado)','[]','F',166,'{"acro":true}'),
    ('fig25_fx_4_103a','4.103','a','Free (aerial) walkover fwd','[]','A',167,'{"acro":true}'),
    ('fig25_fx_4_104a','4.104','a','Free (aerial) cartwheel or free (aerial) round-off','[]','A',167,'{"acro":true}'),
    ('fig25_fx_4_105a','4.105','a','From take-off fwd from one or both legs - salto swd tucked or piked','[]','A',167,'{"acro":true}'),
    ('fig25_fx_4_205a','4.205','a','Arabian salto tucked or piked, (take-off bwd with ½ twist [180°], salto fwd) - landing optional','[]','B',167,'{"acro":true}'),
    ('fig25_fx_4_505a','4.505','a','Arabian double salto tucked (Andreasen/Jentsch)','[]','E',167,'{"acro":true}'),
    ('fig25_fx_4_605a','4.605','a','Arabian double salto piked (Dos Santos)','[]','F',167,'{"acro":true}'),
    ('fig25_fx_4_805a','4.805','a','Arabian double salto stretched (Dos Santos)','[]','H',167,'{"acro":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','FLOOR',"officialNumber","variantKey","name","aliases","difficulty",'4','Saltos forward & sideward',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='FLOOR'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","aliases","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_fx_5_101a','5.101','a','Salto bwd tucked, piked, or stretched','[]','A',168,'{"acro":true}'),
    ('fig25_fx_5_201a','5.201','a','Salto bwd stretched with ½, or salto bwd tucked or stretched with 1/1 twist (180° or 360°)','[]','B',168,'{"acro":true}'),
    ('fig25_fx_5_301a','5.301','a','Salto bwd stretched with 1½ or 2/1 twist (540° or 720°)','[]','C',168,'{"acro":true}'),
    ('fig25_fx_5_401a','5.401','a','Salto bwd stretched with 2½ twist (900°)','[]','D',168,'{"acro":true}'),
    ('fig25_fx_5_402a','5.402','a','Double salto bwd tucked (Kim)','[]','D',168,'{"acro":true}'),
    ('fig25_fx_5_402b','5.402','b','Double salto bwd piked','[]','D',168,'{"acro":true}'),
    ('fig25_fx_5_501a','5.501','a','Salto bwd stretched with 3/1 twist (1080°)','[]','E',168,'{"acro":true}'),
    ('fig25_fx_5_502a','5.502','a','Double salto bwd tucked or piked with 1/1 twist (360°) (any technique) (Mukhina) (Oliveira)','[]','E',168,'{"acro":true}'),
    ('fig25_fx_5_601a','5.601','a','Salto bwd stretched with 3½ twist (1260°)','[]','F',168,'{"acro":true}'),
    ('fig25_fx_5_602a','5.602','a','Double salto bwd tucked with 1½ twist (540°) (Heron)','[]','F',168,'{"acro":true}'),
    ('fig25_fx_5_802a','5.802','a','Double salto bwd tucked with 2/1 twist (720°)  (Silivas)','[]','H',168,'{"acro":true}'),
    ('fig25_fx_5_1002a','5.1002','a','Double salto bwd tucked with 3/1 twist (1080°)  (Biles)','[]','J',168,'{"acro":true}'),
    ('fig25_fx_5_104a','5.104','a','Whip salto bwd','[]','A',169,'{"acro":true}'),
    ('fig25_fx_5_204a','5.204','a','Whip salto bwd with ½ twist (180°)','[]','B',169,'{"acro":true}'),
    ('fig25_fx_5_304a','5.304','a','Whip salto bwd with 1/1 twist (360°)','[]','C',169,'{"acro":true}'),
    ('fig25_fx_5_603a','5.603','a','Double salto bwd stretched','[]','F',169,'{"acro":true}'),
    ('fig25_fx_5_703a','5.703','a','Double salto bwd stretched with ½ twist (180°) (Biles)','[]','G',169,'{"acro":true}'),
    ('fig25_fx_5_803a','5.803','a','Double salto bwd stretched with 1/1 twist (360°) (Chusovitina/Touzhikova)','[]','H',169,'{"acro":true}'),
    ('fig25_fx_5_903a','5.903','a','Double Salto bwd stretched with 2/1 twist (720°) (Moors)','[]','I',169,'{"acro":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','FLOOR',"officialNumber","variantKey","name","aliases","difficulty",'5','Saltos backward',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='FLOOR'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

