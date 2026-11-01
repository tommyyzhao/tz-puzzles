# Solutions and mechanical annotations — spoilers

Do not serve this to an unbriefed participant as instructions. `STUDY.md` holds pretest predictions; `PLAYTEST.md` holds consent/procedure. These are original encounters, not copied commercial levels.

## Studio-v4 additions

Existing six model traces/counts below are unchanged. New controls: native Archive tabs/radios and evidence stepper; Pocket contextual **Enter room A/B**; persistent history with Redo and undoable Restart. Normal checkpoints survive reload in this tab; undo stacks remain memory-only. `study=1` bypasses persistence, isolates conditions, hides comparison labels, and withholds Spokes' explanation until transfer.

**Spokes-v2:** round 1 accepts **8 and 40**. After 8, round 2 uses the same numbers with arrows 5→10, 6→18, 7→28, 8→?; answer **40**, multipliers 2/3/4/5. After 40, every arrow reverses: 10→5, 18→6, 28→7, 40→?; answer **8**, divisors 2/3/4/5. The unknown moves to the former 8 endpoint in that branch. Exactly two rounds; the former rotated/60 level is removed. `paired` exposes the same directional pairs. Explanations appear only after the second round. Exhaustive 0–9999 checker acceptance sets: {8,40}, {40}, {8}; no unique-law proof. Changing the first accepted answer clears stale second-round completion; restart preserves its branch. Human N=0; outside the frozen commercial corpus.

## Visual-v2 encoding

Internal A/B symbols below render as circle/diamond shapes, with distinct outlines and patterns. Divider IDs/solutions unchanged. Archive receipt is a portrait with badge 1; worker clue is a pictorial address; controller clue is three ordered snapshots. Initial anonymous worker and concealed components prevent early answer leakage. Cause/identity models unchanged. Bench slot selection plus command icons edits the same tape; Run shows discrete `benchStep` states, Pause freezes them, edits/undo/reset/encounter changes cancel playback. Command names and all solution traces below still apply.

## Panel

Divider IDs are `edges(panel)` order: for each cell in row order, right edge then down edge if present. All cells/edges are visible; IDs are implementation references, not secret player instructions.

| Encounter | Accepted divider IDs | All subsets enumerated | Accepted within budget |
|---|---|---:|---:|
| 1 | 0, 3 | 16 | 1 |
| 2 | 0, 2, 5, 6 | 128 | 1 |
| 3 (transfer) | 0, 5, 6, 9, 11 | 4,096 | 1 |

- Rule: no connected region mixes A and B. Dots contribute no symbol.
- Encounter 2 divides three columns. The two A columns are necessarily disconnected. Global grouping cannot explain this accepted partition.
- Transfer's empty cells require connectivity reasoning, not placing a wall only at every immediately adjacent A/B pair. Research-only `lawModels`/`consistentLaws` explicitly enumerate three competing hypotheses: regional exclusion, global grouping, adjacent-pair separation. Intro leaves 3; accepted counterexample leaves 2; rejecting transfer walls `[5,6,9]` leaves 1. This covers those named models only, not every possible human theory.
- Given-law control uses exactly the same valid partitions. Removes discovery only; application remains.
- Exhaustion complete over every subset, including over-budget subsets (rejected). This proves uniqueness **only for these fixed boards/budgets**, not that a human discovers the rule. Budget and binary feedback support brute force.
- Minimality comparison actually checked: intro permits one A group; every accepted counterexample has two. Removed island, continuous drawing, animation, travel. Removing the continuous-path constraint changes the puzzle family; fidelity is deliberately bounded.

## Archive

| Case | First record | Inferred worker record | Controller record | Supported report |
|---|---|---|---|---|
| 1 | Ari / Office / 09 | Bo / Dock / 10 | Controller / Hall / 11 | Bo; power failed with spring missing |
| 2 (transfer) | Fox / Desk / 15 | Dee / Lift / 14 | Controller / Bay / 13 | Dee; powered lever pulled before fall |

Badge 3 known publicly; receipt identifies badge 1; elimination identifies badge 2. Scene supplies their place/time. Worker record supplies controller location/time. Controller facts discriminate cause.

Finite model: six identity permutations × two explicitly announced causal scenarios = 12 worlds. Public badge clue leaves 4; receipt alone 2; controller alone 2; both 1. Each case has 4 sources × 3 places × 3 times = 36 addresses, exactly 3 populated. Physical law also checked on all 8 power/spring/lever booleans; four open the gate. World model restricts alternatives to the two specified report scenarios, not all real-world accident explanations.

**Counterfactuals:** case 1 with spring restored stays shut; pulling an unpowered lever does not change the result. Case 2 without lever actuation stays shut. Facts are reliable by stipulation, not inferred witness credibility. Thus this diagnoses a small deterministic mechanism, not human motive or legal responsibility.

**Known shortcut:** enumerate the 36 addresses or guess controller address. Receipt + controller suffice; worker note is not logically necessary. The UI does not impose a fake unlock requiring the intended path. This is deliberate; record query predictions to distinguish inference from scanning. Final acceptance requires evidence support, so blind report guessing before obtaining decisive clues cannot reveal the answer. It still gives coarse information once partial evidence exists.

