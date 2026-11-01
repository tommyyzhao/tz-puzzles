# Human playtest protocol

**Status: human N=0. Cognitive fidelity UNVALIDATED / STILL UNTESTED.** Agent/browser checks are implementation checks, never participants. Predictions and their timing are recorded in `STUDY.md`; all precede human playtesting. Do not show participants that file, source modules, solutions, this protocol's hypotheses, or comparison labels beforehand.

## Golden Hills — what to look for (2026-10-31)

Play at http://127.0.0.1:8765/goldenhills/ or https://goldenhills.tzpersonal.workers.dev. To jump to the last push, open http://127.0.0.1:8765/.local/reset-save.html (local only).
1. Do the dry hills read as golden Bay Area summer, and the woken ones as a wet green spring? Does the fog clearing feel like progress?
2. At the end, do you notice Safii's eyes in the oak before the bubble, and read them as a creature?
3. Is the ending modal's timing right (not too soon after "hi"), and does "Keep walking" feel natural?

## Stillwater phase 2 — what to look for (2026-10-31)

Play from a fresh start (Start over, or clear site data). With sound on if possible.
1. Did you understand from the start that the dry heart in the middle was the goal?
2. When the sixth pool woke, did you see what changed at the stone box?
3. After walking off the valley's edge, was it clear where you'd come out, and why?
4. Did you find the last push yourself? If you got a hint, was it timely and not too explicit?
5. How do the girl, the water, and the dry→lush change look and feel? Anything cheap or distracting?
6. Sound: does the music grow pleasantly, and do the effects feel right (or annoy after a while)?

## Stillwater rebuild — playtest (2026-10-30)

Open `http://127.0.0.1:8765/stillwater/` in a fresh private window. Normal mode saves progress and undo history on this device. `?study` turns saving off, so a reload starts over. Add `&lite` to skip the splat backdrop. There is no logging or upload.

Don't read `stillwater/witness.mjs`, `stillwater/DECISIONS.md` or `memory/` beforehand; they contain spoilers.

**Neutral task:** "Explore this valley and see whether you can bring it back to life. Say what you expect before you try something new. You can undo anything, and stop at any time." Teach controls only if asked, and note that you did.

**Record:**
- **Controls:**
  - time to the first deliberate push and the first time they enter a box;
  - whether arrows, tapping or swiping feel natural with this camera.
- **Rules learned unaided:**
  - arches enter while solid faces push;
  - the boxes' facing matters;
  - water runs through boxes;
  - a running stream blocks you.
- **Per clearing:**
  - stuck points, and whether Undo or Rewind gets them out;
  - whether stones feel like tools or clutter.
- **Insight:** whether they predict or explain the stone box before the finale.
- **Ending:** whether it feels earned rather than sudden, and whether they keep walking afterwards.
- **Overall:** total time, breaks, where they quit, and anything that read as busywork or a UI problem rather than puzzle difficulty.

**Developer questions for the user's own session:**
1. Does the doorway-and-wall rule read without explanation?
2. Is the crossing too hard as the first nesting puzzle?
3. Does the finale land?
4. On phone, do tap-to-walk and swipe together feel right?

## Stillwater-v1 — continuous journey playtest

Open `/garden.html?study=1` in a fresh context after consent. Use the same anonymous/minimal local-note policy below. The full journey and three comparison prototypes now exist; the earlier interview's not-built statements are historical. No participant logs are collected automatically.

Neutral task: “Explore this garden and see whether you can bring it to life. Say what you expect before trying something unfamiliar. You can undo, recover or stop.” Teach controls only if requested; record that intervention. Do not explain watering/rooting, the portable outlet, or later puzzle solutions. Ask about prior Sokoban/impossible-space experience before play. Do not show prototype solutions before the journey.

Record: time to first intentional push; movement-direction confusion; entering/exiting predictions; first recognition of water-driven rooting; evidence for route planning rather than random pushing; use/confusion of Undo/Restore; whether transporting the spring becomes repetitive; camera/mobile readability; completion/abandonment; interpretation of the finale. Observe each local discovery and the connecting travel, not just total completion. The 15–45-minute target remains an unvalidated design target. Offer a break or stopping; no deadline is part of the game.

Pre-human hypothesis: repeated use of one portable spring supports a coherent model; water-induced immobility adds meaningful ordering; the hollow requires applying the same exit relation to cargo, not only to water. Contradictions include memorized actions, accidental wins, no transferable explanation, UI-driven failure, or recovery erasing progress unexpectedly. Report these without rescuing the design through coaching.

The three prototype URLs in `GARDEN.md` can be evaluated separately with counterbalanced order and comparable neutral tasks. No causal comparison or preference ranking is established by the developer's own browser playthroughs. Real device and screen-reader testing remain outstanding.

## Archive retired — 2026-10-29

Archive is no longer offered in the collection, station switcher or direct player routes, following the user's report that it was unplayable. Do not assign its historical tasks/URLs below to new participants. Six stations remain playable; the Archive protocol is retained for provenance only. This direct feedback is not counted as a formal consented study session. Neo-Sokoban interview decisions are in `VISION.md`; the subsequent Stillwater implementation is described above and in `GARDEN.md`.

