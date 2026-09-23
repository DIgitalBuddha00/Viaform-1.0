WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_1_101a','1.101','a','Leap - on landing must show arabesque position (leg min. at horizontal)','A',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_201a','1.201','a','Split leap (180°)','B',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_401a','1.401','a','Leap fwd with leg change (free leg swing to 45°) to cross split','D',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_102a','1.102','a','Thief vault - take-off from one leg - free leap over beam, one leg after another to rear support - 90° approach to beam','A',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_102b','1.102','b','Scissor leap over beam to cross sit on thigh - diagonal approach to beam','A',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_302a','1.302','a','Straight Jump with ½ turn (180°) in flight phase to stand','C',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_402a','1.402','a','Jump with 1/1 turn (360°) in flight phase to stand – approach from end or diagonal to beam','D',108,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_103a','1.103','a','Flank to rear support, also with 1/2 turn (180°)','A',108,'{"mount":true}'),
    ('fig25_bb_1_103b','1.103','b','Jump with hand support, 3/4 turn (270°) in support to cross sit on thigh','A',108,'{"mount":true}'),
    ('fig25_bb_1_303a','1.303','a','Two flying flairs','C',108,'{"mount":true}'),
    ('fig25_bb_1_403a','1.403','a','3 flying flairs (Homma)','D',108,'{"mount":true}'),
    ('fig25_bb_1_403b','1.403','b','Two flank circles followed by leg flair (Baitova)','D',108,'{"mount":true}'),
    ('fig25_bb_1_204a','1.204','a','Jump with ½ turn (180°) to clear straddle support, or jump bwd through straddle position over the beam to front support, or to side split – 90° approach to beam','B',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_304a','1.304','a','Straddle pike jump bwd over beam from round-off into immediate hip circle bwd – 90° approach to beam','C',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_105a','1.105','a','Jump with hand support to side split sit or straddle position (must show split without hands touching the beam as final position; in straddle position the trunk must touch the beam)','A',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_105b','1.105','b','Jump or leap to cross split sit with hand support - diagonal approach to beam','A',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_305a','1.305','a','Free jump to cross split sit, take-off from two feet - diagonal approach to beam','C',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_305b','1.305','b','Change leg leap to free cross split sit - diagonal approach to beam (Dick)','C',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_405a','1.405','a','Leap with leg change and ½ turn (180°) away from beam to free cross split sit – diagonal approach to beam (Dick)','D',109,'{"mount":true,"dance":true}'),
    ('fig25_bb_1_106a','1.106','a','From side stand - squat or stoop through to rear support','A',110,'{"mount":true}'),
    ('fig25_bb_1_207a','1.207','a','Jump to roll fwd at end or middle of beam to sit position or tuck stand','B',110,'{"mount":true}'),
    ('fig25_bb_1_207b','1.207','b','Jump to clear straddle support on end of beam - swing bwd to roll fwd to sit position or tuck stand','B',110,'{"mount":true}'),
    ('fig25_bb_1_108a','1.108','a','Cartwheel with bending of both arms through chest stand to swing down','A',110,'{"mount":true}'),
    ('fig25_bb_1_108b','1.108','b','Stand at side of beam and jump to chest stand with both arms bent','A',110,'{"mount":true}'),
    ('fig25_bb_1_208a','1.208','a','Jump with ½ turn (180°) over shoulder to neck stand, ½ turn (180°) to chest stand','B',110,'{"mount":true}'),
    ('fig25_bb_1_308a','1.308','a','Jump with ½ turn (180°) over shoulder to neck stand, 1/1 or 1½ turn (360° - 540˚) to neck stand','C',110,'{"mount":true}'),
    ('fig25_bb_1_309a','1.309','a','From cross stand facing end of beam - head kip','C',111,'{"mount":true}'),
    ('fig25_bb_1_309b','1.309','b','From cross stand facing end of beam - jump to hstd with hip angle (pike) to front walkover','C',111,'{"mount":true}'),
    ('fig25_bb_1_309c','1.309','c','From cross stand facing end of beam - jump to hstd with hip angle (pike) to handspring fwd with step-out or landing on two feet','C',111,'{"mount":true}'),
    ('fig25_bb_1_609a','1.609','a','Round-off at end of beam – flic-flac with ½ turn (180°) and walkover fwd (Dunn)','F',111,'{"mount":true}'),
    ('fig25_bb_1_210a','1.210','a','Jump, press, or swing to hstd (2 sec.) – lower to end position touching beam, also with ½ turn (180°) in hstd','B',112,'{"mount":true}'),
    ('fig25_bb_1_310a','1.310','a','Jump, press, or swing to cross or side hstd with 1/1 - 1½ turn (360°- 540°) – lower to end position touching beam','C',112,'{"mount":true}'),
    ('fig25_bb_1_111a','1.111','a','Planche with support on one or both bent arms (2 sec.), also legs in cross split position','A',113,'{"mount":true}'),
    ('fig25_bb_1_211a','1.211','a','Jump with bent hips to clear front support above horizontal minimum at 45° (planche) (2 sec.) - lower to optional end position','B',113,'{"mount":true}'),
    ('fig25_bb_1_311a','1.311','a','Jump with stretched hips to planche (2 sec.) (Shushunova)','C',113,'{"mount":true}'),
    ('fig25_bb_1_311b','1.311','b','Jump, press or swing to hstd - lower to planche (2 sec.), also with 1/2 turn (180°) in hstd','C',113,'{"mount":true}'),
    ('fig25_bb_1_311c','1.311','c','Jump, press or swing to hstd - lower to clear pike support with legs together (2 sec.), also with 1/2 turn (180°) in hstd','C',113,'{"mount":true}'),
    ('fig25_bb_1_311d','1.311','d','From hstd (2 sec.), release one hand with swing down swd to rear support; also with 1/2 turn (180°) in hstd (Li Yifang)','C',113,'{"mount":true}'),
    ('fig25_bb_1_411a','1.411','a','Jump, press or swing to hstd - 1/1 turn (360°) in hstd - lower to planche (2 sec.)','D',113,'{"mount":true}'),
    ('fig25_bb_1_411b','1.411','b','Jump, press or swing to hstd - 1/1 turn (360°) in hstd - lower to clear pike support with legs together (2 sec.)','D',113,'{"mount":true}'),
    ('fig25_bb_1_411c','1.411','c','Jump, press or swing to hstd - 1/1 turn (360°) in hstd - release one hand with swing down swd to rear support','D',113,'{"mount":true}'),
    ('fig25_bb_1_312a','1.312','a','Hstd in cross position with large arch span, also piked with one leg vertical and other leg bent (2 sec.) - lower to optional end position','C',114,'{"mount":true}'),
    ('fig25_bb_1_312b','1.312','b','Hstd with horizontal leg hold (2 sec.) - reverse planche in different variations - lower to optional end position','C',114,'{"mount":true}'),
    ('fig25_bb_1_412a','1.412','a','Jump or press to side hstd – walkover fwd to side stand on both legs (Phillips)','D',114,'{"mount":true}'),
    ('fig25_bb_1_213a','1.213','a','Press to side hstd, with bending - stretching of legs – hop with ¼ turn (90°) to cross hstd - lower to optional end position','B',114,'{"mount":true}'),
    ('fig25_bb_1_313a','1.313','a','Jump, press, or swing to hstd shift weight to one arm hstd (2 sec.) – lower to optional end position','C',114,'{"mount":true}'),
    ('fig25_bb_1_413a','1.413','a','Jump or press on one arm to hstd lower to optional end position, also jump, press, or swing to hstd – shift weight to side hstd on one arm (2 sec.), lowering to clear straddle support on one arm, also with ¼ turn (90°) (Rankin)','D',114,'{"mount":true}'),
    ('fig25_bb_1_114a','1.114','a','Jump to hstd with bent or straight legs – lower to optional end position','A',115,'{"mount":true}'),
    ('fig25_bb_1_214a','1.214','a','Cartwheel on one or both arms','B',115,'{"mount":true}'),
    ('fig25_bb_1_314a','1.314','a','Jump with 1/4 turn (90°) and extended hips through momentary hstd on one arm, immediate 1/4 turn (90°) and support on second arm to side hstd - lower to optional end position - 90° approach to beam','C',115,'{"mount":true}'),
    ('fig25_bb_1_314b','1.314','b','From rear stand, flic-flac over beam to candle position, ending in front support (Beukes)','C',115,'{"mount":true}'),
    ('fig25_bb_1_314c','1.314','c','From rear stand, flic-flac with 1/2 turn (180°) to candle position, ending in front support, grasping under the beam with both hands (Soares)','C',115,'{"mount":true}'),
    ('fig25_bb_1_414a','1.414','a','Round-off in front of beam – jump with ½ twist (180°) to near side hstd – lower to optional position (Gurova)','D',115,'{"mount":true}'),
    ('fig25_bb_1_514a','1.514','a','Round-off in front of beam – flic-flac with1/1 twist (360°) to hip circle bwd (Zamolodchikova)','E',115,'{"mount":true}'),
    ('fig25_bb_1_215a','1.215','a','Handspring fwd with hand repulsion from springboard to rear support, or with 1/4 turn (90°) to cross sit on thigh - 90° approach to beam','B',116,'{"mount":true}'),
    ('fig25_bb_1_215b','1.215','b','Cartwheel, grasping the beam, to front support - 90° approach to beam','B',116,'{"mount":true}'),
    ('fig25_bb_1_315a','1.315','a','Free (aerial) walkover fwd to rear support – or with ¼ turn (90°) to cross sit on thigh – 90° approach to beam','C',116,'{"mount":true}'),
    ('fig25_bb_1_615a','1.615','a','Aerial walkover fwd to cross stand – approach from end of beam, take off from both feet','F',116,'{"mount":true}'),
    ('fig25_bb_1_416a','1.416','a','Salto fwd tucked to stand – approach from end of beam','D',117,'{"mount":true}'),
    ('fig25_bb_1_516a','1.516','a','Salto fwd piked to stand – approach from end of beam','E',117,'{"mount":true}'),
    ('fig25_bb_1_616a','1.616','a','Salto fwd tucked with ½ twist (180°) (Wong Hiu Ying Angel)','F',117,'{"mount":true}'),
    ('fig25_bb_1_716a','1.716','a','Round-off at end of beam – take off bwd with ½ turn (180°) – tucked salto fwd to stand (Erceg)','G',117,'{"mount":true}'),
    ('fig25_bb_1_317a','1.317','a','Round-off at end of beam – flic-flac through hstd with swing down to cross straddle sit','C',117,'{"mount":true}'),
    ('fig25_bb_1_417a','1.417','a','Round-off at end of beam - flic-flac through hstd, support on one or both arms, to stand','D',117,'{"mount":true}'),
    ('fig25_bb_1_417b','1.417','b','Round-off at end of beam - flic-flac with 1/1 twist (360°) into swing down to cross straddle sit (Tsavdaridou)','D',117,'{"mount":true}'),
    ('fig25_bb_1_517a','1.517','a','Round-off at end of beam – flic-flac with ¾ twist (270˚) to stand','E',117,'{"mount":true}'),
    ('fig25_bb_1_518a','1.518','a','Round-off at end of beam – salto bwd tucked, piked or stretched with step-out to stand','E',118,'{"mount":true}'),
    ('fig25_bb_1_618a','1.618','a','Round-off at end of beam - salto bwd tucked with 1/1 twist (360°) to stand (Garrison)','F',118,'{"mount":true}'),
    ('fig25_bb_1_618b','1.618','b','Round-off at end of beam - salto bwd stretched to stand','F',118,'{"mount":true}'),
    ('fig25_bb_1_718a','1.718','a','Round-off at end of beam – salto bwd stretched with 1/1 twist (360°) to stand','G',118,'{"mount":true}'),
    ('fig25_bb_1_619a','1.619','a','Jump fwd with ½ twist (180°) – salto bwd piked to stand','F',119,'{"mount":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'1','Mounts',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_2_101a','2.101','a','Split leap fwd (leg separation 180°)','A',120,'{"dance":true}'),
    ('fig25_bb_2_301a','2.301','a','Split leap fwd with ½ turn (180°)','C',120,'{"dance":true}'),
    ('fig25_bb_2_202a','2.202','a','Split jump (leg separation 180°) from cross position','B',120,'{"dance":true}'),
    ('fig25_bb_2_302a','2.302','a','Split jump with ½ turn (180°) from cross position','C',120,'{"dance":true}'),
    ('fig25_bb_2_402a','2.402','a','Split jump with 1/1 turn (360°) from cross position','D',120,'{"dance":true}'),
    ('fig25_bb_2_203a','2.203','a','Straddle pike jump (both legs above horizontal), or side split jump from cross position','B',121,'{"dance":true}'),
    ('fig25_bb_2_303a','2.303','a','Straddle pike jump with ½ turn (180°) from cross position','C',121,'{"dance":true}'),
    ('fig25_bb_2_403a','2.403','a','Straddle pike jump with 1/1 turn (360°) from cross position','D',121,'{"dance":true}'),
    ('fig25_bb_2_204a','2.204','a','Fouetté hop with ½ turn (180°) to land in arabesque (free leg above horizontal)','B',122,'{"dance":true}'),
    ('fig25_bb_2_404a','2.404','a','Fouetté hop with leg change to cross split (leg separation 180°) (tour jeté)','D',122,'{"dance":true}'),
    ('fig25_bb_2_504a','2.504','a','Tour jeté with additional ½ turn (180°)','E',122,'{"dance":true}'),
    ('fig25_bb_2_105a','2.105','a','Stride leap fwd with change of legs to wolf position (hip angle at 45°)','A',122,'{"dance":true}'),
    ('fig25_bb_2_305a','2.305','a','Leap fwd with leg change (free leg swing to 45˚) to cross split (180° separation < after leg change) (Switch leap)','C',122,'{"dance":true}'),
    ('fig25_bb_2_405a','2.405','a','Switch leap with ½ turn (180°)','D',122,'{"dance":true}'),
    ('fig25_bb_2_505a','2.505','a','Switch leap to ring position (leg separation 180°)','E',122,'{"dance":true}'),
    ('fig25_bb_2_206a','2.206','a','Leap with ¼ turn (90°) into straddle pike position (both legs above horizontal), to land on one or both feet','B',122,'{"dance":true}'),
    ('fig25_bb_2_306a','2.306','a','Leap fwd with leg change and ¼ turn (90°) to side split (180°) or straddle pike position (Johnson)','C',122,'{"dance":true}'),
    ('fig25_bb_2_506a','2.506','a','Johnson with additional ½ turn (180°)','E',122,'{"dance":true}'),
    ('fig25_bb_2_107a','2.107','a','Pike jump from cross position (legs above horizontal)','A',123,'{"dance":true}'),
    ('fig25_bb_2_207a','2.207','a','Pike jump with ½ turn (180°) from cross position','B',123,'{"dance":true}'),
    ('fig25_bb_2_407a','2.407','a','Pike jump with 1/1 turn (360°) from cross position','D',123,'{"dance":true}'),
    ('fig25_bb_2_108a','2.108','a','Sissone (leg separation 180° on the diagonal / 45° to the floor), take-off from both feet and land on one foot','A',123,'{"dance":true}'),
    ('fig25_bb_2_108b','2.108','b','Stag jump (leg separation 180°, back leg straight or bent)','A',123,'{"dance":true}'),
    ('fig25_bb_2_208a','2.208','a','Sissone to ring position (rear foot at head height, body arched and head dropped bwd, leg separation 180°) to land on one foot','B',123,'{"dance":true}'),
    ('fig25_bb_2_208b','2.208','b','Stag-ring jump','B',123,'{"dance":true}'),
    ('fig25_bb_2_308a','2.308','a','Jump with upper back arch and head release with feet to head height/closed ring (Sheep jump)','C',123,'{"dance":true}'),
    ('fig25_bb_2_408a','2.408','a','Split jump to ring position (leg separation 180°) to land on two feet','D',123,'{"dance":true}'),
    ('fig25_bb_2_408b','2.408','b','Split ring leap (leg separation 180°)','D',123,'{"dance":true}'),
    ('fig25_bb_2_408c','2.408','c','Jump to cross over split with body arched and head dropped bwd (Yang Bo)','D',123,'{"dance":true}'),
    ('fig25_bb_2_209a','2.209','a','Hop with 1/2 turn (180°), free leg extended fwd at horizontal throughout','B',124,'{"dance":true}'),
    ('fig25_bb_2_209b','2.209','b','Stretched jump or hop with 1/1 turn (360°) from cross position','B',124,'{"dance":true}'),
    ('fig25_bb_2_409a','2.409','a','Stretched jump or hop with 1½ turn (540°) from cross position','D',124,'{"dance":true}'),
    ('fig25_bb_2_110a','2.110','a','Cat leap (knees above horizontal alternately)','A',125,'{"dance":true}'),
    ('fig25_bb_2_110b','2.110','b','Scissors leap fwd (legs above horizontal)','A',125,'{"dance":true}'),
    ('fig25_bb_2_210a','2.210','a','Cat leap with 1/2 turn (180°)','B',125,'{"dance":true}'),
    ('fig25_bb_2_310a','2.310','a','Cat leap with 1/1 turn (360°)','C',125,'{"dance":true}'),
    ('fig25_bb_2_211a','2.211','a','Tuck hop or jump with ½ turn (180°) from cross position (hip & knee angle at 45°)','B',126,'{"dance":true}'),
    ('fig25_bb_2_311a','2.311','a','Tuck hop or jump with 1/1 turn (360°) from cross position','C',126,'{"dance":true}'),
    ('fig25_bb_2_411a','2.411','a','Tuck hop or jump with 1½ turn (540°) from cross position','D',126,'{"dance":true}'),
    ('fig25_bb_2_112a','2.112','a','Wolf hop or jump from cross position (hip angle at 45°, knees together)','A',126,'{"dance":true}'),
    ('fig25_bb_2_212a','2.212','a','Wolf hop or jump with ½ turn (180°) from cross position','B',126,'{"dance":true}'),
    ('fig25_bb_2_412a','2.412','a','Wolf hop or jump with 1/1 turn (360°) from cross position','D',126,'{"dance":true}'),
    ('fig25_bb_2_512a','2.512','a','Wolf hop or jump with 1½ turn (540°) from cross position','E',126,'{"dance":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'2','Gymnastic Leaps, Jumps and Hops',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_3_101a','3.101','a','1/1 turn (360°) on one leg – free leg optional below horizontal','A',127,'{"dance":true}'),
    ('fig25_bb_3_201a','3.201','a','1½ turn (540°) on one leg – free leg optional below horizontal','B',127,'{"dance":true}'),
    ('fig25_bb_3_401a','3.401','a','2/1 turn (720°) on one leg – free leg optional below horizontal','D',127,'{"dance":true}'),
    ('fig25_bb_3_501a','3.501','a','3/1 turn (1080°) on one leg – free leg optional below horizontal (Okino)','E',127,'{"dance":true}'),
    ('fig25_bb_3_302a','3.302','a','1/1 turn (360°) on one leg in back attitude (thigh of free leg at horizontal, throughout turn)','C',127,'{"dance":true}'),
    ('fig25_bb_3_402a','3.402','a','1½ turn (540°) on one leg in back attitude (thigh of free leg at horizontal, throughout turn)','D',127,'{"dance":true}'),
    ('fig25_bb_3_403a','3.403','a','1/1 turn (360°) with free leg held bwd with both hands (Preziosa)','D',128,'{"dance":true}'),
    ('fig25_bb_3_304a','3.304','a','1/1 turn (360°) with heel of extended free leg fwd at horizontal throughout turn (support leg may be straight or bent)','C',128,'{"dance":true}'),
    ('fig25_bb_3_404a','3.404','a','1½ turn (540°) with heel of extended free leg fwd at horizontal throughout turn (support leg may be straight or bent)','D',128,'{"dance":true}'),
    ('fig25_bb_3_504a','3.504','a','2/1 turn (720°) with heel of extended free leg fwd at horizontal throughout turn (support leg may be straight or bent) (Wevers)','E',128,'{"dance":true}'),
    ('fig25_bb_3_305a','3.305','a','1/1 turn (360°) with free leg held upward in 180° split position throughout turn','C',129,'{"dance":true}'),
    ('fig25_bb_3_405a','3.405','a','1½ turn (540°) with free leg held upward in 180° split position throughout turn (Galante)','D',129,'{"dance":true}'),
    ('fig25_bb_3_505a','3.505','a','2/1 turn (720°) with free leg held upward in 180° split position throughout turn (Sugihara)','E',129,'{"dance":true}'),
    ('fig25_bb_3_206a','3.206','a','½ illusion turn (180°) through standing split (180° legs separation) with/without brief touching of beam with one hand','B',129,'{"dance":true}'),
    ('fig25_bb_3_406a','3.406','a','1/1 illusion turn (360°) through standing split (180° legs separation) with/without brief touching of beam with one hand','D',129,'{"dance":true}'),
    ('fig25_bb_3_207a','3.207','a','1/1 turn (360°) in tuck stand on one leg – free leg straight throughout turn','B',130,'{"dance":true}'),
    ('fig25_bb_3_307a','3.307','a','1½ turn (540°) in tuck stand on one leg – free leg straight throughout turn','C',130,'{"dance":true}'),
    ('fig25_bb_3_407a','3.407','a','2/1 turn (720°) or 2½ turn (900°) in tuck stand on one leg – free leg straight throughout turn (Humphrey)','D',130,'{"dance":true}'),
    ('fig25_bb_3_507a','3.507','a','3/1 turn (1080°) in tuck stand on one leg – free leg straight throughout turn (Mitchell)','E',130,'{"dance":true}'),
    ('fig25_bb_3_208a','3.208','a','1/1 turn or 1½ turn (360° or 540°) in prone position – alternate support of hands permitted','B',130,'{"dance":true}'),
    ('fig25_bb_3_408a','3.408','a','1¼ turn (450°) on back in kip position (hip-leg angle closed) (Li Li)','D',130,'{"dance":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'3','Gymnastic Turns',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_4_101a','4.101','a','From kneeling sit position, rise upward with body wave through toe-balance stand','A',131,'{"dance":true}'),
    ('fig25_bb_4_102a','4.102','a','Standing split fwd with hand support in front of support leg (leg separation 180°) - needle scale (2 sec.)','A',131,'{"dance":true}'),
    ('fig25_bb_4_102b','4.102','b','Stand on one leg with foot of free leg in fwd hold above head (2 sec.)','A',131,'{"dance":true}'),
    ('fig25_bb_4_102c','4.102','c','Scale fwd, support leg extended (leg separation 180°) (2 sec.)','A',131,'{"dance":true}'),
    ('fig25_bb_4_202a','4.202','a','Clear pike support with legs together (2 sec.)','B',131,'{"acro":true}'),
    ('fig25_bb_4_103a','4.103','a','Kick to side or cross hstd (2 sec.), lower to end position touching beam','A',132,'{"acro":true}'),
    ('fig25_bb_4_203a','4.203','a','Kick to cross hstd – roll fwd with or without hand support to sit position or to tuck stand','B',132,'{"acro":true}'),
    ('fig25_bb_4_204a','4.204','a','Roll fwd without hand support to sit position or tuck stand','B',132,'{"acro":true}'),
    ('fig25_bb_4_204b','4.204','b','From cross sit, swing bwd to shoulder roll fwd with hip extension and hand support to sit position or tuck stand','B',132,'{"acro":true}'),
    ('fig25_bb_4_304a','4.304','a','Free shoulder roll fwd with hip extension and without hand support to sit position or tuck stand','C',132,'{"acro":true}'),
    ('fig25_bb_4_105a','4.105','a','Roll bwd with hand support on top of the beam – landing on one or both feet','A',133,'{"acro":true}'),
    ('fig25_bb_4_305a','4.305','a','Roll bwd to hstd - lower to end position touching beam','C',133,'{"acro":true}'),
    ('fig25_bb_4_206a','4.206','a','Roll swd, body tucked, straddle or stretched through neck stand, also with ½ turn (180°) over shoulder','B',133,'{"acro":true}'),
    ('fig25_bb_4_306a','4.306','a','Roll swd, body stretched without hand support','C',133,'{"acro":true}'),
    ('fig25_bb_4_107a','4.107','a','Cartwheel, also with support on one arm, or Cartwheel with flight phase before or after hand support','A',133,'{"acro":true}'),
    ('fig25_bb_4_207a','4.207','a','Roll swd, piked straddle with hand support – end position optional','B',133,'{"acro":true}'),
    ('fig25_bb_4_307a','4.307','a','From cross sit or side split – roll swd straddle or stretched without hand support – end position optional','C',133,'{"acro":true}'),
    ('fig25_bb_4_108a','4.108','a','Walkover fwd, with or without alternate hand support (Tinsica)','A',134,'{"acro":true}'),
    ('fig25_bb_4_108b','4.108','b','Walkover fwd, bwd (Tic-Toc)','A',134,'{"acro":true}'),
    ('fig25_bb_4_208a','4.208','a','Walkover fwd, with support on one arm','B',134,'{"acro":true}'),
    ('fig25_bb_4_308a','4.308','a','Kick to cross hstd with 1/2 turn (180°) to walkover fwd','C',134,'{"acro":true}'),
    ('fig25_bb_4_308b','4.308','b','Walkover fwd in side position to side stand','C',134,'{"acro":true}'),
    ('fig25_bb_4_109a','4.109','a','Walkover bwd, with/without alternate hand support, also with swing down to cross sit','A',135,'{"acro":true}'),
    ('fig25_bb_4_209a','4.209','a','Walkover bwd, with support on one arm','B',135,'{"acro":true}'),
    ('fig25_bb_4_309a','4.309','a','Walkover bwd with 1/2 turn (180°) to walkover fwd','C',135,'{"acro":true}'),
    ('fig25_bb_4_309b','4.309','b','Walkover bwd in side position to side stand','C',135,'{"acro":true}'),
    ('fig25_bb_4_309c','4.309','c','Walkover bwd with stoop through of one leg to cross split sit','C',135,'{"acro":true}'),
    ('fig25_bb_4_210a','4.210','a','From extended tuck sit - walkover bwd (Valdez)','B',135,'{"acro":true}'),
    ('fig25_bb_4_210b','4.210','b','Kick over bwd through horizontal plane with support on one arm (Garrison)','B',135,'{"acro":true}'),
    ('fig25_bb_4_310a','4.310','a','Valdez with 1/1 turn (360°) lower to end position touching beam','C',135,'{"acro":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'4','Holds and Acrobatic Non-Flight',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_5_201a','5.201','a','Handspring fwd with flight to land on one or both feet (same element), also with support on one arm','B',136,'{"acro":true}'),
    ('fig25_bb_5_301a','5.301','a','Handspring fwd with leg change in flight phase','C',136,'{"acro":true}'),
    ('fig25_bb_5_401a','5.401','a','Jump bwd (flic-flac take-off) with ½ twist (180°) through hstd to walkover fwd (Onodi) also with support on one arm, or to tic-toc','D',136,'{"acro":true}'),
    ('fig25_bb_5_501a','5.501','a','Jump bwd (flic-flac take-off) with ½ twist (180°) to handspring fwd to land on both feet (Worley)','E',136,'{"acro":true}'),
    ('fig25_bb_5_202a','5.202','a','Flic-flac to land on both feet','B',136,'{"acro":true}'),
    ('fig25_bb_5_302a','5.302','a','Flic-flac with ½ twist (180°) to hstd (2 sec.) – lower to optional end position','C',136,'{"acro":true}'),
    ('fig25_bb_5_402a','5.402','a','Flic-flac from side position with ½ twist (180°) to side hstd lower to optional end position (Kolesnikova)','D',136,'{"acro":true}'),
    ('fig25_bb_5_303a','5.303','a','Flic-flac with ¼ twist (90°) to hstd (2 sec.) – lower to optional end position','C',137,'{"acro":true}'),
    ('fig25_bb_5_403a','5.403','a','Flic-flac with ¾ twist (270°) to side hstd (2 sec.) – lower to optional end position (Omelianchik)','D',137,'{"acro":true}'),
    ('fig25_bb_5_204a','5.204','a','Flic-flac with step out, also with support on one arm','B',137,'{"acro":true}'),
    ('fig25_bb_5_304a','5.304','a','Flic-flac with ½ twist (180°) after hand support','C',137,'{"acro":true}'),
    ('fig25_bb_5_404a','5.404','a','Flic-flac with min. ¾ twist (270°) before hand support (Kochetkova)','D',137,'{"acro":true}'),
    ('fig25_bb_5_405a','5.405','a','Flic-flac with step-out from side position (Tousek)','D',138,'{"acro":true}'),
    ('fig25_bb_5_405b','5.405','b','Flic-flac from side position to front support or with hip circle bwd','D',138,'{"acro":true}'),
    ('fig25_bb_5_505a','5.505','a','Flic-flac from side position with 1/1 twist (360°) to hip circle bwd (Teza)','E',138,'{"acro":true}'),
    ('fig25_bb_5_206a','5.206','a','Gainer flic-flac also with support on one arm','B',138,'{"acro":true}'),
    ('fig25_bb_5_306a','5.306','a','Gainer flic-flac with ¼ twist (90°) to hstd (2 sec.) – lower to optional end position (Kitti)','C',138,'{"acro":true}'),
    ('fig25_bb_5_406a','5.406','a','Gainer flic-flac with min. ¾ twist (270°) before hand support (Khorkina)','D',138,'{"acro":true}'),
    ('fig25_bb_5_207a','5.207','a','Flic-flac or Gainer flic-flac – with high flight phase, and swing down to cross straddle sit','B',139,'{"acro":true}'),
    ('fig25_bb_5_307a','5.307','a','Flic-flac or Gainer flic-flac – with piking and stretching of hips in flight phase and swing down to cross straddle sit (Rueda)','C',139,'{"acro":true}'),
    ('fig25_bb_5_407a','5.407','a','Flic-flac with 1/1 twist (360°) – swing down to cross straddle sit (Rulfova)','D',139,'{"acro":true}'),
    ('fig25_bb_5_208a','5.208','a','Round-off','B',139,'{"acro":true}'),
    ('fig25_bb_5_408a','5.408','a','Free (aerial) cartwheel – landing on one or both feet, in cross or side position, also with leg change','D',139,'{"acro":true}'),
    ('fig25_bb_5_508a','5.508','a','Free (aerial) round-off tucked or piked - take-off from both feet','E',139,'{"acro":true}'),
    ('fig25_bb_5_508b','5.508','b','Free (aerial) cartwheel in side position (Colussi)','E',139,'{"acro":true}'),
    ('fig25_bb_5_409a','5.409','a','Free (aerial) walkover fwd, landing on one or both feet','D',140,'{"acro":true}'),
    ('fig25_bb_5_310a','5.310','a','Salto fwd tucked, take-off from one leg to stand on one or both feet (Liukin)','C',140,'{"acro":true}'),
    ('fig25_bb_5_410a','5.410','a','Salto fwd tucked to cross stand','D',140,'{"acro":true}'),
    ('fig25_bb_5_510a','5.510','a','Salto fwd piked to cross stand','E',140,'{"acro":true}'),
    ('fig25_bb_5_411a','5.411','a','Salto swd tucked take off from one leg to side stand','D',141,'{"acro":true}'),
    ('fig25_bb_5_511a','5.511','a','Salto swd tucked with ½ twist (180°) take off from one leg to side stand (Schaefer)','E',141,'{"acro":true}'),
    ('fig25_bb_5_611a','5.611','a','Arabian salto tucked (take-off bwd with ½ twist [180°], salto fwd) (Lobaznyuk)','F',141,'{"acro":true}'),
    ('fig25_bb_5_312a','5.312','a','Salto bwd tucked, piked or stretched (step out)','C',141,'{"acro":true}'),
    ('fig25_bb_5_512a','5.512','a','Salto bwd stretched with legs together','E',141,'{"acro":true}'),
    ('fig25_bb_5_612a','5.612','a','Salto bwd tucked with 1/1 twist (360°) (Shishova)','F',141,'{"acro":true}'),
    ('fig25_bb_5_712a','5.712','a','Salto bwd stretched with 1/1 twist (360°) (Shishova)','G',141,'{"acro":true}'),
    ('fig25_bb_5_313a','5.313','a','Gainer salto bwd tucked, piked or stretched step out','C',142,'{"acro":true}'),
    ('fig25_bb_5_613a','5.613','a','Jump fwd with ½ twist (180°) – salto bwd tucked – piked (Produnova)','F',142,'{"acro":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'5','Acrobatic Flight',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage","metadata") AS (
  VALUES
    ('fig25_bb_6_101a','6.101','a','Free (aerial) walkover fwd with ½ twist (180°)','A',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_201a','6.201','a','Free (aerial) walkover fwd with 1/1 twist (360°)','B',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_201b','6.201','b','Free (aerial) cartwheel with 1/2 twist (180°)','B',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_301a','6.301','a','Free (aerial) walkover fwd with 1½ twist (540°)','C',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_501a','6.501','a','Free (aerial) cartwheel into salto bwd tucked (Kim)','E',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_102a','6.102','a','Salto fwd tucked or piked, also with ½ twist (180°)','A',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_202a','6.202','a','Salto fwd stretched, also with 1/2 twist (180°)','B',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_202b','6.202','b','Salto fwd tucked with 1/1 twist (360°)','B',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_302a','6.302','a','Salto fwd stretched with 1/1 twist (360°) or 1½ twist (540°)','C',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_402a','6.402','a','Salto fwd stretched with 2/1 twist (720°) (Araujo)','D',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_602a','6.602','a','Double salto fwd tucked','F',143,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_203a','6.203','a','Jump bwd, with ½ twist (180°), salto fwd tucked or piked (Arabian salto)','B',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_303a','6.303','a','Stretched jump fwd with 1/1 twist (360°) and salto fwd tucked or piked','C',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_403a','6.403','a','Stretched jump fwd with 1/1 twist (360°) and salto fwd stretched','D',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_703a','6.703','a','Arabian double salto fwd tucked (Patterson)','G',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_104a','6.104','a','Salto bwd tucked, piked, or stretched, also with ½ twist (180°) (tucked or stretched)','A',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_204a','6.204','a','Salto bwd tucked or stretched with 1/1 twist (360°)','B',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_304a','6.304','a','Salto bwd tucked or stretched with 1 1/2 twist (540°) (Domingues)','C',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_304b','6.304','b','Salto bwd tucked or stretched with 2/1 twist (720°) (Mordenti)','C',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_404a','6.404','a','Salto bwd stretched with 2½ twist (900°)','D',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_604a','6.604','a','Salto bwd stretched with 3/1 twist (1080°)','F',144,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_405a','6.405','a','Double salto bwd tucked','D',145,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_505a','6.505','a','Double salto bwd piked','E',145,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_705a','6.705','a','Double salto bwd tucked or piked with 1/1 twist (360°)','G',145,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_805a','6.805','a','Double salto bwd tucked with 2/1 twist (720°) (Biles)','H',145,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_106a','6.106','a','Gainer salto tucked, piked, or stretched to side of beam, also with ½ twist (180°) (tucked or stretched)','A',146,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_206a','6.206','a','Gainer salto tucked or stretched with 1/1 twist (360°) to side of beam','B',146,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_306a','6.306','a','Gainer salto bwd tucked or stretched with 1½ twist (540˚) or (Bohmerova) 2/1 twist (720°) to side of beam','C',146,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_406a','6.406','a','Gainer salto bwd stretched with 2½ twist (900°) to side of beam (Khorkina)','D',146,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_606a','6.606','a','Gainer salto bwd stretched with 3/1 twist (1080°) to side of beam','F',146,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_207a','6.207','a','Gainer salto tucked or piked at end of beam','B',147,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_307a','6.307','a','Gainer salto stretched with legs together at end of beam','C',147,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_307b','6.307','b','Gainer salto tucked with 1/1 twist (360°) at end of beam (Kim)','C',147,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_407a','6.407','a','Gainer salto stretched with 1/1 twist (360°) at end of beam (Steingruber)','D',147,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_407b','6.407','b','Gainer salto tucked with 1 1/2 twist (540°) at end of beam (Olafsdottir)','D',147,'{"acro":true,"dismount":true}'),
    ('fig25_bb_6_507a','6.507','a','Gainer salto stretched with 2/1 twist (720°) at end of beam (Jurkowska-Kowalska)','E',147,'{"acro":true,"dismount":true}')
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BEAM',"officialNumber","variantKey","name",'[]',"difficulty",'6','Dismounts',"sourcePage","metadata",'VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BEAM'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );
