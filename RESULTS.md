# Results and bounded verdicts

2026-10-28. **Human N=0. Cognitive fidelity UNVALIDATED / STILL UNTESTED.** Automated interaction is not human playtesting. Primary original-game interaction is limited to the Type Help retrieval trace in `EVIDENCE.md`; other selected comparisons have developer descriptions with explicit precision gaps.

## Golden Hills on sloprefinery.ai — 2026-11-02

The game is live at https://goldenhills.sloprefinery.ai, and the ending links to https://safii.sloprefinery.ai (D39). Worker version `2c44c7bc`, served through the deploy lead's Pages proxy.

**Verified (headless Chrome for Testing, public DNS):**
- the full witness playthrough on the new host reaches the ending dialog about 15 s after the last push;
- the ending link is `https://safii.sloprefinery.ai/`, and that site returns 200 with a valid certificate;
- no console messages, and every request goes to goldenhills.sloprefinery.ai;
- `/`, `app.mjs` and `audio.mjs` match local byte for byte;
- `/witness.mjs` is 404.

**Not verified:** this Mac's own resolver (it had cached "no such domain" from before the records existed; checked through 1.1.1.1 instead).

## Golden Hills: sound on first gesture, binaural beat — 2026-10-31

Sound now starts on the first key, click or tap (D37); before, a returning player heard nothing until the sound button was turned off and on. The music now has a 2.5 Hz binaural pair: 146.83 Hz in the left ear, 149.33 Hz in the right (D38).

**Verified (headless Chrome for Testing):** a returning player's save (title skipped) has no audio context before input; after one arrow key there is exactly one context and it is `running`. Exactly two oscillators feed the stereo merger: sine 146.83 Hz into the left input and sine 149.33 Hz into the right. 62/62 tests; 29/29 interaction checks; no console messages. Deployed as Worker version `2ab6b1bd` (live `app.mjs` and `audio.mjs` match local). **Not verified:** listening by ear (level, comfort, whether the beat is perceptible), real devices, iOS Safari's gesture rules.

## Golden Hills: no name in the ending — 2026-10-31

The ending modal shows only the link `safii.tz.mt`, and the speech has no speaker name (D36). The ending dialog appears about 15 s after the last push from the reset save (screenshot checked); 17/17 Golden Hills tests; 29/29 interaction checks, no console messages. Deployed as Worker version `b139dad5`: the live `/` and `app.mjs` match local byte for byte, `/witness.mjs` is 404, `/vendor/*` is immutable.

## Golden Hills: Safii eyes only — 2026-10-31

Safii no longer hops out (D35): only her eyes peek out of a dark gap in the old oak's canopy. They open, blink, glance about, and say "hi! thanks for the rain!" in the bubble; then the ending modal appears. This replaces the hop-out described in the next section.

**Verified (headless Chrome for Testing):** 62/62 tests; 29/29 interaction checks; from a save one move before the oak, the ending dialog appears about 15 s after the last push. The live site (Worker version `08aed85e`) serves byte-identical `safii.mjs`, `render.mjs`, `app.mjs` and `/` (SHA-256 checked). **Not verified:** real devices, a human's reaction.

## Golden Hills: rebrand, Safii ending and deployment — 2026-10-31

Stillwater became **Golden Hills** (D30–D34): Bay Area summer-gold hills that turn neon green after the rain, coast live oaks, fog that burns off as pools wake. At the end Safii, a lime slime, hops out from under the old oak, says "hi! thanks for the rain!", and a minimal modal links to safii.tz.mt. The folder moved to `goldenhills/` (old saves carry over).

**Verified (headless Chrome for Testing):**
- 62/62 tests;
- 29/29 interaction checks, including the ending link, its focus, and Credits and Start over from Help;
- the full ending sequence frame by frame: cues in order, Safii's hops and bubble, the modal;
- the touch run;
- viewports with no overflow or overlap;
- no console messages.

A per-move main-thread cost of about 1 ms median (16 ms max) showed that earlier slow scripted runs were harness round-trips, not the game. **Not verified:** real devices, audio by ear, and a human's reaction to Safii.

## Stillwater rewind fix — 2026-10-31

