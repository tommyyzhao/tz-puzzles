# Study design — researcher only; spoilers

Design and observable predictions written **before demo implementation or human testing**, 2026-10-28. Human **N=0**. These are proposed reductions, not established cognitive equivalences. Evidence boundaries: `EVIDENCE.md`; closed corpus: `CORPUS.md`; complete mapping: `COMPARISON.md`.

## Studio-v4 redesign and Spokes candidate — 2026-10-28

Recorded after implementation/mechanical checks, before any human testing. Earlier specifications below remain historical. Studio-v4 changes presentation and continuity, not the six existing transition models: collection/direct routes, stable controls, board-adjacent recovery, redo, undoable restart, compact Archive tabs/evidence viewer, contextual Pocket entry, revised original graphics and light/dark design. `DESIGN.md` records primary UI guidance and its limits. Normal play uses validated tab-local checkpoints; `study=1` isolates ephemeral condition state. Never use normal-play completed levels for unbriefed transfer.

**UX predictions:** unbriefed players can locate a move/action, recover a mistake, distinguish Bench selection from execution, inspect Archive evidence, and return to work without losing it. Separately record control confusion, excessive scrolling, missed evidence, mistaken room context and keyboard focus loss. Visual praise is not evidence these tasks succeed. N=0.

### M8 candidate — Spokes: discovering a spatial numerical relationship

**Spokes-v2 supersedes the original package below.** Per the subsequent direct user request, round 1 accepts **8 or 40**. Round 2 reuses the same numbers, not the rotated/new-number transfer: after 8, arrows run 5→10, 6→18, 7→28, 8→? and only 40 is accepted; after 40, arrows reverse, the unknown moves to the old 8 position, and 40→? accepts only 8. Exactly two rounds. The paired condition follows the same directions. Explanations are withheld until round 2 is solved in all modes. Round 2 requires a checked first answer, retains that branch across reload/restart, and resets when the first answer changes. Old Spokes snapshots are version-isolated.

This now probes responding to added direction information, not numerical transfer. Pre-human prediction: a player can revise their previous answer using arrow orientation and explain multiplication versus division. Arbitrary alternation/guessing remains a competing explanation; first-round 8 is accepted by user stipulation, not presented as a unique inferred law. Enumerating 0–9999 gives acceptance sets {8,40}, {40}, {8}. Human N=0. Historical specification follows for provenance.

Evidence: the user supplied an eight-spoke image and stipulated 40 as the intended answer, 2026-10-28. **DOCUMENTED user intent; INFERRED reconstruction of the law**, not firsthand commercial gameplay. No corpus title/ID added. Original image positions are top 5, NE 6, E 7, SE 8, S 10, SW 18, W 28, NW unknown. The rendered diagram is newly drawn SVG, not an uploaded image asset.

State: immutable visible numbers/positions, editable bounded whole-number answer and check feedback. Legal actions: draft 0–4 digits, submit, undo/redo/restart. Draft clears feedback; submit accepts the stipulated number. No timer, hints before success or automatic sequence completion. Goal: fill the unknown using an inferred relationship. Known: seven numbers and geometric incidence. Unknown: which relationship to privilege.

Intended discovery: numbers across the center form 5×2=10, 6×3=18, 7×4=28, 8×5=40. Plausible wrong model: one ordinary clockwise arithmetic sequence or a constant multiplier for all pairs. Constant doubling is contradicted by 6/18; variable adjacent differences do not by themselves select the intended geometric pairing. This is **induction, not deductive uniqueness**: infinitely many rules fit finite observations, and a participant's coherent alternate rule must be recorded rather than dismissed as bad reasoning.

Smallest authored package: supplied encounter, rotated numerical transfer `[9,10,11,12,18,30,44,?]` (90° rotation, answer 60), and `paired` information control showing opposite pairs explicitly. Rotation tests the relationship rather than memorized screen direction. The control holds all numbers/positions/checker constant and removes pair-finding, not multiplier inference. Ordinary play can optionally open the explanation after success; **study mode withholds it until transfer has been solved**. No explanation before the protected transfer.

Observable prediction: initially scans clockwise, considers opposite endpoints, tests ratios 2/3/4, predicts 5, then transfers to the rotated arrangement before feedback. Contradictions: memorized 40, arbitrary guesses, only post-hoc rationale, accidental completion, or the paired condition requiring the same search. Alternate finite-pattern explanations are a confound, not a bug to conceal. Fun and cognitive necessity STILL UNTESTED; no proof this is a new cognitive family distinct from Panel's law induction.

Mechanical bound: enumerate all canonical integers 0–9999 per encounter; exactly one accepted by the checker. This proves the checker's acceptance set, **not** a unique mathematical law. Recovery, validation, no success before submit, and rotated labels are implementation checks. Losses: hand-drawn salience/context, arbitrary intended-rule convention; no narrative stakes or open-ended mathematical explanation judging.

## Visual revision — 2026-10-28, before human testing

The user rejected text-only puzzles. The initial specification/predictions below are preserved as history, not silently rewritten. Current version is **visual-v2**: A/B become circles/diamonds and actual barriers; Archive prose becomes an incident scene, roster/appointment cards and before/fall/after evidence snapshots; Bench becomes a drawn gripper/track/crates with an icon tape and paced Run/Pause. Short labels and equivalent accessible descriptions remain. The simulation, finite worlds, address space, solution sets and ablations are unchanged.

Archive `visualEvidence` exposes only public and retrieved facts. The initial worker is a question-mark portrait with badge 2, never the named worker's portrait; power/spring/timing are concealed. Directory supplies visual addresses; finding supplies an illustrated cause. Known gate behavior is a collapsible illustrated reference. These are new representation choices, not primary evidence from the originals.

Additional pre-human predictions: players should point to barriers, badge matches, mechanical snapshot differences and the gripper's boundary position when explaining reasoning. Record icon confusion, missed reference panels and portrait matching separately from reasoning failures. Graphic evidence may make different facts salient; no equivalence to the former text UI is assumed. Playback is discrete, pausable and cancellable, slower under reduced-motion preference; no execution skill added. Keep unbriefed participants away from both versions' solutions.

## Three new architectures — visual-v3, 2026-10-28

These specifications/predictions are written before any human playtest, after initial model checks. They are not retroactively claimed to precede coding. Earlier plan hypotheses are preserved in the session plan. Human N=0; fun untested. Two encounters per station; the second is transfer.

### M5 — Tiles: editing laws

State: player and physical pictogram tiles; fixed object-class positions; rules derived from contiguous subject/equals/property tiles, horizontally or vertically. Legal moves push loose tiles; riveted tiles and active solid objects block. Resolve the whole push with old rules, commit atomically, recompute rules, then test contact with any goal-class object. No timing, arbitrary remote switches or general grammar.

Known: movement, icon legend, active laws. Unknown: useful rewrites. Initial misconception: crystals are intrinsically impassable or stars intrinsically goals. Encounter 1 defeats the first through breaking crystal-solid; encounter 2 makes the star unreachable and permits crystal-goal instead. Transfer edits the goal subject rather than repeating a solid-rule break. Control `preset` keeps board/tiles/actions but supplies useful fixed laws; tile movement no longer changes laws. It changes initial laws/difficulty, explicitly not a perfectly matched control. Removing that intervention would make a frozen obstructive variant impossible. Grammar/levels/order are original reductions, not verified Baba edge-case semantics.

Prediction: players initially route around crystals, notice simultaneous class-wide change, then choose another goal class in transfer. Fun candidate: one local displacement reinterprets several objects. Disconfirmation: accidental pushing succeeds without predicting the class effect; active-law display alone supplies a recipe; transfer becomes blind four-move search. Shortest route is not evidence of cognitive necessity. Two short levels deliberately test distinct rewrites; no campaign or global minimality claim.

### M6 — Pocket: portable containment

State: room IDs, acyclic room-box parent/positions, player and crate room/coordinates. Moves push objects; explicit Enter at a matching open center edge enters a room if its landing is clear. Walking/pushing through an open boundary resolves beside the room-box in its current parent. If an outer edge is crossed recursively, resolve the parent's placement too. Atomic push rejects blocked exits/cycles. Goal: crate reaches the yard ring. All rooms and positions visible simultaneously.

Known: controls and containment drawing. Unknown: usable exit location after moving a room. Misconception: crate must itself traverse the blocked yard route. Repositioning its containing room changes available exits while preserving its local coordinates. Encounter 1 starts with cargo already inside; loading cargo is not required and is not falsely claimed. Transfer has a room inside a room and a different exit axis. `forecast` retains exact transitions and draws resolved destination cells; it removes mental composition demand, not the physical containment mechanism. It is an informational ablation, and may not remove all spatial inference.

Prediction: explanation shifts from moving the crate directly to moving its containing space; transfer resolves both levels rather than reading the inset as decorative. Fun candidate: moving the room solves a seemingly trapped-object problem. Disconfirmation: inset/labels reveal a route without understanding; all success comes from exhaustive trial; forecast fails to reduce the claimed inference. Ceiling: finite nesting only, no self-containing rooms/infinity or Recursed duplication/reset. Thus **portable nested space**, not a full recursion demonstration. Minimal retained data: one movable room versus nested transfer; removal of nesting would change the relation being tested.

### M7 — Drift: movement changes future resources

State: player, two snowball positions/sizes, unconsumed snow. Legal moves walk or push one ball; no pulling/stacking. Push validates floor/occupancy, relocates ball, consumes destination snow, grows one size capped at 3, moves player, then checks exact-size destinations. Walking never consumes snow. Undo restores position, size and snow together. Goal: both balls on matching rings.

Known laws are stated; this is planning under coupled constraints, not hidden-rule induction. Misconception: shortest route or moving each ball independently suffices. First right push in encounter 1 grows the small ball, making its size-1 goal unreachable without undo/reset. A large ball can instead prepare cleared ground, but its final location must not block the small ball. Transfer changes axis, snow and goal placement. `fixed` disables growth only; snow consumption/board/goals/actions stay. Its valid short trace fails in full condition.

Prediction: early small-ball push, undo after growth, deliberate route-clearing with capped ball, transferred scheduling. Fun candidate: a goal object becomes a tool. Disconfirmation: participants bypass snow unintentionally, never reason about resource effects, or find route management tedious. Two earlier layouts were rejected by actual search: one transfer unsolvable, another control had no useful route distinction. Final full/control traces differ. Growth/consumption comparison to original Snowman remains provisional (official inspected clip showed dry-ground stacking, not growth). No claim of exhaustive real-game equivalence or global minimality.

## Original implementation plan

Build three dependency-free browser stations, representing four candidate mechanisms. Each gets a minimal encounter/counterexample, transfer, and playable control. HTML native controls, CSS, ES modules; no install, backend, analytics, assets or engine. Pure modules (`panel.mjs`, `archive.mjs`, `bench.mjs`) shared by UI and Node checks. Only common state history is reused. Initial player pages contain task rules/observations, not these interpretations. Python stdlib serves only localhost. Direct implementation follows the user's latest no-delegation instruction; no Git base, commit, push or worktree required.

Depth takes priority over covering every game. Rule editing, recursive containment, projection and semantic language remain explicit exclusions rather than being flattened into these systems.

## M1 — Induction from discriminating examples / station “Panel”

**Evidence:** E03, weaker E07. Original-game fidelity provisional: no release-build trace.

