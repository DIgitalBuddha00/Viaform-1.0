-- Coach-facing Bars identity refinement.
-- FIG source definitions/numbers/difficulty remain unchanged; only ViaformSkill display/search terminology is updated.

UPDATE "ViaformSkill"
SET "name"='Cast to Handstand — Straddle',
    "aliases"='["cast to handstand","cast handstand","straddle cast handstand","straddle cast","cast hs straddle","pike cast handstand"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.101:a';

UPDATE "ViaformSkill"
SET "name"='Cast to Handstand — Straight',
    "aliases"='["cast to handstand","cast handstand","straight cast handstand","straight cast","cast hs","cast handstand straight"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.201:a';

UPDATE "ViaformSkill"
SET "name"='Cast to Handstand — Hop Grip Change (Straddle)',
    "aliases"='["cast hop","cast hop grip change","straddle cast hop","straddle cast handstand hop grip change"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.101:b';

UPDATE "ViaformSkill"
SET "name"='Cast to Handstand — Hop Grip Change (Straight)',
    "aliases"='["cast handstand hop","cast hop grip change","straight cast hop","straight cast handstand hop grip change"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.201:b';

UPDATE "ViaformSkill"
SET "name"='Cast Handstand ½ Pirouette',
    "aliases"='["cast half","cast 1/2","cast half turn","cast 1/2 turn","half pirouette","handstand half pirouette","cast handstand half pirouette"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.201:c';

UPDATE "ViaformSkill"
SET "name"='Cast Handstand Full Pirouette',
    "aliases"='["cast full","cast full turn","cast 1/1","full pirouette","handstand full pirouette","cast handstand full pirouette"]',
    "updatedAt"=CURRENT_TIMESTAMP
WHERE "canonicalKey"='FIG:ELEMENT:BARS:2.301:a';
