WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_2_101a','2.101','a','Cast to hstd with legs straddled or hips bent; also with hop-grip change','A',78),
    ('fig25_ub_2_201a','2.201','a','Cast to hstd with legs together and hips extended; also with hop-grip change or 1/2 turn (180°), legs together or straddled','B',78),
    ('fig25_ub_2_301a','2.301','a','Cast with 1/1 turn (360°) to hstd','C',78),
    ('fig25_ub_2_401a','2.401','a','Cast with 1 1/2 turn (540°) to hstd (Reeder)','D',78),
    ('fig25_ub_2_202a','2.202','a','Front support on HB - stoop with flight or free straddle fwd over HB and 1/2 turn (180°) to hang on HB','B',78),
    ('fig25_ub_2_302a','2.302','a','Hip circle bwd hecht with flight and 1/2 turn (180°) passing over bar to hang on same bar; also from clear hip circle bwd','C',78),
    ('fig25_ub_2_303a','2.303','a','From front support on HB - cast with release and 1/1 turn (360°) to hang on HB (Caslavska)','C',79),
    ('fig25_ub_2_403a','2.403','a','From inner front support on LB - cast with salto roll fwd to hang on HB (Brause/Radochla)','D',79),
    ('fig25_ub_2_503a','2.503','a','Front support on HB - cast with salto fwd straddled to hang on HB (Comaneci)','E',79),
    ('fig25_ub_2_104a','2.104','a','Hip circle fwd, hips touching bar','A',79),
    ('fig25_ub_2_404a','2.404','a','Clear hip circle fwd to hstd, also with 1/2 turn (180°) in hstd phase (Weiler-kip)','D',79),
    ('fig25_ub_2_504a','2.504','a','Clear hip circle fwd to hstd with 1/1 turn (360°) in hstd phase (Godwin)','E',79),
    ('fig25_ub_2_504b','2.504','b','Clear hip circle fwd (Weiler) into salto fwd straddled to hang on HB (Adalsteinsdottir)','E',79),
    ('fig25_ub_2_105a','2.105','a','Hip circle bwd, hips touching bar','A',80),
    ('fig25_ub_2_105b','2.105','b','Clear hip circle bwd or hip circle bwd on LB - hip repulsion (false-pop) with regrasp on LB','A',80),
    ('fig25_ub_2_305a','2.305','a','Clear hip circle to hstd, also with hop-grip change or 1/2 turn (180°) to hstd','C',80),
    ('fig25_ub_2_405a','2.405','a','Clear hip circle with 1/1 turn (360°) to hstd','D',80),
    ('fig25_ub_2_505a','2.505','a','Clear hip circle with 1 1/2 turn (540°) to hstd','E',80),
    ('fig25_ub_2_206a','2.206','a','Clear underswing on LB, release and counter movement fwd in flight to hang on HB','B',81),
    ('fig25_ub_2_306a','2.306','a','Clear hip circle bwd on HB with hecht to clear support on LB (Pedrick)','C',81),
    ('fig25_ub_2_406a','2.406','a','Inner front support on LB - clear hip circle through hstd with flight to hang on HB (Shaposhnikova)','D',81),
    ('fig25_ub_2_506a','2.506','a','Clear hip circle on HB, counter straddle over HB to hang on HB (Hindorff)','E',81),
    ('fig25_ub_2_506b','2.506','b','Clear hip circle on HB with counter straddle over HB and 1/2 turn (180°) to hang in mixed L grip (Martins)','E',81),
    ('fig25_ub_2_506c','2.506','c','Clear hip circle through hstd with 1/2 turn (180°) in flight to hang on HB (Khorkina)','E',81),
    ('fig25_ub_2_606a','2.606','a','Clear hip circle on HB, counter pike over HB to hang on HB (Shang)','F',81),
    ('fig25_ub_2_606b','2.606','b','Clear hip circle on HB, counter pike over HB with 1/2 turn (180°) to hang in mixed L grip (Black)','F',81),
    ('fig25_ub_2_706a','2.706','a','Clear hip circle on HB with counter stretched reverse hecht in layout position over HB to hang (Zhang)','G',81),
    ('fig25_ub_2_307a','2.307','a','Outer front support - clear hip circle bwd on LB with hecht to hang on HB (Yarotska)','C',82),
    ('fig25_ub_2_407a','2.407','a','Outer front support - clear hip circle bwd on LB with hecht and 1/2 turn (180°) to hang on HB, legs together or straddled','D',82)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'2','Casts and Clear Hip Circles',"sourcePage",'{}','VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );


WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_4_101a','4.101','a','Clear straddle circle fwd to clear support','A',90),
    ('fig25_ub_4_201a','4.201','a','Kip on HB, passing through clear straddle support - swing or press to hstd and 1/2 turn (180°) in hstd phase','B',90),
    ('fig25_ub_4_501a','4.501','a','Stalder fwd to hstd, also with 1/2 turn (180°) to hstd','E',90),
    ('fig25_ub_4_601a','4.601','a','Stalder fwd with 1/1 turn (360°) to hstd','F',90),
    ('fig25_ub_4_302a','4.302','a','Clear straddle circle bwd on HB with flight to clear support on LB','C',90),
    ('fig25_ub_4_402a','4.402','a','Clear straddle circle bwd on HB with flight fwd to hstd on LB','D',90),
    ('fig25_ub_4_502a','4.502','a','Stalder bwd on HB with counter straddle reverse hecht over HB to hang (Ricna)','E',90),
    ('fig25_ub_4_502b','4.502','b','Stalder bwd on HB with counter straddle reverse hecht over HB and 1/2 turn (180°) to hang in mixed L grip (Derwael/Fenton)','E',90),
    ('fig25_ub_4_602a','4.602','a','Stalder bwd on HB with counter pike reverse hecht over HB to hang (Downie)','F',90),
    ('fig25_ub_4_103a','4.103','a','Clear straddle circle fwd in L grip to clear support','A',91),
    ('fig25_ub_4_403a','4.403','a','Stalder fwd in L grip to hstd, also with 1/2 turn (180°) to hstd (White)','D',91),
    ('fig25_ub_4_503a','4.503','a','Stalder fwd in L grip with 1/1 turn (360°) to hstd','E',91),
    ('fig25_ub_4_104a','4.104','a','Clear straddle circle bwd to clear support','A',91),
    ('fig25_ub_4_304a','4.304','a','Stalder bwd to hstd, also with hop-grip change or 1/2 turn (180°) to hstd','C',91),
    ('fig25_ub_4_404a','4.404','a','Stalder bwd with 1/1 turn (360°) to hstd (Frederick)','D',91),
    ('fig25_ub_4_504a','4.504','a','Stalder bwd with 1 1/2 turn (540°) to hstd','E',91),
    ('fig25_ub_4_205a','4.205','a','Facing inward - Stalder bwd with release and counter movement fwd in flight to hang on HB','B',92),
    ('fig25_ub_4_305a','4.305','a','Facing inward - Stalder bwd with hecht flight to hang on HB','C',92),
    ('fig25_ub_4_405a','4.405','a','Facing outward - Stalder bwd through hstd with flight to hang on HB','D',92),
    ('fig25_ub_4_505a','4.505','a','Stalder bwd through hstd with flight and 1/2 turn (180°) to hang on HB','E',92),
    ('fig25_ub_4_106a','4.106','a','Rear support - seat (pike) circle fwd to rear support','A',92),
    ('fig25_ub_4_406a','4.406','a','Clear pike circle fwd to hstd, also with 1/2 turn (180°) to hstd','D',92),
    ('fig25_ub_4_506a','4.506','a','Clear pike circle fwd with 1/1 turn (360°) to hstd','E',92),
    ('fig25_ub_4_107a','4.107','a','Rear support - seat (pike) circle bwd to rear support','A',93),
    ('fig25_ub_4_407a','4.407','a','Clear pike circle bwd to hstd, also with 1/2 turn (180°) to hstd','D',93),
    ('fig25_ub_4_507a','4.507','a','Clear pike circle bwd with 1/1 turn (360°) to hstd','E',93),
    ('fig25_ub_4_208a','4.208','a','Clear pike circle bwd on LB with counter flight to hang on HB','B',93),
    ('fig25_ub_4_308a','4.308','a','Clear pike circle bwd on LB with hecht flight to hang on HB (Zgoba)','C',93),
    ('fig25_ub_4_308b','4.308','b','Clear pike circle bwd on HB with flight to clear support on LB (Sayer)','C',93),
    ('fig25_ub_4_508a','4.508','a','Clear pike circle bwd through hstd with flight to hang on HB, also with 1/2 turn (180°) (Komova)','E',93),
    ('fig25_ub_4_508b','4.508','b','Clear pike circle bwd with counter straddle reverse hecht over HB to hang (Galante)','E',93),
    ('fig25_ub_4_608a','4.608','a','Clear pike circle bwd with counter pike reverse hecht over HB to hang','F',93),
    ('fig25_ub_4_708a','4.708','a','Clear pike circle bwd with counter stretched reverse hecht in layout position over HB to hang (Nemour)','G',93)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'4','Stalder Circles',"sourcePage",'{}','VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_5_101a','5.101','a','Rear support on LB or HB - seat (pike) circle fwd with straddle cut bwd to hang on same bar','A',94),
    ('fig25_ub_5_301a','5.301','a','Outer rear support on HB - fall bwd to inverted pike swing or seat circle fwd, straddle cut bwd with flight over LB to hang','C',94),
    ('fig25_ub_5_301b','5.301','b','Rear support on LB - seat circle fwd with straddle cut bwd and grip change to hang on HB','C',94),
    ('fig25_ub_5_501a','5.501','a','Stoop in to Adler seat circle fwd through clear extended support to L grip, also with 1/2 turn (180°) (Luo)','E',94),
    ('fig25_ub_5_202a','5.202','a','Rear support on HB - seat circle bwd with release to hang on LB','B',95),
    ('fig25_ub_5_302a','5.302','a','Clear rear pike support on HB - full circle swing bwd to finish in clear rear support (Steinemann)','C',95),
    ('fig25_ub_5_402a','5.402','a','Clear rear pike support on HB - full circle swing bwd continuing over HB into hang (Mirgoradskaja)','D',95),
    ('fig25_ub_5_402b','5.402','b','From hstd clear pike circle bwd to rear inverted pike support (Krasnyanska)','D',95),
    ('fig25_ub_5_502a','5.502','a','Clear rear pike support on HB - circle swing bwd and salto bwd stretched between bars to clear support on LB (Teza)','E',95),
    ('fig25_ub_5_502b','5.502','b','Clear rear pike support on HB - circle swing bwd and 1/2 turn (180°) with flight to hstd on LB','E',95),
    ('fig25_ub_5_303a','5.303','a','Clear rear pike support on HB - full circle swing bwd with stoop out bwd to hang on HB (Li Li)','C',95),
    ('fig25_ub_5_403a','5.403','a','Clear rear pike support on HB - full circle swing bwd with counter flight bwd straddled (Li Li)','D',95),
    ('fig25_ub_5_104a','5.104','a','Underswing bwd, dislocate (Schleudern) to hang on HB','A',96),
    ('fig25_ub_5_304a','5.304','a','Schleudern to near hstd with hop-change to regular grip on HB','C',96),
    ('fig25_ub_5_304b','5.304','b','Stoop through on HB, dislocate and release with 1/2 turn (180°) in flight to catch LB in hang (Alt)','C',96),
    ('fig25_ub_5_404a','5.404','a','Underswing bwd on HB - dislocate with flight to hstd on LB (Zuchold-Schleudern); also from stoop through','D',96),
    ('fig25_ub_5_105a','5.105','a','Sole circle fwd, piked or straddled','A',97),
    ('fig25_ub_5_305a','5.305','a','Pike sole circle fwd in reverse grip to hstd, also with 1/2 turn (180°)','C',97),
    ('fig25_ub_5_405a','5.405','a','Pike sole circle fwd in reverse grip with 1/1 turn (360°) to hstd (Hoefnagel)','D',97),
    ('fig25_ub_5_106a','5.106','a','Sole circle fwd in L grip, piked or straddled','A',97),
    ('fig25_ub_5_306a','5.306','a','Pike sole circle fwd in L grip to hstd, also with 1/2 turn (180°)','C',97),
    ('fig25_ub_5_406a','5.406','a','Pike sole circle fwd in L grip with 1/1 turn (360°) to hstd','D',97),
    ('fig25_ub_5_207a','5.207','a','Underswing on LB with support of feet and counter movement fwd in flight to hang on HB','B',98),
    ('fig25_ub_5_307a','5.307','a','Underswing on HB or LB with hand release and 1 1/2 turn (540°) to hang (Burda)','C',98),
    ('fig25_ub_5_607a','5.607','a','Facing outward on HB - underswing with support of feet, counter salto fwd straddled to hang on HB in reverse grip','F',98),
    ('fig25_ub_5_108a','5.108','a','Sole circle bwd, piked or straddled','A',98),
    ('fig25_ub_5_308a','5.308','a','Pike sole circle bwd to hstd, also with hop-grip change or 1/2 turn (180°)','C',98),
    ('fig25_ub_5_408a','5.408','a','Pike sole circle bwd with 1/1 turn (360°) to hstd','D',98),
    ('fig25_ub_5_508a','5.508','a','Pike sole circle bwd with 1 1/2 turn (540°) to hstd (Lucke)','E',98),
    ('fig25_ub_5_409a','5.409','a','Inner front support on LB - pike sole circle bwd through hstd with flight to hang on HB (Maloney)','D',99),
    ('fig25_ub_5_509a','5.509','a','Facing outward on LB - pike sole circle bwd through hstd with flight and 1/2 turn (180°) to hang on HB (Van Leeuwen)','E',99),
    ('fig25_ub_5_509b','5.509','b','Facing outward on LB - pike sole circle bwd through hstd with flight and 1/1 turn (360°) to hang on HB (Seitz)','E',99),
    ('fig25_ub_5_410a','5.410','a','Pike sole circle bwd through hstd with counter straddle reverse hecht over HB to hang (Ray)','D',99),
    ('fig25_ub_5_410b','5.410','b','Pike sole circle bwd through hstd with counter straddle reverse hecht and 1/2 turn (180°) to hang (Tweddle)','D',99),
    ('fig25_ub_5_510a','5.510','a','Pike sole circle bwd through hstd with counter pike reverse hecht over HB to hang (Church)','E',99),
    ('fig25_ub_5_510b','5.510','b','Pike sole circle bwd through hstd with counter pike reverse hecht and 1/2 turn (180°) to hang (Fenton)','E',99),
    ('fig25_ub_5_610a','5.610','a','Pike sole circle bwd through hstd with counter stretched reverse hecht over HB to hang (Nabieva)','F',99),
    ('fig25_ub_5_610b','5.610','b','Pike sole circle bwd through hstd with counter stretched reverse hecht and 1/2 turn (180°) to hang (Derwael)','F',99)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'5','Pike Circles',"sourcePage",'{}','VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_6_101a','6.101','a','Underswing with 1/2 turn (180°) or 1/1 turn (360°)','A',100),
    ('fig25_ub_6_201a','6.201','a','Underswing and salto fwd tucked or piked','B',100),
    ('fig25_ub_6_301a','6.301','a','Underswing and salto fwd tucked or piked with 1/2 or 1/1 turn (180° or 360°)','C',100),
    ('fig25_ub_6_401a','6.401','a','Underswing and salto fwd tucked with 1 1/2 turn (540°)','D',100),
    ('fig25_ub_6_401b','6.401','b','Underswing and salto fwd stretched with 1/2 turn (180°) (Moors)','D',100),
    ('fig25_ub_6_102a','6.102','a','Clear underswing with 1/2 turn (180°) or 1/1 turn (360°)','A',100),
    ('fig25_ub_6_302a','6.302','a','Clear underswing and salto fwd tucked or piked, also with 1/2 turn (180°)','C',100),
    ('fig25_ub_6_302b','6.302','b','Clear straddle circle with salto fwd tucked, also with 1/2 turn (180°) (Plichta/Alt)','C',100),
    ('fig25_ub_6_402a','6.402','a','Clear underswing and salto fwd tucked with 1/1 turn (360°)','D',100),
    ('fig25_ub_6_402b','6.402','b','Clear pike underswing to salto fwd stretched with 1/2 turn (180°) (Brunner)','D',100),
    ('fig25_ub_6_402c','6.402','c','Clear straddle circle with salto fwd tucked with 1/1 turn (360°) (Petz)','D',100),
    ('fig25_ub_6_502a','6.502','a','Clear underswing and salto fwd tucked with 1 1/2 turn (540°)','E',100),
    ('fig25_ub_6_303a','6.303','a','Underswing or clear underswing with 1/2 turn (180°) to salto bwd tucked or piked','C',101),
    ('fig25_ub_6_403a','6.403','a','Underswing with 1/2 turn (180°) to salto bwd stretched','D',101),
    ('fig25_ub_6_403b','6.403','b','Clear underswing with 1/2 turn (180°) to salto bwd stretched (Okino)','D',101),
    ('fig25_ub_6_403c','6.403','c','Underswing with 1/2 turn (180°) to salto bwd tucked with 1/1 turn (360°) (Kraeker)','D',101),
    ('fig25_ub_6_104a','6.104','a','Swing fwd to salto bwd tucked, piked or stretched (flyaway)','A',102),
    ('fig25_ub_6_204a','6.204','a','Swing fwd to salto bwd tucked or stretched with 1/2 or 1/1 turn (180° or 360°) (flyaway)','B',102),
    ('fig25_ub_6_304a','6.304','a','Swing fwd to salto bwd stretched with 1 1/2 or 2/1 turn (540° or 720°)','C',102),
    ('fig25_ub_6_404a','6.404','a','Swing fwd to salto bwd stretched with 2 1/2 turn (900°) (Ji)','D',102),
    ('fig25_ub_6_504a','6.504','a','Swing fwd to salto bwd stretched with 3/1 turn (1080°) (Bar)','E',102),
    ('fig25_ub_6_604a','6.604','a','Swing fwd to salto bwd stretched with 3 1/2 turn (1260°)','F',102),
    ('fig25_ub_6_205a','6.205','a','Swing fwd to double salto bwd tucked','B',103),
    ('fig25_ub_6_305a','6.305','a','Swing fwd to double salto bwd piked','C',103),
    ('fig25_ub_6_405a','6.405','a','Swing fwd to double salto bwd tucked or piked with 1/1 turn (360°) in first or second salto (Morio/Chusovitina)','D',103),
    ('fig25_ub_6_505a','6.505','a','Swing fwd to double salto bwd tucked with 1 1/2 turn (540°) (Mustafina)','E',103),
    ('fig25_ub_6_605a','6.605','a','Swing fwd to double salto bwd tucked with 2/1 turn (720°) (Fabrichnova)','F',103),
    ('fig25_ub_6_406a','6.406','a','Swing fwd to double salto bwd stretched','D',103),
    ('fig25_ub_6_606a','6.606','a','Swing fwd to double salto bwd stretched with 1/1 turn (360°) in first or second salto','F',103),
    ('fig25_ub_6_706a','6.706','a','Swing fwd to double salto bwd stretched with 2/1 turn (720°) (Ray)','G',103)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'6','Dismounts',"sourcePage",'{"dismount":true}','VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );

