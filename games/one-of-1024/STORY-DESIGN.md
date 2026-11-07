# LIFE 1024 — Story 3.0

The first three binary decisions select one of eight authored life arcs. Each arc
has seven adult decisions: 8 × 2^7 = 1,024 complete lives. The 56 adult situations
have 112 authored consequences. This is not 1,024 independently authored novels:
scenes and settings are shared within an arc, while each life retains every choice.

`life-v3-stories.js` replaces the old common decision schedule and hash-selected
incidents. Early commitments, shared/separate homes, ownership, response to a
crisis, and succession remain in state and affect later scenes, costs and options.
Neither random incidents nor resource requirements make any branch inaccessible.
Costs beyond savings become debt; the game never silently disables an option.

The ending records all seven adult decisions and their consequences. Earlier
choices determine the arc. The journal now retains childhood and between-choice
scenes. Comparison shows the decisions that differed. Story 3 uses a new storage
key so previous-version choices are not reinterpreted as a different life.

Validation: `node tests/life-1024-model.cjs` exhaustively checks all leaves and
1,023 decision prefixes, deterministic replay, two available choices, chronological
ages, finite numeric state, retention of consequences and 1,024 distinct ending
texts. `node tests/life-1024.cjs` adds browser interaction checks when Playwright
Chromium is available. It requires a local static server on port 8765 or LIFE_URL.


## Story 3.1 — walking protagonist and narrative revision

`life-avatar.js` draws an integer-grid SVG sprite with four walking frames. A
separate lane keeps the character visible above the story. Childhood, school,
university, eight working outfits and retirement alter clothing and props;
age changes stature, hair and stride. A cane is used only for an older character
with reduced health. Choosing A/B follows the corresponding road. Rewind/restart
cancels in-flight movement; reduced-motion preference skips animation. Pause
stops auto-advance and the walking loop.

Choice previews now describe intentions and stakes rather than revealing results.
48 profession-specific everyday scenes replace repeated generic filler. Renting
a kitchen, operating versus working on a ship, moving from a hotel to a small inn,
and opening a workshop after manufacturer employment have explicit continuity.
Only context relevant to the current decision is repeated in the prompt; all
choices and consequences still persist in the journal and ending. Replayed choice
outcomes are displayed without duplicating the journal. School status updates
with age. Story 3.0 route saves remain usable.

`tests/life-avatar.cjs` checks eight distinct outfits, six age appearances,
left/right movement, pause, restart during movement and responsive layout.


## Story 4.0 — people, everyday scenes, and a readable game interface

`life-connections.js` adds a mandatory introduction event at age 22 on all eight
arcs, before the first adult decision. `metPerson` is applied by that beat, and
`castOf` exposes no character before it. Fast-forward still simulates the
introduction and the next decision recalls where they met. Character cards show
role, place and age of meeting, a small portrait, and relationship appropriate to
the choices already made. Younger colleagues are introduced before succession.

Between adult choices: consequence, profession-specific daily event, evolving
relationship scene, then the next decision. Reading has next/previous controls;
back-reading pauses autoplay. Reviewing characters or the journal also pauses.
The next scene and fast-forward are separate controls. Space advances one scene
when focus is outside an interactive control. Dialogue titles and repeated
context are shortened. All 1,024 routes remain reachable and retain consequences.

`life-ui.css` replaces the accumulated overrides for the current pages, without
changing archived versions. The pixel landscape uses local SVG shapes, seasonal
colors and profession/location landmarks. The protagonist has revised face,
shading, fixed-length stepping legs and eight work outfits. NPC portraits have
separate palettes and hair. No external image/font fetches are required.

Validation also includes `tests/life-connections.cjs`: introduction order on all
eight arcs, unknown-before-met state, fast-forward, scene back/next, person cards,
keyboard tabs and viewport overflow. Main exhaustive tests include intro state.
