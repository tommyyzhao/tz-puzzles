# Stillwater rebuild — decision log

The user went offline on 2026-10-30 and asked: "If any decisions come up, act according to your best judgement, document the decision, I can review them later." Each entry gives the decision, why it was made, and how to reverse it.

## Inherited from the approved plan

- **D1 Entry rule: doorways and walls.**
  - Moving into an open arch goes inside, landing at the middle of that interior edge. Moving into a solid face pushes the box. There is no Enter button.
  - When the landing cell is blocked, the move fails with an "arch" reason. It does *not* fall back to pushing, unlike Parabox, so one face always means one thing.
  - The follow-up question was never answered (the tool failed twice), so the plan's recommended default applies.
- **D2 Finale: "the world in a box".**
  - The fallback is Confluence, if the box proves unreadable.
  - Same unanswered question, so the recommended default applies.
- **D3 Build crew: direct build.**
  - Read-only reviewer agents only, with no worktrees, since HEAD is unborn.

## Made during implementation

- **D4 Vendored dependencies.**
  - `three@0.186.1` and `@sparkjsdev/spark@2.4.0` are both MIT. They were taken from registry tarballs with matching npm sha512 integrity, and only the required files were copied to `stillwater/vendor/`.
  - Spark inlines its worker as a data URL, so no extra assets are needed. No package scripts were run.
- **D5 Seeds and rooting removed.**
  - Restoration is now a latched "basin awake" flag, which undo can reverse.
  - Nothing in the world can be made permanently immovable, so no state can strand the player.
- **D6 Leaving a box puts you outside it, in its parent room.**
  - From there you can push it, just like any other box. No special "carrier" rule is needed.
  - Self-containing pushes are handled by D7.
- **D7 Pushing a box into itself, or into a box it contains, is refused (`self`).**
- **D8 Added terrain primitives** (each one earns its place in at least one authored beat):
  - **Stream:** a wet channel blocks the player but not objects. This makes releasing water a real trade-off (the Ford beat).
  - **Chasm:** a pushed stone fills it and becomes ground; a box cannot fill it.
  - **Culvert:** water passes, nothing else does.
  - **Bridge:** walkable by the player over water; objects cannot be pushed onto it.
  - **Gate:** a footbridge once its basin wakes.
  - **Sluice:** a channel once its basin wakes.
- **D9 Pocket boxes show their direction.**
  - Arch sides cannot be pushed from (you walk in instead). The puzzles rely on this constraint: an "elbow" box turns water and stones, a "cart" box carries a sideways-only box, and a "tee" box splits a river.
- **D10 Authoring is solver-gated.**
  - Every clearing is checked by exhaustive BFS with a deletion test: freeze or remove the key object, or delete the key arch, and the clearing must become unsolvable.
  - Drafts that failed the test were cut. Examples: a decorative rock in the Elbow beat, and a Ford variant that could be crossed without re-damming.
- **D11 Acted on the read-only design review (2026-10-30).** Its verified grid edits were applied, and the campaign was re-solved by the staged solver (204 moves; replays to completion).
  - **Softlocks removed.** Footbridges were placed where a push would strand a key object:
    - meadow (3,9) stops the world box being pushed into the bottom row;
    - ford (2,6) stops the dam stone being pushed against the west wall.
    - Inside the well-house, a wall under the pebble stops the only bridge stone being discarded.
  - **Bend deepened.** The elbow now carries a stone ("chip") that must be exported to bridge the bend's exit, so the box does two jobs.
  - **Ravine interior shrunk** to cut aimless rearrangement. Two-stone routing still required.
  - **Fork rerouted.** The fork-house's downward arch now matters for the water, and a culvert stops the box being nudged off-line after it wakes.
  - **Connected-system finale.** The crossing has no spring of its own any more: it is fed from the fork. The final flow to the heart now needs the fork-house, the pipe and the world box together (covered by a test).
  - **Model bug fixed.** Leaving the valley through its own edge (the world box) was reported as a plain walk. It now emits `exit`, so the reveal animates as a transition.