WITH "verifiedElements" ("id","officialNumber","variantKey","name","difficulty","sourcePage") AS (
  VALUES
    ('fig25_ub_3_201a','3.201','a','Giant circle bwd in regular grip or on one arm (Liu), also with 1/2 turn (180°) to hstd','B',83),
    ('fig25_ub_3_301a','3.301','a','Giant circle bwd with 1/1 turn (360°) to hstd','C',83),
    ('fig25_ub_3_401a','3.401','a','Giant circle bwd with 1 1/2 or 2/1 turn (540° or 720°) to hstd; also with hop 1/1 turn (360°) to hstd (Chusovitina)','D',83),
    ('fig25_ub_3_402a','3.402','a','Hang on HB - swing fwd with 1/2 turn (180°) and flight to hstd on LB','D',83),
    ('fig25_ub_3_502a','3.502','a','Hang on HB - swing fwd with 1 1/2 turn (540°) and flight over LB to hang on LB (Strong)','E',83),
    ('fig25_ub_3_403a','3.403','a','Long swing fwd, counter straddle reverse hecht over HB to hang (Davydova/Tkatchev)','D',84),
    ('fig25_ub_3_403b','3.403','b','Tkatchev with 1/2 turn (180°) (Kononenko)','D',84),
    ('fig25_ub_3_403c','3.403','c','Swing fwd with 1/2 turn (180°), pike vault over HB to hang (Monckton)','D',84),
    ('fig25_ub_3_503a','3.503','a','Tkatchev piked','E',84),
    ('fig25_ub_3_503b','3.503','b','Long swing fwd with 1/2 turn - 1/2 turn to counter straddle in flight over HB to hang (Shushunova)','E',84),
    ('fig25_ub_3_304a','3.304','a','Hang on HB facing LB - swing fwd and roll bwd, legs straddled, to clear support on LB','C',85),
    ('fig25_ub_3_404a','3.404','a','Hang on HB facing LB - swing fwd and salto bwd stretched between bars to clear support on LB (Pak)','D',85),
    ('fig25_ub_3_504a','3.504','a','Pak salto with 1/1 turn (360°) (Bhardwaj)','E',85),
    ('fig25_ub_3_604a','3.604','a','Facing outward on HB - swing fwd and counter salto fwd with legs straddled to hang on HB in reverse grip (Kim)','F',85),
    ('fig25_ub_3_405a','3.405','a','Swing fwd with 1/2 turn (180°) and salto fwd straddled or piked to hang on HB (Deltchev/Moreno/Nakamura)','D',86),
    ('fig25_ub_3_405b','3.405','b','Swing fwd and salto bwd piked with 1/2 turn (180°) to hang on HB (Gienger)','D',86),
    ('fig25_ub_3_505a','3.505','a','Swing fwd and salto bwd stretched with 1/2 turn (180°) to hang on HB','E',86),
    ('fig25_ub_3_705a','3.705','a','Swing fwd and salto bwd stretched with 1 1/2 turn (540°) to hang on HB (Hristakieva)','G',86),
    ('fig25_ub_3_206a','3.206','a','Giant circle fwd in reverse, regular or mixed grip, including straddled or bent-hip upswing; also with 1/2 turn (180°) to hstd','B',87),
    ('fig25_ub_3_306a','3.306','a','Giant circle fwd with 1/1 turn (360°) to hstd','C',87),
    ('fig25_ub_3_506a','3.506','a','Giant circle fwd in reverse grip with one-arm initiation of 1/1 turn (360°), or with 1 1/2 turn (540°), to hstd','E',87),
    ('fig25_ub_3_307a','3.307','a','Swing bwd - straddle flight bwd over LB to hstd on LB','C',87),
    ('fig25_ub_3_407a','3.407','a','Swing bwd release and 1/2 turn (180°) in flight between bars to clear support on LB (Ejova)','D',87),
    ('fig25_ub_3_308a','3.308','a','Swing bwd salto fwd tucked to hang on HB (Jaeger)','C',88),
    ('fig25_ub_3_408a','3.408','a','Jaeger salto straddled to hang on HB','D',88),
    ('fig25_ub_3_408b','3.408','b','Jaeger salto straddled with 1/2 turn (180°) to hang on HB (Li Ya)','D',88),
    ('fig25_ub_3_408c','3.408','c','Jaeger salto piked to hang on HB','D',88),
    ('fig25_ub_3_608a','3.608','a','Jaeger salto stretched to hang on HB (Capuccitti)','F',88),
    ('fig25_ub_3_608b','3.608','b','Jaeger salto stretched with 1/1 turn (360°) to hang on HB (Minamino)','F',88),
    ('fig25_ub_3_608c','3.608','c','Jaeger salto stretched with 1/1 turn (360°) to hang on HB (Yang)','F',88),
    ('fig25_ub_3_708a','3.708','a','Swing bwd with salto fwd tucked over HB to hang on HB (Mo)','G',88),
    ('fig25_ub_3_309a','3.309','a','Swing bwd with free stoop or straddle vault and 1/2 turn (180°) over HB to hang (Zhang/Volpi)','C',89),
    ('fig25_ub_3_409a','3.409','a','Swing bwd with 1/2 turn (180°) and straddle flight bwd over HB to hang (Khorkina)','D',89),
    ('fig25_ub_3_310a','3.310','a','Giant circle fwd in L grip, piked or stretched, also with 1/2 turn (180°) to hstd','C',89),
    ('fig25_ub_3_410a','3.410','a','Giant circle fwd in L grip with 1/1 turn (360°) to hstd','D',89),
    ('fig25_ub_3_510a','3.510','a','Giant circle fwd in L grip with one-arm initiation of 1/1 turn (360°), or with 1 1/2 turn (540°), to hstd','E',89)
)
INSERT INTO "FigElementDefinition" ("id","packageId","apparatus","officialNumber","variantKey","name","aliases","difficulty","groupCode","groupName","sourcePage","metadata","verificationStatus","status")
SELECT "id",'canonical_fig_wag_2025_2028','BARS',"officialNumber","variantKey","name",'[]',"difficulty",'3','Giant Circles',"sourcePage",'{}','VERIFIED','ACTIVE'
FROM "verifiedElements"
WHERE EXISTS (SELECT 1 FROM "RulesetPackage" WHERE "id"='canonical_fig_wag_2025_2028')
  AND NOT EXISTS (
    SELECT 1 FROM "FigElementDefinition" existing
    WHERE existing."packageId"='canonical_fig_wag_2025_2028'
      AND existing."apparatus"='BARS'
      AND existing."officialNumber"="verifiedElements"."officialNumber"
      AND existing."variantKey"="verifiedElements"."variantKey"
  );