The user found their run stuck. After the crossing's pool woke, the cart and pipe sat against the west wall, so the river never reached the stone box. Rewind did nothing after a reload. Now Rewind puts the current clearing's objects back as they began, keeps woken pools awake, survives reload (logged `#clearing`) and is undoable (D29). The nudges point to Rewind, and a move that cuts the river off from the stone box says so at once.

**Verified:**
- 61/61 tests, including the user's exact stranded layout becoming solvable again;
- 25/25 interaction checks;
- a browser run that strands the boxes, reloads, rewinds, reloads again and undoes.

**Follow-up:** the user asked that Rewind work always, even on finished clearings. Rewind now offers any changed clearing from anywhere (a picker when more than one has changed). Verified:
- 62/62 tests;
- 25/25 interaction checks;
- touch and forced-colours runs;
- a browser run: the picker lists all seven, rewinding the meadow from the crossing works, and so do reload and undo.

**By user choice the puzzles are kept;** the dead-end audit finds 1,790+ stranded cart/pipe layouts in the crossing (search capped) and 41 stone-box layouts in the meadow. Rewind recovers all of them, but the puzzles still allow them.

## Stillwater phase 2: feel and beauty — 2026-10-31

**Why.** The user played the revised finale and found it "So confusing. I get into the box that brings me back to the beginning, but nothing seems to happen." They had stopped one push from the end, with the heart still dry. Phase 2 (their choices: feel and beauty, same size, autonomous) fixes legibility first, then the look, feel and sound. The decisions are in `stillwater/DECISIONS.md` D21–D28.