- **D12 Presentation choices.**
  - **Camera.** Orthographic, fixed 56° pitch, grid-aligned. Arrow keys mean what they show.
  - **Framing.** The camera frames the current clearing, with a focus veil softening its neighbours.
  - **Box interiors.** Rendered as timber rooms; daylit arches mark the exits.
  - **Box lids** show a live miniature of the interior, so nesting is always visible. The world box's lid shows the whole valley.
  - **"Outside" inset.** While inside a box, a small map of the surroundings with the box outlined.
  - **Heart landmark.** A dead stump at the heart grows into a blossoming tree on completion.
  - **Life spreads as a breadth-first wave** from newly flowing water.
- **D13 Splats used narrowly.** Spark draws a procedural splat backdrop (cloud sea and far mesas that green as pools wake).
  - Loaded lazily after the first frame, and skipped on low-power devices or with `?lite` / `?nosplat`.
  - Gameplay geometry is ordinary meshes (research verdict).
- **D14 Metaballs not shipped yet.** The planned MarchingCubes pools were deferred. Instanced lilies, kerbs and grow-ins read well, and a full-res metaball pass would cost mobile frame time for little legibility gain. Revisit if the art pass needs it.
- **D15 Finale choreography.** Revised 2026-10-30 after the user said the first version was confusing. It now runs about 20 s and follows the water itself. It is interruptible by any input, and the player keeps control afterwards.
  1. A bright pulse runs from the fork's spring along the river the player built: through the fork-house, down into the crossing, through the pipe in the cart, and to the valley's east edge.
  2. It falls off the edge.
  3. The camera glides to the stone box in the meadow. The box swells, and the pulse comes out of its arch.
  4. The final stretch of water fills in behind the pulse, down to the heart. The heart pool fills and the tree grows.
  5. The camera pulls back over the whole valley, then returns to the player.
  - **Narration:** short status lines name each beat ("The river you built runs from the spring…", "…off the edge of the valley…", "…and out of the stone box, which holds the whole valley.", "The heart of the valley fills.").
  - **Route source:** the pulse follows the model's actual supply route to the heart (`supplyPath`, covered by a test), so the camera can't show a route the rules didn't take.
  - **Removed:** the old dive into the box lid and the fade-to-white, which hid what happened.
  - **Reduced motion:** one sentence states the route, and the ending card appears at once.