- **State:** rectangular cells marked A/B/empty; a set of internal dividers; submitted acceptance feedback. Known examples include an accepted separation and rejected mixture.
- **Legal actions:** toggle an internal divider; submit; undo/reset. Fixed per-panel divider budget. No dragging or timing.
- **Transition/order:** validate edge; toggle within budget; recompute connected regions; on submit accept iff no region contains both A and B. Empty regions allowed. One law across all encounters. UI does not name it in full condition.
- **Goal:** an accepted partition within budget; then novel transfer. Initially known controls/examples/budget; acceptance law unknown.
- **Misconception:** all occurrences of each letter must be gathered into one region. Intro supports this accidentally; next board has A columns separated by a full B column. An accepted solution necessarily splits A into separate regions, defeating that model.
- **Insight:** local exclusion is not global grouping. Transfer requires applying the region law to a different arrangement including empty cells.
- **Essential:** choosing partitions, observable feedback, counterexample, retained rule across boards. **Removed:** continuous single-path drawing, 3D island, machinery, travel. These losses mean this is not a miniature Witness replica.
- **Ablation `given`:** same boards, budgets, controls, feedback; rule explicitly supplied. Removes discovery, retains application. This is an informed-rule control, not a claim that general difficulty is perfectly matched.
- **Shortcuts:** enumerate partitions, isolate every mark where budget allows, lucky submission. Mechanical checks count solutions and ensure the counterexample forces split A. Success alone is not induction evidence.
- **Minimality test:** remove counterexample and the wrong global-grouping model survives the intro; remove feedback and no interactive law discrimination remains. Neither proves global minimality.

**Predictions (pretest):** some unfamiliar players verbalize grouping rather than exclusion; seek an A-joining route in encounter 2; revise after accepted disconnected A; transfer explanations refer to mixed regions rather than visual pattern copying. Given-law participants need not revise a law. **Contradiction:** full-condition players solve by counting/clicking without forming/revising a rule, or transfer fails despite articulate revision. Familiarity can erase the intended initial misconception.

## M2 — Causal reconstruction / station “Archive”

**Evidence:** E05 (high-level original behavior only), E01 (retrieval, not original causal fidelity).

- **State:** an immutable past incident; visible records; proposed identity/cause; feedback. Candidate worlds explicitly enumerate six badge permutations × two causal explanations. A fixed gate law links power, spring and lever to opening.
- **Legal actions:** retrieve a record by source/place/time, reread, propose a report, undo/reset. The past never changes.
- **Transition/order:** validate address; reveal exact matching record if present; add it once to visible evidence. Report accepted only when every world consistent with currently available reliable clues agrees with the proposed badge-2 identity and cause. No per-field correctness lights. This is evidence support, not a secret-answer oracle.
- **Goal:** identify the badge-2 worker and explain why cargo fell. Known: names, badge uniqueness, public appointment, scene, machine behavior. Unknown: identity mapping and which cause occurred.
- **Misconception:** the person seen at the lever after a fall caused it. A timestamped controller record instead establishes power loss with a missing spring. Counterfactual: intact spring would have closed the gate; an unpowered lever cannot account for opening under the stipulated law.
- **Insight:** presence and temporal adjacency are not sufficient cause; combine chronology with a mechanism. Transfer reverses the true cause: powered manual release before the fall with an intact spring. “Always choose spring” fails.
- **Essential:** fixed history, competing worlds, independent physical/temporal clues, explicit causal report. **Removed/lost:** motive, unreliable social testimony, portraits, violence, narrative stakes, world-scale cross-referencing and emotional impact. These are not assumed decorative.
- **Ablation `finding`:** supply an authoritative cause finding at outset, keep identity/query work and all records/controls. Removes causal diagnosis specifically, NOT every historical inference. Expect no diagnosis revision, while retrieval remains playable.
- **Minimality:** remove controller clue and cause remains ambiguous; remove badge receipt and identity remains ambiguous. Enumerate both omissions. Smaller two-person cast would make one public badge clue solve identity immediately, collapsing the intended evidence chain.

**Predictions (pretest):** initial explanations may blame the lever worker; discriminating record triggers a chronology/physical-law explanation; transfer uses evidence rather than repeating the first cause. Finding control can complete without making a causal inference. **Contradiction:** report choices follow perceived author expectations or brute-force feedback, not evidence; player interprets the scene as already exonerating the worker without needing records. With N=0 none is observed.

## M3 — Deductions choose evidence addresses / same Archive, separate comparison

**Evidence:** E01 firsthand exact-address retrieval; E06 adaptation description. Strict deduction-to-address transfer remains INFERRED.