`directory` exposes populated addresses, leaving causal/identity deductions intact. `finding` exposes cause, leaving identity/address work intact. Both controls remain solvable, same form and clues. They are different interventions and must not be pooled. Undo removes visible records/history but cannot erase a human's memory. Reset is not a cognitive washout.

## Bench

| Encounter / condition | Tape slots | All tapes | Successful tapes |
|---|---:|---:|---:|
| 1 full | 4 | 625 | 8 |
| 1 return | 4 | 625 | 8 |
| 2 full | 4 | 625 | 1 |
| 2 return | 4 | 625 | 5 |
| 3 full | 6 | 15,625 | 1 |
| 3 return | 6 | 15,625 | 26 |

- Encounter 1: `take, right, drop, wait`. Quota stops execution at the first successful drop; later invalid instructions can therefore count as one-output solutions. This is intentional: a one-output task does not test repeatability.
- Encounter 2 full: `take, right, drop, left`. Prior `wait` tape delivers once, then fails at the next `take` because arm remains at output. Return fixture makes the `wait` tape work.
- Transfer full: `take, left, left, drop, right, right`. Longer track, reversed direction. Position must be restored before next pass. Return control can use `take, left, left, drop, wait, wait`.
- Exhaustive search ends on error, quota, or repeated `(position, holding, program counter, produced)` state. Tape fixed; no hidden random state. Finite per-tape bound: `track length × 2 × slots × quota`; ticks are intentionally excluded from recurrence since they cannot affect transitions. All 33,750 tape/condition combinations terminate within that proof procedure. Maximum simulated steps: 18. UI run button's separate cap is 60 and can be resumed.
- This is a construction, but a highly constrained one. Unique full-condition tapes limit the open-endedness of Zachtronics originals. Cost/area/speed trade-offs and multi-arm synchronization are not demonstrated.
- Minimality comparison actually checked: quota 1 admits non-repeating constructions; quota 3 rejects them. Restoring position is sufficient here, not a universal program invariant. No globally smallest design claimed.

## New architectures — visual-v3

`node --test tests.mjs architectures.test.mjs` checks all six stations. New search key is the full JSON model state (no move counter or UI-only data); breadth-first expansion stops at victory exactly as the game does. Hard guard 100,000 discovered states per encounter/condition; all completed below it. This is complete for these fixed finite boards, not arbitrary levels. Every visited state is checked for floor/occupancy invariants, and containment is checked acyclic. Intended traces replay against frozen inputs; undo/reset verified.

| Station / encounter | Full states | Control states | Shortest full / control moves |
|---|---:|---:|---:|
| Tiles 1 | 36 | 78 | 4 / 4 |
| Tiles 2 | 11 | 11 | 4 / 2 |
| Pocket 1 | 121 | 121 | 8 / 8 |
| Pocket 2 | 366 | 366 | 10 / 10 |
| Drift 1 | 36,179 | 22,587 | 16 / 7 |
| Drift 2 | 36,175 | 22,583 | 20 / 8 |

Solutions, using U/R/D/L for directional actions; E-U/E-L mean the explicit Enter control:

- **Tiles 1:** R U R R. R R initially attempts the blocked crystal; R U moves SOLID out of the rule, affecting all crystals. Preset can use the same shortest trace accidentally, so equal completion time would not show rule editing.
- **Tiles 2:** U R R D. First push shifts the star subject away and crystal subject into the goal sentence. Preset: R R. General grammar, diagonal reading, object transformations absent.
- **Pocket 1:** R R R D R E-U U U. Move the cargo-containing room, enter its bottom edge, push cargo through its top to the yard goal.
- **Pocket 2:** D D D R D E-L L E-L L L. Relocate outer room; enter, push the inner room to the left edge, enter it and project cargo across both containing boundaries. Forecast uses identical traces/states; only destination overlay differs. Loading cargo is not required by these encounters: it begins inside.
- **Drift 1:** D R U R U D L L U R R L U R R D. Fixed-size: R R U L U R R. The control trace grows the small ball in full mode and cannot satisfy size 1.
- **Drift 2:** R D L D L R U U L D D D L D R U U U L D. Fixed-size: D D U L D R D L.

Growth is monotone in forward play; once the sole small ball exceeds size 1, that goal is impossible within this model without undo/reset. Tests verify the first wrong push, consumption and cap, not a claim that humans must make that mistake. Earlier trial layouts were discarded after no-solution transfer or weak ablation distinction. Selected layouts are original, not copies of source levels.

## Shared correctness

`node --test tests.mjs` checks pure transitions, frozen-input immutability, invalid inputs, undo/reset, correct/incorrect reports, duplicate retrieval, clue omissions, bounds, transfer, controls and preservation of the original research hash plus all corpus IDs. No package manager or test framework.

Historical visual-v3 behavior: history stored complete snapshots in memory without persistence. Studio-v4 supersedes this: current validated checkpoints persist in tab-local sessionStorage outside study mode; history stacks remain memory-only. No telemetry, external assets, account or service. Researcher modules/solutions are not security secrets: a participant inspecting source can spoil the study. Protocol prevents leakage by procedure, not obfuscation.