## Current interface: studio-v4

Record **studio-v4** in every new session. Seven stations, including the user-supplied Spokes candidate; six existing rule models unchanged. Redesigned collection, controls, evidence workspace, recovery and tab-local continuity are new presentation variables. Add `&study=1` to every assigned station URL below; it disables gameplay checkpoints, isolates condition state and withholds Spokes' worked explanation until transfer is complete. Use a fresh private context per participant, not merely Restart.

First-use UX tasks, separate from reasoning: choose the assigned puzzle; discover its controls without coaching; undo and redo a mistake; inspect/revisit a record; pause a running program; switch away and return without losing work; continue after success. Record attempted actions, missed controls, scrolling, focus/room confusion and recovery. Distinguish interface friction from puzzle difficulty. Praise of appearance does not establish usability. Do not require all tasks from every station or spoil a protected transfer.

**Spokes:** ask familiarity with this exact image or number puzzles before play. Full `/?station=spokes&study=1`; comparison `/?station=spokes&condition=paired&study=1`. Observe their proposed relationship and prediction before Check; accept notes of coherent alternate rules. Record **Spokes-v2**: the first accepted answer selects the direction of the second round's arrows on the same numbers; the former rotated transfer is removed. Continue to round 2 before any debrief/explanation. Record whether they revise their answer from the arrows, merely alternate guesses, or explain multiplication/division. Do not pool these observations with the former transfer design. Do not mention the supplied answer, opposite pairs or multipliers. Paired control removes pair-finding only. Memorized answers, blind guesses and post-hoc explanations do not count as discovery. Keep this candidate separate from commercial-game fidelity claims.

Historical visual-v3 introduced the following expansion; do not pool versions. Added Tiles, Pocket and Drift; each has two encounters, second is transfer. Their detailed predictions were recorded before humans but after initial mechanical checks; no claim they preceded all coding. Do not pool them with earlier-version observations.

Earlier visual-v2 introduced the following presentation. Panel uses circle/diamond tokens and barriers; Archive uses portraits, appointment/address cards and ordered mechanical snapshots; Bench shows a gripper with an icon tape. Text-only v1 was rejected by the user, not evaluated by humans. Do not combine observations across versions. Record misunderstood symbols/portraits, use of the gate reference, and Run versus Step separately. Accessible descriptions must convey the same revealed facts, not solutions.

## Setup

1. Run `python3 -m http.server 8765 --bind 127.0.0.1` from this directory. Open the assigned player URL below. Use a fresh private browser context per participant; do not use a browser with researcher pages open.
2. Ask consent: “May we take anonymous notes about your actions and explanations? No name is needed; nothing is automatically recorded or uploaded. You may stop at any time.” Separately ask permission before screen/audio recording. If declined, play without recording or withdraw, as they prefer.
3. Record only a locally chosen anonymous ID, consent scope, prior familiarity, assigned condition and qualitative observations. Do not record names, contact details, exact demographics or unrelated screen contents. Keep participant files **outside the repository**; never commit/upload them. Agree a local deletion date before recording. Study mode has no gameplay persistence/analytics/export. Normal play stores a functional checkpoint in this tab; never use that mode for an unbriefed participant.
4. Ask prior experience: games in this station's comparison family; programming experience for Bench; logic-grid puzzles for Panel; detective/evidence games for Archive. Record familiarity before play; familiarity is a moderator, not an exclusion invented after results.
5. Give neutral instructions: **“Complete the task shown. Say what you expect before trying something, and explain what changed your mind. You can undo, reset, or stop. There is no speed target.”** Do not mention intended mechanisms, wrong models, source games or solutions.

## Assignment and contamination

Prefer **between-participant** condition assignment within each station. Same person must not see both full and ablated versions of the same content before transfer; learning cannot be undone by reset. Alternate assignment in arrival order, e.g. full/given/full/given for Panel; full/directory/finding for Archive; full/return for Bench. Record sequence. With a small convenience sample, balance known expertise if feasible; do not call the result randomized unless it really was.

Participants may try different stations; rotate station order (Panel–Archive–Bench, Archive–Bench–Panel, Bench–Panel–Archive). Record fatigue and carryover. If only one participant is available, use full versions and report a case observation, **not an ablation comparison**. Optional control exposure afterward is exploratory and contaminated; keep separate.

URLs (researcher chooses; do not explain condition names):

| Station | Full | Comparison |
|---|---|---|
| Panel | `/?station=panel` | `/?station=panel&condition=given` |
| Archive | `/?station=archive` | `/?station=archive&condition=directory` or `/?station=archive&condition=finding` |
| Bench | `/?station=bench` | `/?station=bench&condition=return` |
| Tiles | `/?station=tiles` | `/?station=tiles&condition=preset` |
| Pocket | `/?station=pocket` | `/?station=pocket&condition=forecast` |
| Drift | `/?station=drift` | `/?station=drift&condition=fixed` |