- **D16 Old garden retired from the collection.** The collection now links `stillwater/`. The `garden-*` files and their tests remain on disk, untouched (not deleted, pending the user's word).
- **D17 Phone camera follows the player.**
  - **Why:** a whole 11-tile clearing on a 390 px phone makes tiles about 30 px.
  - **What:** below about 40 px per tile, the camera zooms to roughly 40 px tiles and follows the player, clamped to the clearing. On any axis where the clearing already fits, it stays centred.
  - **Desktop:** still frames the whole clearing.
  - **To reverse:** set `MIN_TILE` in `render.mjs` to 0.
- **D18 Touch layout.**
  - **D-pad:** shown whenever the device lacks a fine pointer with hover, or the screen is under 700 px wide.
  - **Status messages:** sit above it.
  - **Very narrow screens (≤380 px):** Rewind stacks above Undo/Redo so nothing leaves the screen.
- **D19 Accessibility scope.**
  - **Supported:**
    - keyboard play (every control is a real button);
    - live status text for blocked moves and woken pools;
    - spoken place names;
    - targets of at least 44 px;
    - reduced motion (no camera flight, instant ending card);
    - forced colours on the HUD and cards.
  - **Not done:** the 3D board has no text description, so a screen-reader user can't play. A described-board mode would be the next step if needed.
  - **Not tested:** real screen readers.
- **D20 Walls turn to glass where they would hide the ground** (user feedback 2026-10-31: walls at the bottom of the screen blocked the view).
  - **What:** the camera looks north, so any wall with open ground directly behind it keeps a solid footing (the lowest ~0.2 of its height). Above that it fades: about 20% opacity on its sides and 50% on its top.
  - **Why this over changing the perspective:** a higher or top-down camera would cost the diorama depth you chose in the interview. The glass keeps the walls' footprint and the grid readable while removing the occlusion.
  - **Scope:**
    - These walls cast no shadows and grow no trees.
    - Box interiors use the same rule.
    - Walls with wall behind them, and the far back walls, stay solid.
  - **Cost:** the frame-time sample is unchanged (headless emulation).
  - **To reverse:** in `terrain.mjs`, set `glass` to `false`.


## Phase 2: feel and beauty (2026-10-31)

The user's phase-2 interview chose:
- feel and beauty, at the same size;
- all four priorities (water, bloom, juice, sound);
- "crisp minimal before the restoration and painterly lush after, with storybook diorama throughout";
- a Russian-style gardener girl with long brown hair;
- gentle nudges, a wordless story, ambient adaptive music, and any well-licensed or procedural assets;
- an autonomous build.

They answered "Defaults. Go." to the ending plan, puzzle latitude, phone performance and hand-back questions.

- **D21 The ending is made legible, not redesigned.**
  - **Diagnosis.** The user said "nothing seems to happen" after the stone box. They were one push from the end, but the heart was never presented as the goal. The box looked immovable, and the water leaving its arch was invisible.
  - **Kept.** The puzzles and the 204-move witness are unchanged (all 7 clearings).
  - **Model.**
    - `water()` now also reports **spills**: water leaving an arch onto ground that can't carry it. They are derived and never stored, so the rules are unchanged.
    - A sealed box always reports `sealed` ("The stone box is sealed shut. Something far off holds it.").
    - Both are covered by tests.
  - **Presentation.**
    1. **Opening shot.** The camera starts on the dry heart ("The heart of the valley has run dry.") before settling on the player.
    2. **Pool tracker.** Six small pools plus a larger heart, top left, filling as pools wake.
    3. **Seal opening.** When basin 6 wakes, a short cinematic shows the water reaching the valley's east edge. Then the box's stone door crumbles as water pours out of its arch: spray, plus a spreading puddle.
    4. **Stone-box transitions** are long, legible match-cuts. Leaving the valley's edge pulls the camera back over the whole valley, then dives into the box's lid, which is a map of that valley, and out beside the box. Entering does the reverse. The first two passes also say it in words.
    5. **Finale.** It now starts at the stone box: the pulse leads the water from the box's arch to the heart. Then a petal burst plays, the girl celebrates, and a wave of life sweeps outward from the heart across the valley.
  - **To reverse:** any piece can be removed independently: `intro()`, `planSeal()`, the `wb` transition branch, and `#pools`.
- **D22 Gentle nudges** (user choice: "Gentle nudge").
  - **When.** Each unfinished clearing has two spoiler-light lines (in `world.mjs`). One shows after 45 s idle, or after about 140 moves without progress; the second only if the first didn't help.
  - **The heart.** Once the stone box is open and the heart is dry, the nudge comes after 25 s. The box also wobbles, and sparkles run up the dry channel to the heart.
  - **Never** during cinematics, dialogs or the title.
- **D23 The gardener.** A procedural miniature in `hero.mjs`, with no external model. Design:
  - **Look:** a long brown braid with a red ribbon, a red folk-print kerchief band, a white blouse, an embroidered red sarafan with a linen apron, felt boots, and a watering can.
  - **Motion:** walk with leg and arm swing; push with both hands forward; idle glances around; a spinning celebration jump at the finale. The braid swings on a damped spring driven by her velocity.
  - **Why procedural:** it matches the diorama style, adds no asset licensing, and every part can animate.
- **D24 Crisp before, painterly after** (user's art direction).
  - **Dry ground:** flat two-tone sand with sparse pebbles and the odd dead tuft. Cool, flat light.
  - **Living ground:** per-cell colour variation; dense, varied grass; flower drifts on stems; bushes along walls; mushrooms; butterflies; warmer, golden light.
  - **Finale:** the heart's wave of life sweeps over the whole valley.
- **D25 Water.**
  - **Channels:** a flow shader per cell, with streaks drifting downstream (direction derived from the model's water distances), shallow banks with a foam line, and glints.
  - **Pools:** deeper and stiller; they rise from below as they fill.
  - **Spills** at arches.
  - **Deferred:** metaballs (D14 stands; the flow shader carries the look).
- **D26 Juice** (`fx.mjs`: one particle system, one draw call).
  - **The girl:** squash and stretch on every step, with dust on landing.
  - **Stones** roll a quarter-turn per tile and keep their orientation.
  - **Boxes** tip as they slide.
  - **Every push** lands with a squash and a dust puff; filling a chasm gives a bigger thud and dust.
  - **Seal opening:** rubble burst. **Finale:** petal burst.
  - **Reduced motion:** none of these play.
- **D27 Sound and music** (all synthesized; no samples, so nothing to license).
  - **Music (ambient adaptive):** a quiet open-fifth drone while the valley is dry. Each woken pool adds a layer: pad, plucked balalaika-like ostinato, bell shimmer, second pad, melody fragment, bass. The finale resolves on a rolled D major chord and a bell melody.
  - **Effects by surface:** dry crunch, grass swish, plank knock, timber floor. Also a stone scrape, a box thump, a chasm thud, an arch whoosh, and a splash plus chime when a pool wakes.
  - **Mix:** a synthetic reverb and a compressor glue the mix together.
  - **Caveat:** none of this has been heard by a human yet.
- **D28 Quality tiers** (user default: scale by device).
  - **Tiers:** 2 is full; 1 is lighter ground detail and DPR 1; 0 also drops shadows and butterflies.
  - **Starting tier:** from a device guess (`?lite` forces 0; low core count or memory, or touch, starts at 1).
  - **Stepping down:** the renderer drops one tier after three consecutive ~2 s windows averaging over 24 ms a frame. It never steps back up within a session.
  - **Caveat:** headless emulation can't prove real-phone smoothness.
- **D29 Rewind puts a clearing back as it began** (user report, 2026-10-31).
  - **What happened.** After waking the crossing's pool, the user pushed the cart and pipe against the west wall. The river then never reached the valley's edge, so the stone box had no water to pour. Their save had been reloaded, and Rewind did nothing: the old Rewind only went back to "when you last arrived". After a reload that was the current state, because the log starts there. Undo was the only way out, and nothing said so.
  - **Fix.** Rewind now restores every object that began in the current clearing, or has strayed into it, to its authored start. That includes stones in chasms. Pools already woken stay awake, and the player stays put if they can, otherwise standing just inside the clearing's way in.
    - It is logged as `#clearing` and replays after reload, so it works on old saves.
    - It is undoable.
    - **Tests:**
      - the user's exact stranded crossing becomes solvable again;
      - rewinding any clearing at any point of the witness gives a valid state;
      - in the browser, strand, reload, rewind, reload and undo all work.
  - **Guidance.**
    - Each clearing's nudges now end with "Stuck? Rewind (R)…".
    - Once the seal is open, the game checks whether water still reaches the stone box. If not, the nudges say the river no longer reaches the east edge. A move that cuts it off says so at once ("The river no longer reaches the stone box. Undo, or Rewind (R) this clearing.").
  - **Follow-up (user: "Keep the puzzles, but rewind should work always, even if you already did a previous level").**
    - **Any clearing, any time.** Rewind works on any clearing, including finished ones, from anywhere.
    - **The button.** It is enabled whenever anything in any clearing has moved from where it began.
    - **Picker.** If only the current clearing has changed, R rewinds it at once. Otherwise a list asks which clearing, with the current one marked "(here)" and focused.
    - **The player** stays where they are; failing that, they go to the clearing's way in, then to the nearest free floor, so a rewind never fails for lack of a spot.
    - **Tests:** every clearing at the crossing checkpoint rewinds validly, keeps pools awake and leaves the other clearings alone.
    - **Browser:** the picker, rewinding the meadow from the crossing, reload and undo all work.
  - **Remaining (the puzzles are kept, by user choice).** A dead-end audit still finds stranded layouts: 1,790+ cart/pipe layouts in the crossing (search capped), and 41 stone-box layouts in the meadow. The puzzles were not redesigned to remove them (D21 kept the puzzles). Rewind is the recovery. Removing the dead ends would mean puzzle changes, which is a decision for the user.

## Golden Hills (2026-10-31)

The user asked for a rebrand to "Golden Hills" (the hills around the Bay Area), with an ending where Safii, an odd slime creature, hops out from under the tree and says hi, followed by a congratulation modal linking to safii.tz.mt. They also asked for deployment on goldenhills.tz.mt. The interview answers are in `memory/handoff.md`.

- **D30 Rebrand.**
  - **Names:** "Golden Hills" everywhere (title, page, help, credits, collection card).
  - **Folder:** `stillwater/` became `goldenhills/`. The save key is now `goldenhills:v2`; an old `stillwater:v2` save carries over.
  - **Places:** Foxtail Meadow, Well Hollow, Creek Bend, Willow Ford, Rock Gully, Twin Springs, The Crossing, and The Old Oak (the heart).
  - **Intro:** "Dry hills, and a small stone box." It names neither the real place nor where the ending happens, per the user. The opening line is now "The old oak at the heart of the hills is dying of thirst."
  - **Kept:** the puzzles and the witness are unchanged.
- **D31 The Golden Hills look.**
  - **Dry:** summer-gold grass in clumps, blond straw ridge tops and warm ochre rock. Coast live oaks dot the ridges, dark and dusty even when dry, because they're evergreen.
  - **After rain:** the neon emerald of the hills after a wet spell, with orange poppies, purple lupine, yellow mustard and white popcorn flowers. The oaks deepen to a dark green.
  - **The heart tree:** a gnarled, half-bare oak that grows into a great, wide coast live oak.
  - **Backdrop:** splat ridges in three layers, gold with dark oak clumps, turning green as pools wake. A coastal fog bank (splats plus a CSS fog layer) thins and burns off as pools wake, per the user's "clears as more levels get cleared".
- **D32 Safii.**
  - **Source:** the Safii lead advised against vendoring her real renderer, because it owns its own camera, renderer and transmission pass. Tommy left the choice to us ("whatever is gonna provide the best experience"). So `safii.mjs` is a look-alike in our scene, built from the Safii lead's design notes:
    - a lime jelly gumdrop with an inner stem and bubbles;
    - glossy black eyes right of centre with catchlights;
    - a sunflower on her upper left;
    - a mouth that opens when she talks;
    - features placed on the shell by raycast.
  - **Size:** about one tile tall, so she reads as the star.
  - **Sequence:** after the life sweep, the camera closes in by the oak. Safii hops out from under it in four squash-and-stretch hops with a green splash, and says "hi! thanks for the rain!" in a speech bubble that tracks her head. The bubble is mirrored in the status line for screen readers. Then the ending modal appears.
  - **Sound:** synthesized boings and a chirp. No voice clip, per Tommy.
  - **Credit:** none needed, per Tommy; the link is enough.
  - **Reduced motion:** the one-sentence finale mentions Safii and her line.
- **D33 Minimal ending modal** (user choice).
  - **Content:** a native `<dialog>` with "You brought the rain back to Golden Hills." and "Say hi to Safii at safii.tz.mt" (link, new tab), plus Keep walking (focused).
  - **Moved:** Start over and Credits moved into the help dialog, so the modal stays minimal.
- **D34 Deployment** (user: "Deploy when ready"; route from the tz.mt deploy lead).
  - **Route:** Cloudflare Workers static assets, deployed by this session from `goldenhills/` (`wrangler.jsonc`, `.assetsignore`, `_headers`).
  - **Excluded from the site:** the solver, the witness, tests and docs.
  - **Caching:** `/vendor/*` is cached immutable.
  - **Back link:** the "←" link back to the collection shows only when the game is served inside the collection.
  - **Order:** the site goes to `goldenhills.tzpersonal.workers.dev` first, then to goldenhills.tz.mt once the deploy lead reports the tz.mt zone active.
  - **Saves:** they don't carry between the two origins.
- **D35 Safii peeks instead of hopping** (user, 2026-10-31: "make it so that safii has no sunflower in this version, and that only her eyes poke out of the tree at the end").
  - **What:** `safii.mjs` is now just her eyes: two tall glossy black ovals with catchlights.
  - **Where:** they sit in a soft, dark gap in the front of the oak's canopy, turned toward the camera and drawn over the leaves.
  - **Sequence:** after the life sweep the camera closes in on the oak. The eyes pop open, blink twice, glance left and right, then say "hi! thanks for the rain!" in the bubble.
  - **Afterwards:** they stay in the oak and blink now and then.
  - **Sound:** a rustle and a chirp replace the hop boings.
  - **Removed:** the sunflower and the jelly body.
- **D36 No name, just the URL** (user, 2026-10-31: "it should not say "Safii" anywhere, but just present the url").
  - **Ending modal:** the line "Say hi to Safii at safii.tz.mt" is now just the link `safii.tz.mt`.
  - **Speech:** the status line and the reduced-motion text say "hi! thanks for the rain!" with no speaker name. The bubble already had none.
  - **Kept:** internal identifiers (`safii.mjs`, cue names) are not shown to players.
  - **Reverse:** restore the text in `index.html` (ending dialog) and the two `say` calls in `app.mjs`.