- **Additional state:** finite address space; known/retrieved records; uncertain badge mapping.
- **Action:** choose source, place, time, retrieve. All addresses are available from the start, including unproductive ones. Knowledge, not a hidden unlock flag, enables useful queries.
- **Chain:** public appointment gives first address; receipt identifies badge 1; badge 3 is public, so elimination identifies badge 2; scene then gives badge-2 worker's address; that record points to controller evidence.
- **Misconception:** retrieval is a directory or keyword search; addresses require evidence-guided construction. Successful retrieval supplies new evidence, not merely points.
- **Ablation `directory`:** show all existing addresses in a directory beside the SAME query form; retain identical clue text, final report, candidate worlds and retrieval operation. Removes inferred addressing while retaining reconstruction. Extra directory text is a disclosed informational intervention, not a different interface.
- **Transfer:** new badge permutation, room labels, appointment time and cause. Reusing the previous identity/address fails.
- **Losses:** freeform semantic search, huge address space, clerical friction and narrative ambiguity. Finite address enumeration remains possible; no brute-force immunity claim.

**Predictions (pretest):** players write/voice a prediction about the record behind a query; use a newly inferred identity to choose the next query; transfer uses new clues rather than memorized addresses. Directory participants can retrieve without that chain. **Contradiction:** full-condition participants systematically scan all addresses, or informative queries succeed accidentally without explanation. Knowledge gating is treated as a progression structure produced by inference, NOT a fifth mechanism.

## M4 — Construct a repeatable process / station “Bench”

**Evidence:** E04 developer explanation, no original exact loop trace. Reduced loop invariant is INFERRED.

- **State:** instruction tape, program counter, arm position, whether holding an item, output count, error/complete status. Source inexhaustible; one item carried.
- **Legal actions:** edit tape slots while stopped (editing resets execution); step; bounded run; rewind execution; undo/reset. Instructions take, left, right, drop, wait. Actions are discrete.
- **Ordering:** execute one instruction against current state; invalid command stops with error; advance counter; on wrap keep arm/cargo state; increment output on valid drop; stop when quota reached. No automatic return in full condition.
- **Goal:** produce quota with a cycling tape. Known all operational rules and visible state; unknown a successful construction.
- **Encounter:** one output on a two-position track. **Counterexample:** same track, quota three: a tape that makes one product can fail on its next pass because the arm is still at the output.
- **Insight:** successful end state must satisfy the next iteration's starting requirements. **Transfer:** longer, reversed track; revise both outward and return journeys rather than copy commands.
- **Essential:** author a persistent artifact, execute/re-execute it, inspect boundary failure, repair. A manual sequence of moves would remove the mechanism.
- **Ablation `return`:** same tape, track, commands, quotas, feedback; fixture returns arm to source at every tape wrap; holding state retained. Removes position restoration across iterations, not all programming. Explicitly documented fixture behavior; no impossible control or hidden reset.
- **Losses:** molecule topology, multi-arm synchronization, spatial construction, optimization trade-offs; those need a richer second study.
- **Minimality test:** quota one admits programs that cannot repeat; quota two exposes the defect; quota three checks another repetition but is not mathematically necessary. Transfer needs longer distance to reject one-step-return copying. Enumerate all bounded tapes; no global-minimum claim.

**Predictions (pretest):** some players stop programming at first drop; second-pass failure draws attention to arm position; repaired tape restores start position; transfer includes a correctly sized return path. Return control does not need that repair. **Contradiction:** players solve by blind tape enumeration or already write loops fluently; repeatability may be prior programming knowledge rather than a new insight.

## Verification and verdict rules

`node --test tests.mjs`: pure transitions, invariants, immutability, invalid actions, history/reset, exact traces, all conditions/transfer. Exhaustive panel divider subsets; all archive worlds and addresses; all tapes within fixed slot limits. Report explored counts, limits, completion, alternate solutions. Bounded proofs concern only these models, never human necessity.

Local browser: load `run`/`chrome-devtools`; owned isolated context; inspect actual controls, pointer and keyboard, focus, narrow viewport, reset/undo, transfer, ablations, console/network; close owned contexts/server. No external page assets or uploads. Manual screen-reader study remains unperformed.

Human protocol and blank template in `PLAYTEST.md`. No recruiting invented. Verdicts must separately label mechanical **supported/contradicted/still untested** and cognitive **still untested** until actual consented unbriefed humans participate.