For the new stations, use separate full/control participants when possible. Rotate Tiles–Pocket–Drift, Pocket–Drift–Tiles, Drift–Tiles–Pocket; do not require all six stations in one sitting. Ask Baba/Parabox/Snowman familiarity beforehand. Tiles preset changes starting laws, Pocket forecast supplies representation information, Drift fixed removes growth: these are different interventions, not one pooled difficulty manipulation. Before encounter 2 ask what they expect, without teaching the discovery. Afterward ask which part they wanted to experiment with again; voluntary replay is qualitative interest, not proof of fun.

## Procedure

1. Start encounter 1. Observe without coaching. Ask “What do you expect?” before an uncertain action; “What makes you think that?” after a stated hypothesis. Avoid repeated prompts that themselves suggest a new strategy.
2. Record actual actions, predicted outcomes and explanations, including wrong models, arbitrary guessing, systematic enumeration, confusion and accidental success. Completion alone is insufficient.
3. Panel: after encounter 1, ask for a rule in their own words. Let them try encounter 2. Do not point out the disconnected circle regions. Bench: after first product, let them try encounter 2 without mentioning repeatability. Archive: ask what record they expect at a proposed address without suggesting which address to use.
4. Before final/new encounter, record their current explanation and prediction. Then switch to it. **Do not give a worked solution, summarize the intended rule, or reveal a control until transfer is complete.** Panel/Bench transfer is encounter 3; Archive transfer is encounter 2.
5. After transfer, ask: “What stayed the same? What changed? Would your earlier approach still work? Why?” Record verbatim when practical. Wrong but coherent explanations matter.
6. At 10–15 minutes per station, offer stopping or continuing, never force a time limit into the mechanic. Record abandonment, fatigue, requested hints, and every intervention. If helping with controls, state the exact help; distinguish it from strategy coaching. Any strategy hint contaminates subsequent discovery and transfer; retain the record but label it assisted.
7. Debrief only afterward. Ask whether anything felt arbitrary, whether they guessed, and whether an outside strategy/prior game supplied the answer. Reconfirm retention consent. Stop any owned recording and delete on the agreed schedule.

## Observables (not pass/fail participant grades)

- **Panel:** global grouping prediction; counterexample response; exclusion explanation; novel partition justified without feedback. Given-rule comparison should lack an actual rule revision; it may complete faster for trivial informational reasons.
- **Archive diagnosis:** lever-blame hypothesis versus evidence-based mechanical explanation; appropriate reversal in transfer. Finding comparison bypasses diagnosis but still requires identity work.
- **Archive retrieval:** evidence-backed prediction of query result versus enumeration/lucky address; next address chosen from learned identity. Directory comparison allows browsing without that inference. Query count alone is not cognitive evidence.
- **Bench:** first-output success mistaken for reusable success; boundary-state explanation after failure; correct return path for reversed longer track. Return control can finish without position-restoration insight.
- **Tiles:** predict which objects change before pushing a rule tile; transfer edits a different subject/property, not blind repetition. Preset can solve without authoring rules.
- **Pocket:** predict crate's exit after moving its container; distinguish nesting inference from simply following the forecast. Record confusion about active room and explicit Enter.
- **Drift:** preserve the small ball by planning snow clearance and final large-ball position; distinguish that from random pushing/undo. Fixed-size control admits short routes that fail with growth.
- **Disconfirmation:** success by brute force without understanding, no model revision where predicted, transfer copied blindly, misunderstanding caused by our UI, or controls demanding the same supposedly removed inference. Note these rather than rescuing the hypothesis with coaching.

## Blank recording template

Copy this section to a private local file **outside Git**, only after consent. Do not put participant logs in this document.

```text
Anonymous ID:
Date (optional):
Consent: anonymous notes / separate recording permission / retention deadline:
Prior game, logic and programming familiarity (self-report):
Station order:
Interface version / station / condition / encounter:
Assignment method; any imbalance:
Neutral instruction delivered exactly? Deviations:

Observation | Action/query/tape/partition | Prediction BEFORE | Observed result |
Explanation AFTER (verbatim if possible) | Alternative strategy | Confusion
___________ | _________________________ | _________________ | _______________ |
_______________________________________ | ____________________ | ___________

Initial stated model:
Evidence noticed / ignored:
Revision, if any (participant's words):
Accidental success / enumeration / prior knowledge:
Control usability issue:
Hints/interventions (exact words, time/encounter):
Abandonment/failure/choice to continue:
Pre-transfer explanation/prediction:
Transfer actions and explanation:
Contamination (prior condition/solution/familiarity):
Post-task comment:
Mechanism prediction supported / contradicted / unclear, with observation:
Competing explanation:
Consent reconfirmed; recording stopped; deletion due/completed:
```

## Reporting

Tiny samples yield qualitative observations, not significance tests or causal proof. Report N per condition, familiarity, missing/abandoned sessions, interventions, contradictory cases and confounds. Separate “our task prompted a revision” from “the original's essential discovery survived.” The latter requires credible original evidence and comparable participant accounts, currently missing. No humans available is an honest complete protocol delivery, not a fabricated result.