**What changed.**
- **Ending legibility:**
  - an opening shot of the dry heart;
  - a pool tracker;
  - a seal-opening cinematic (water off the east edge, then the stone box's door crumbles and water pours out);
  - long match-cut stone-box transitions through the lid map, with plain-words narration;
  - visible arch spills;
  - a `sealed` reason;
  - gentle nudges (box wobble plus sparkles up the heart channel);
  - a finale from the box's arch to the heart, a petal burst and a life sweep.
- **The girl:** a procedural Russian-style gardener with a braid on a spring.
- **Ground and water:**
  - crisp dry ground turning to painterly lush ground, with butterflies and warm light;
  - flow-shader water with banks and foam;
  - rising pools.
- **Juice:** particles, squash, rolling stones, impacts.
- **Sound:** adaptive layered music and surface-aware effects, all synthesized.
- **Quality:** tiers with frame-time step-down.

**Verified (2026-10-31, headless Chrome for Testing, emulation only).**
- 59/59 tests; `RESEARCH.md` hash unchanged.
- **Ending flow:** checked frame by frame.
  - Every narration cue fires in order.
  - The ending card appears.
  - The tracker reads "6 of 6 pools awake; the heart is full".
- **Idle at the stone box:** nudge 1 fires at about 25 s and nudge 2 at about 50 s.
- **Regression checks:**
  - 25/25 interaction checks;
  - touch run with reload and undo across it;
  - 5 viewports with no overflow, overlap or small targets;
  - reduced motion (ending at about 0.1 s);
  - forced colours.
- **Frame-time sample:** flat at 16.7 ms (vsync-capped, so it can't show headroom), including 4× CPU on a phone viewport.
- No console messages.

**Not verified:**
- the audio by ear;
- real phones or GPUs, and real tier step-down;
- whether a newcomer now reads the stone-box trick and the final push without help. **Human N=1, informal** (the user).

## Stillwater feedback fixes — 2026-10-30/31

The user played the rebuild. They found the rules readable, the stones useful, the crossing's difficulty acceptable and the phone controls fine. They found the finale confusing and said the front walls hid the puzzle.

- **Finale (D15 revised).** The camera follows the actual water route the model computes (`supplyPath`), from the spring through the fork-house and the pipe, off the valley's edge, and out of the stone box to the heart. It is narrated line by line.
- **Walls (D20).** Walls that hide ground behind them turn translucent above a solid footing.
- **Tests: 57 pass.** The new test checks the finale's route.
- **Browser checks after the fixes:** full keyboard runs (desktop and phone), the touch run with reload, 25/25 interaction checks, reduced motion and the frame-time sample all pass, with no console messages. This is headless emulation only.
- The user's verdict on these two fixes is pending.

## Stillwater rebuild (`stillwater/`) — 2026-10-30

This clean-room rebuild replaces v1 in the collection after the user's playtest feedback (see `VISION.md`). The decisions are in `stillwater/DECISIONS.md`. **Human N=0.**

**Build.**
- **Rules.** Pure deterministic rules (`model.mjs`) with these elements: pocket boxes with arches; nesting; a world box whose inside is the valley; derived water; latched pools; streams, chasms, culverts, bridges, gates and sluices.
- **Campaign.** Seven clearings around a dry heart, each 11×11 within a 31×31 valley.
- **Engine.** Three.js 0.186.1 and Spark 2.4.0, vendored with npm sha512 integrity checks and no package scripts. No build step, backend or analytics.
- **Persistence.** The action log persists in localStorage and is replayed on load, so undo and redo survive a reload.

**Mechanical checks.**
- **Tests: 56 pass.** That is the 45 existing tests plus 11 Stillwater tests, run with `node --test tests.mjs architectures.test.mjs ui.test.mjs garden.test.mjs stillwater/stillwater.test.mjs`.
- **Rules tests:** entry and exit, wrong-orientation push, nesting and self-refusal, the world-box exit event, and blocked reasons.
- **Witness route:** 204 moves, replayed with an immutability check and `validState` on every step.
- **Finale:** a static check that the finale needs the world box's arch; removing the fork-house, the pipe or the world box each stops water reaching the heart.
- **Authoring:** each clearing was solver-gated by exhaustive BFS with deletion tests (lab scripts kept outside Git). The staged campaign solve freezes other clearings' objects, so it is not a global shortest-path or forced-insight proof.
- `RESEARCH.md` hash is unchanged.

**Browser checks** used isolated headless Chrome for Testing 154 with real key, button and pointer events. Pointer events were synthetic `PointerEvent`s dispatched to the canvas.

*Full runs:*
- Keyboard runs at 1280×800 and 390×844 both reached all 7 pools awake.
- A touch D-pad run at 390×844 reloaded after the ford, undid 3 moves across the reload (cursor 93 → 90), redid them, finished, then walked after the ending.

*Interaction checks: 25/25 pass.* They covered:
- Tab order; walk prompt shown, then dismissed.
- Tap to step and tap-far auto-walk (moved no objects); tapping a box does nothing.
- Swipe; ambiguous diagonals ignored.
- "Step into the arch" prompt, and clicking it enters.
- Outside inset; Rewind and undoing Rewind; Help opens, closes on Escape and returns focus.
- Sound toggle; ending card; Credits; Start over and undoing it.
- Splat backdrop present by default, absent with `?lite` and `?nosplat`.

*Viewports* (1440×900, 768×1024, 390×844, 320×740, 844×390): no overflow, no visible control under 44 px, no overlapping or off-screen controls.

*Bugs found and fixed during these checks:*
- The phone follow-camera drifted off-centre.
- The status toast covered the D-pad.
- At 320 px, Rewind was off-screen.
- In forced colours, the primary-button text was unreadable.

*Other observations:*
- With reduced motion the ending card appears after about 0.1 s; otherwise after about 13.6 s.
- Forced colours: the HUD and cards adapt; the 3D canvas keeps its own colours.
- No console messages in any run.

**Frame-time sample** (headless emulation, not device evidence): median 16.7 ms and p95 ≤ 16.8 ms at 1280×800, at 1280×800 with 4× CPU throttling, and at 390×844 with 4× CPU throttling, both default and `?lite`. There were single 117–233 ms spikes just after load.

**Not verified:**
- real phones or GPUs;
- real screen readers (the canvas has no text description of the board — a known limitation);
- audio by ear;
- duration, difficulty curve, fun.

The design reviewer estimated 20–40 minutes for puzzle-literate players and 35–60+ minutes for newcomers. That estimate is unvalidated.

## Stillwater-v1 — complete continuous journey, 2026-10-29

Implemented at `/garden.html`, linked prominently from the collection. Three playable comparisons preceded selection: portable garden, connected springs, changing ground. Chosen campaign core: **portable spaces plus water-triggered irreversible-in-forward-play growth**, with unlimited recovery. Literal rule grammar, general portals and random puzzle generation omitted from the campaign. Existing study models and corpus remain unchanged; Archive remains retired.

**Delivered:** one persistent world, six sequential restorations connected by physical bridges, the same transported spring, an enterable larger interior, a second cargo-containing hollow, ordering/terrain problems, an explicit beginning, integrated restoration finale, overview, replay, tab-local resume, undo/redo and recoverable clearing checkpoints. Native Canvas projects original 3D volume/height geometry with seeded procedural plants, roots, water and particles. It is not a WebGL engine or a claim of photorealistic 3D. `GARDEN.md` is the human-facing handoff; researcher route is in `garden.test.mjs`.

**45 tests pass**: original 38 plus seven garden checks. Campaign trace contains **201 actual actions**, verifies validity/immutability on every transition and reaches all six restored cradles plus the real end condition. New checks cover prototype solutions, water/early-rooting counterexample, shifted exits, invalid actions, acyclic containment, undo/recovery, checkpoint eligibility, corrupt/disabled storage. Prototype explorations are deliberately capped at **12,000 discovered states each**: portable 7,079 expanded / 7 winning states encountered; connections 7,544 / 21; terrain 11,068 / 27. All discovered states checked; **none completed exhaustive exploration**. Counts are bounded observations, not global reachability proofs. Campaign route search also used local-region/movable-object restrictions and early stopping; its witness is replayed in the unrestricted game. No shortest-path, forced-insight or duration proof.

**Actual browser play:** all three comparison sketches completed through controls. Full campaign completed by keyboard, then by pointer/touch buttons at 390×844, including reload during the journey. Another full pass verified collection launch, checkpoint progress, ending, replay and undoing replay. Screenshots inspected across the journey; fixes included tiny initial camera scale, a weak direct-watering shortcut, one blocked transport exit, interior label collisions, mobile overview cropping, stale checkpoint behavior, invisible growth connections and an ending overlay that obscured too much of the payoff. These are designer observations, not participant findings.

**Quality checks:** 1440×900, 768×1024, 390×844, 320×740, 844×390; no horizontal overflow or visible buttons below 44×44px in checked layouts. Board and directional controls fit the ordinary phone viewport; very short/enlarged-text cases scroll rather than clip. Dialog Escape/focus, Board details, failed move feedback, undoable clearing recovery, reload and malformed-save fallback checked. 200% phone text enlargement reflow checked. Reduced-motion and forced-colors controls tested; the Canvas retains its factual color rendering with text-equivalent Board details. No console warnings/errors or non-local app requests in inspected action windows. Lab 30 alternating move/undo actions to next animation frame: **10.9–17.2ms**, not field INP or proof on real mobile hardware. Decorative water computation is cached per state; animation suspends while hidden/dialog-paused, with no gameplay timing dependence.

**Readiness verdict:** complete developer-tested build ready for the user's human playtest. **Human N=0**; enjoyment, discovery, duration target (15–45 minutes), screen-reader experience and actual-phone performance remain unvalidated. Particular open questions: whether carrying the spring feels cohesive or repetitive; whether water/rooting is learned without coaching; whether the hollow provides genuine reinterpretation; whether restoration earns its ending. No fabricated human testing. No dependencies installed, public uploads, commits, pushes or deployment. Local server remains running; owned verification browser contexts closed.

## Archive retired; Neo-Sokoban vision — 2026-10-29

Direct user feedback: Archive was “totally unplayable”; the user authorized complete redesign or removal. Retired from the collection, station switcher and direct player routes; source, historical evidence and mechanical tests preserved. This feedback supersedes any implication that automated correctness established practical usability. It is not a formal recruited/consented study session; research N=0 remains unchanged.

**38 tests passed**, including six-station availability and retired-route fallback. Running browser verified the six collection cards/switcher options, Archive full/study direct links returning the collection, mobile reflow, no console warnings/errors, and Tiles completion through keyboard controls. Owned browser closed; localhost remains running.

Interview decisions recorded in `VISION.md`: linear continuous 15–45-minute living landscape; elevated 3D diorama; deterministic embodied controls; desktop/mobile parity; authored puzzles/procedural visuals; environmental guidance; restoration culminating in one connected system. Three small prototype comparisons are proposed, not built. No consolidation of Tiles/Pocket/Drift has been implemented or validated yet.

## Spokes-v2 — answer-dependent directed second round

Supersedes the Spokes portion of the original studio-v4 results below. Round 1 accepts 8 or 40; after 8, forward arrows require 40; after 40, reversed arrows require 8. Same numbers, unknown moved to the target endpoint, exactly two rounds. Rotated/60 encounter removed. Explanations appear only after round 2; branch-specific checkpoints are isolated from old Spokes saves.

**38 tests pass**, unchanged counts for the other six stations. New exhaustive checker sets over 0–9999 are {8,40}, {40}, {8}. Checks cover invalid input, no completion before submission, branch changes, recovery, saved branch validation and old-snapshot rejection. Browser completed both branches in full/paired and normal/study modes; verified wrong answers (including former 60), all four arrow directions in accessible descriptions, two-level limit, locked direct round-2 navigation, reload, Back/Forward, Undo/Redo, Restart and changing the initial answer without stale second-round success. Screenshots inspected; no console errors/warnings or external app requests in checked windows. Human N=0; direction-guided revision/fun remain unvalidated. Owned browser closed; localhost left running.

## Studio-v4 redesign + Spokes — 2026-10-28

All six existing stations and the collection were redesigned; **Spokes** is a seventh, separately requested candidate based on the supplied image. Six original rule modules/encounters remain unchanged. `DESIGN.md` records current Apple/W3C/APG/NN/g sources, explicit design decisions and a reproducible acceptance checklist. No claim of measured Apple/Luma equivalence.

**Mechanical checks: 38 passed, 0 failed, 0 skipped**, `node --test tests.mjs architectures.test.mjs ui.test.mjs`. Original exhaustive counts/research hash/corpus IDs unchanged. New checks cover redo/branching/no-op, undoable restart, route parsing/round-trips, malformed snapshots, disabled/corrupt/quota storage, study/condition isolation, stripped Archive query logs and checked-report completion. Spokes enumerates integers 0–9999 for each of two encounters: one accepted integer each, not a unique-law proof.

**Actual browser use:** isolated Chrome for Testing 154.0.8037.57 via installed MCP 1.9.0. All **34** station/encounter/condition combinations completed through native controls: Panel 6, Archive 6, Bench 6, Tiles 4, Pocket 4, Drift 4, Spokes 4. Undo, Redo, Restart and undoing Restart checked after each. Separate checks covered tab-local navigation/reload, Back/Forward, dialog Escape/focus return, evidence frame focus, no report completion before Check, Run/Pause and cancellation on slot selection/undo. Keyboard-only completion passed for all seven stations, including native radio/tab behavior in Archive. Test harness label/quoting errors were corrected; failed attempts are not counted as passing results.

**Layout/accessibility:** all seven stations plus collection inspected at 1440×900, 768×1024, 390×844, 320×740 and 844×390 landscape, in light/dark. Checked visible buttons/radio faces ≥44×44 CSS px, no Panel hit-target overlap, no horizontal page overflow. Board + movement/primary controls fit ordinary 390×844 play; narrow/short screens scroll rather than clip. Six-slot tapes wrap at 320px. Archive uses section changes and roughly 1,100–1,400px mobile pages rather than the earlier ~4,400px document; it is not asserted to be a one-screen task. Screenshots of every station inspected. 200% text enlargement checked at desktop and phone; an initial phone overflow was fixed by wrapping header/recovery controls. Reduced-motion preference disables transitions. Forced-colors rendering checked, with light/dark specificity corrected. Real screen-reader testing remains outstanding.

**Color/performance:** categorical light/dark palettes passed the loaded validator against actual #ffffff/#212427 surfaces; redundant shapes/patterns retained. Computed text ratios: muted light 5.04:1, muted dark 6.24:1; accent light 5.30:1, dark 6.81:1; meaningful edge light 3.47:1, dark 5.01:1. Local Drift click-to-next-animation-frame check, 25 alternating move/undo actions: **1.4–17.7ms**. This is a narrow lab check, not paint-completion measurement, field INP, lower-end-device proof or a site-wide performance percentile. No console warnings/errors or external app requests in inspected action windows.

| Claim | Mechanical verdict | Human / fidelity verdict |
|---|---|---|
| Existing M1–M7 transition behavior | **SUPPORTED within previous bounds**, unchanged counts/traces | **STILL UNTESTED**; representation changes can alter salience. |
| M8 Spokes intended checker and rotated transfer | **SUPPORTED**: supplied 40, authored transfer 60; paired control preserves numbers/checker | **STILL UNTESTED**; alternate finite-pattern laws possible; not proven distinct from M1 induction. |
| Recovery, continuity, input accessibility | **SUPPORTED in automated/browser checks listed above** | First-use clarity, fun and perceived craft **UNVALIDATED, N=0**. |

Learnings: keep ambiguity in the puzzle, not controls; completed drafts must not bypass the explicit check; miniature rooms need an enlarged inspection option; tiny tapes must wrap rather than shrink targets. Spokes adds a compact hypothesis-selection candidate, not evidence that finite observations uniquely determine the intended formula. Study-mode explanations wait until transfer to avoid teaching the tested insight.

No corpus expansion, original-research rewrite, dependency install, account, analytics, public upload, commit, push or deployment. The user's localhost server remains running. Owned verification browser contexts closed; artifacts remain machine-local. The older sections below describe earlier versions, including historical stopped-server and persistence statements; they do not override this update.

## Visual-v3 expansion — 2026-10-28

Three additional architectures, six new encounters: Tiles (physical law editing), Pocket (portable nested space), Drift (growth/resource/routing constraints). Existing three stations retained. **32 tests pass** using `node --test tests.mjs architectures.test.mjs`. Full reachable-state searches completed for each new full/control encounter under a 100,000-state guard; counts and traces in `RESEARCHER.md`. No guard hit. Browser solved all new variants using arrow keys and pointer buttons, checked undo/reset, 390px mobile/1280px desktop light/dark, overflow and console/network. Screenshots inspected. Local server remains running; owned verification browsers closed.

| Mechanism | Mechanical verdict | Cognitive / fun verdict |
|---|---|---|
| M5 Tiles | **SUPPORTED** in limited grammar: moving tiles breaks class-wide solidity and reassigns goal subject; preset control solvable. | **STILL UNTESTED**; tiny routes may permit accidental wins. Exact Baba semantics not reproduced. |
| M6 Pocket | **SUPPORTED** for finite containment: moving a room preserves local contents, changes exits; nested transfer completes. Forecast changes information only. | **STILL UNTESTED**; not self-recursion/infinity; forecast ablates mental composition, not all spatial inference. |
| M7 Drift | **SUPPORTED**: small-ball growth destroys size-1 feasibility; snow-clearing routes work; fixed-size shortcut fails in full condition. | **STILL UNTESTED**; original growth evidence remains provisional. No humans evaluated interest or tedium. |

New learning: a shared grid does not make these mechanisms equivalent. Tiles changes transition predicates; Pocket relocates reference frames; Drift applies fixed rules that alter future resources. Rejected layouts demonstrate the value of checking both solvability and an informative ablation before polishing. Drift's final control has a real shorter strategy; Tiles' first control can share a shortest trace, so completion/time alone cannot identify law-editing insight. No global-minimality claim.

Primary evidence expanded only within frozen corpus: developer description/interview for rules and portable rooms; official Snowman animation frames inspected. Those frames showed dry-ground stacking, **not** growth/consumption; that comparison stays provisional. No commercial imagery copied into demos, no new corpus entries, no game installations. Human N=0; fun/cognitive fidelity unvalidated.

## Visual-v2 update — 2026-10-28

User required visual puzzles, rejecting the text/form presentation. Panel now renders shapes and barriers with diagrammatic examples. Archive now renders the incident, anonymous worker, roster, pictorial query cards and ordered before/fall/after mechanical evidence. Bench now renders the moving gripper, carried/delivered crates and editable icon loop. No commercial assets, dependency or puzzle engine added. This changes information presentation, not the candidate-world or transition rules; cognitive equivalence is still untested.

**Current checks: 17 tests passed**, unchanged exhaustive counts plus visual evidence gating across every clue subset and both cases. The initial scene omits named worker identity and unretrieved power/spring/timing facts. Browser suite solved all Panel/Archive condition combinations and transfers, Bench counterexample/repair/transfer, then checked pause, reset/edit/encounter cancellation, keyboard activation/focus, reduced-motion playback and reference-panel persistence. Desktop/mobile light/dark screenshots inspected. Two identity colors validated against both specified surfaces; shapes/patterns provide redundant encoding. No console errors/warnings or external app requests in checked windows. Human N=0; real screen-reader testing still unavailable.

The localhost server remains running at the user's request; owned verification browser contexts were closed. The following initial-version results are retained for provenance. Their text/form UI and stopped-server details describe the earlier pass, not the current visual interface.

## Initial-version verdict per mechanism

| Mechanism | Mechanical claim | Cognitive/original-fidelity claim |
|---|---|---|
| M1: fixed-law induction | **SUPPORTED within model:** counterexample invalidates global grouping; transfer invalidates adjacent-only separation. Three named models reduce 3 → 2 → 1 across recorded observations. Every board/control solvable; exhaustive counts below. | **STILL UNTESTED:** no human model revision/transfer observed. Witness evidence is pre-release description, not inspected release gameplay. Formal exclusion is narrower than its full experience. |
| M2: causal reconstruction | **SUPPORTED within model:** fixed clues and physical law isolate one of 12 candidate identity/cause worlds; either decisive clue omitted leaves ambiguity. Transfer reverses cause; supplied-finding control remains solvable. | **STILL UNTESTED:** no evidence humans infer rather than match words. Reliable deterministic accident records omit much of social/narrative reconstruction. Golden Idol/Obra Dinn fidelity remains provisional. |
| M3: evidence-address deduction | **SUPPORTED as available strategy; CONTRADICTED as mandatory strategy:** clue-guided address chain works; direct guessing/enumerating addresses can skip the worker record. Directory control removes that need without removing final inference. | **STILL UNTESTED:** Type Help's narrow retrieval behavior was actually interacted with, but no participant showed discovery equivalence. Query predictions, not success alone, are required. |
| M4: reusable process construction | **SUPPORTED within model:** one-output tape fails on repetition; restoration fixes it; longer reversed transfer needs revised return path. Automatic-return control removes that particular invariant. | **STILL UNTESTED:** program-boundary insight may be prior expertise or blind enumeration. One arm/tiny fixed tape omits originals' open-ended construction and optimization. |

## Mechanical verification

`node --test tests.mjs`: **16 passed, 0 failed, 0 skipped**. Node 26.0.0. `node --check app.mjs` passed.

| Exhaustive model | Bounds | Explored | Completed |
|---|---|---:|---|
| Panel 1 | 4 possible dividers, all subsets | 16; 1 accepted | Yes |
| Panel 2 | 7 possible dividers, all subsets | 128; 1 accepted | Yes |
| Panel transfer | 12 possible dividers, all subsets | 4,096; 1 accepted | Yes |
| Panel competing hypotheses | 3 explicitly named candidate laws | 3, then 2, then 1 consistent | Yes, only that hypothesis set |
| Archive, each of 2 cases | 6 identity permutations × 2 causal scenarios | 12 worlds; public 4, one clue 2, both 1 | Yes |
| Archive retrieval, each case | 4 sources × 3 places × 3 times | 36 addresses; 3 records | Yes |
| Gate physical law | 3 Boolean variables | 8 configurations; 4 open | Yes |
| Bench 1, each of 2 conditions | 5 commands, 4 slots | 625 tapes; 8 succeed | Yes |
| Bench 2 full / return | 5 commands, 4 slots | 625 each; 1 / 5 succeed | Yes |
| Bench transfer full / return | 5 commands, 6 slots | 15,625 each; 1 / 26 succeed | Yes |

Tapes simulated until error, quota or repeated finite machine state; maximum observed 18 steps. Exact recurrence bound and traces: `RESEARCHER.md`. 33,750 tape/condition pairs total. Counts include alternatives and failed constructions, not merely intended traces. No unbounded solvability/minimality/brute-force-immunity claim.

Checks also cover invalid inputs, immutability, transition ordering, undo/reset, duplicate records, report drafts surviving retrieval, evidence ambiguity, causal counterfactuals, all transfer/control configurations, corpus coverage and unchanged prior-research SHA-256.

## Browser verification

Actual localhost app served by Python 3.14.7, driven with installed chrome-devtools MCP 1.9.0 over stdio because that MCP was not registered in this project. Chrome for Testing 154.0.8037.57, owned isolated profiles. No install or harness changes.

- All three Panel boards in full/given conditions completed through divider controls.
- Both Archive cases in full/directory/finding conditions: unsuccessful query, clue chain, supported report, undo and retained draft checked.
- Bench one-shot counterexample, repaired full tape, automatic-return tape, both transfer conditions, rewind/undo/reset checked.
- Keyboard Tab/Space activation and visible focus inspected; forms also exercised with Enter in a separate mobile diagnostic. Native controls exposed in accessibility snapshots. Pointer controls used throughout.
- 390px mobile and 1280px desktop/dark screenshots inspected. Browser test exposed native select/fieldset minimum-width overflow; fixed using CSS `min-width: 0` / `max-width: 100%`, with full cause options repeated as wrapping visible text. Mobile width rechecked: document width equals viewport width.
- Persistent live status region avoids replacing the entire live-region node. **Real screen-reader announcements not human-tested.**
- No app console warnings/errors or non-local app requests in checked navigation/action windows.
- Earlier test attempts included assertion/option-label mismatches; corrected browser checks completed. These were not claimed as passing runs.

## What survived, what did not

**Survived mechanically, not yet cognitively:** contrast between local exclusion/global grouping; uncertainty reduced by independent evidence; a useful inferred address revealing further evidence; the difference between producing once and maintaining a repeating process. Each has a playable full/control comparison and transfer.

**Richer context still required:** actual-language semantic ambiguity, unreliable testimony, motive, world-scale cross-reference, emotional/narrative stakes, visual associations, recursive topology, multi-agent synchronization and cooperative communication. Removing them may remove the discovery, not just presentation. No claim that the three stations replace those experiences.

**Tentative collapses:** SpaceChem and Opus Magnum share persistent construction at a coarse level; formal rule induction appears across several otherwise different interfaces. These are evidence-backed candidates, not demonstrated human equivalences. Fixed-law application is retained inside Panel/Bench but is not falsely marketed as another distinct discovery.

**Merges rejected analytically, not empirically tested:** editable laws with fixed-law learning; causal history with board rearrangement; semantics with symbol matching; recursion/projection/image materialization under one “representation change”; knowledge-gated progression as its own reasoning faculty. Archive houses reconstruction and query selection together but keeps them experimentally separable.

**Minimality:** inspected removals are small model comparisons: one-output versus repeated quota; with/without decisive clue; with/without counterexample; full versus supplied law/finding/directory/return. No global minimality proof, no human evidence of necessity. Eight compact encounters across three stations, not a campaign or one demo per game.

## Remaining limitations and handoff

Original-evidence precision remains the largest gap, especially causal reconstruction and the exact repeated-production invariant in commercial originals. The corpus mapping marks every unavailable comparison rather than laundering criticism into gameplay evidence. The next useful work is unbriefed human sessions under `PLAYTEST.md` and targeted original-level evidence for claims that those sessions challenge—not more titles or visual polish.

No human recruitment, consent, recordings or participant logs exist. The protocol/template is runnable and blank. No telemetry, publication, commit, push, deployment, game purchase/install, guard/settings change or worktree created. Original `RESEARCH.md` preserved byte-for-byte. Owned browser sessions closed; local server stopped after verification. Scratch verification artifacts remain machine-local, outside Git.
