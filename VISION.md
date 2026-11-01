# Neo-Sokoban — interview brief

2026-10-29. Vision established through direct user interview. This is a concept/prototype brief, not approval of a final mechanic, a production implementation plan, or evidence of player enjoyment. Existing Tiles/Pocket/Drift remain playable while candidates are compared. No corpus expansion or commercial-level copying.

## Rebuild — 2026-10-30

The user played Stillwater-v1 and rejected both the puzzle approach and the look. Their points:
- the ending felt sudden;
- no walking after it;
- the pocket Enter control sat off screen;
- the boulders were useless;
- WASD makes no sense on a diagonal view.

The interview then chose:
- pocket worlds, "more sophisticated and interesting than what we currently have";
- a tilted, grid-aligned camera;
- Three.js with splat backdrops;
- a full build before playtesting.

A clean-room rebuild now lives in `stillwater/`. The old `garden*` build is retired from the collection; its files are kept. Pocket boxes are pushed by their solid faces and entered through their arches. Water flows through them and wakes pools. The last box, the stone box, contains the whole valley.

Decisions taken while the user was away: `stillwater/DECISIONS.md`. Checks: `RESULTS.md`. Human playtest: `PLAYTEST.md`. Human N=0; the 15–45-minute target is still unvalidated. The sections below are provenance.

## Implementation update — 2026-10-29

The subsequent direct goal authorized end-to-end implementation and autonomous selection after comparison. **Stillwater** now implements a continuous six-reach journey using portable space plus water-triggered growth; literal rule tiles and general portal travel are not part of its campaign. All three comparison prototypes remain independently playable. `GARDEN.md` describes the build, limits and human-playtest questions; `RESULTS.md` records actual checks. The original interview/next-decision wording below is preserved as provenance, not a claim implementation remains blocked. Human N=0; the 15–45-minute target is not empirically validated.

## User decisions

- One continuous giant puzzle with a clear beginning, end and **linear progression**, intended for one sitting of **15–45 minutes**. Not a level-selection campaign, branching overworld or endless sandbox.
- All four pleasures matter: surprising realizations, elegant planning, playful invention and exploring a strange world. They need not all occur in every encounter.
- **None of the existing mechanics is sacred.** Consolidation means one coherent game, not concatenating three demos or requiring every mechanic to survive.
- Welcoming introduction, substantial later depth.
- **Impossible but consistent**, with Portal cited for the quality of understandable strangeness, not an instruction to copy its mechanics, levels or assets.
- Beautiful **living, transforming landscape**; procedural visuals, authored puzzle logic/progression; crisp interactions.
- **Compare small prototypes before choosing the signature mechanic.** No portable-room, portal or terrain concept has yet been selected as the core.
- Elevated **3D diorama**. Embodied player, precise discrete steps/pushing. Desktop and mobile must both feel excellent.
- Controls explicit; discoveries implicit. Environmental responses quietly suggest experiments rather than strategic narration or explicit hint ladders.
- Purpose combines restoring a dormant landscape with completing one connected system. Small local responses foreshadow the finale **without revealing its full completion effect**.
- Progression depth delegated to design judgment.

## Design recommendations — not additional user decisions

**Working pitch:** explore and restore one small living landscape by discovering how its impossible spaces behave. Local transformations accumulate; the ending reveals and activates the larger system they form.

Depth priority: reinterpret a few familiar rules, then deepen planning. Introduce new capabilities only if a prototype demonstrates that another verb earns its teaching/interaction cost. The finale recombines understanding instead of introducing a last-minute exception.

Continuity should not mean a permanently crowded board. Earlier changes remain visible and meaningful; each local problem has a readable scope. Avoid repeatedly transporting objects across already solved ground. Linear progression must not permit an unnoticed early move to make the ending permanently impossible.

Keep simulation deterministic and turn-based. Water, vegetation, settling and feedback can look alive without introducing timed maneuvers, physics randomness or input delays. Commands must stay responsive during nonessential animation; no long action queue after rapid input. Reduced-motion presentation preserves every relevant fact.

Environmental guidance communicates cause, not an oracle: water pooling at an obstruction; a ripple following a connection; growth responding to restored water. Do not highlight the correct object to push, reveal hidden destinations, or quietly solve a bottleneck.

Unlimited undo and clearly scoped recovery are recommended. Distinguish local recovery from starting the whole journey again; preserve earned restoration where the model allows it. Save/resume is sensible despite the one-sitting target. Exact checkpoint semantics depend on the selected core and remain an implementation decision.

## Comparable prototypes — not three production systems

Three roughly **2–4-minute** authored encounters, each with the same neutral objective: bring water to a dormant patch. Equal art/interaction quality, camera rules, teaching, recovery and input support. These durations are design targets, not measured results. Each should contain a safe experiment, one misconception-defeating consequence and a small recombination; it must ask for reasoning, not merely activating the feature.

| Candidate | Essential discovery | Minimal interaction | Failure / rejection criterion |
|---|---|---|---|
| **Portable garden** | Moving a place changes where its interior connects to the outside. | Push a garden-container, enter a larger interior, reposition it to redirect the stream's exterior exit. Show entering/exiting with stable orientation and unmistakable location. | Players lose track of their frame of reference; entering is busywork; the solution is just align one box with one target. |
| **Connected springs** | Distant places can become neighbors for player, object or water movement. | Push/reposition a passage connection; its consistent orientation redirects a stream through otherwise impossible geography. | Connection semantics are unclear; depth collapses into pipe matching; remotely aiming connections dominates ordinary movement. |
| **Changing ground** | Moving an object transforms what routes remain possible. | An object changes terrain or consumes a resource; a changed route enables restoration somewhere previously unreachable. Use the minimum transformation law. | Preparation becomes repetitive; a tiny unnoticed irreversible change creates a remote dead end; solution is long pushing rather than insight. |

The exact boards, transitions, water model and art are not designed yet. Do not present these sketches as playable, solved or validated prototypes. Shared objective is an experimental comparison aid, not a commitment that water must be the final game's only theme.

### What to retain from the existing studies

- **Pocket:** moving reference frames, visible contents, coherent entry/exit. Finite nesting first; true self-recursion/infinity is not justified by this brief.
- **Drift:** actions change future resources and affordances. Literal snowballs, numerical sizes and snow are optional.
- **Tiles:** the useful idea is changing how objects behave. Literal grammar tiles/rule sentences are not required; investigate a legible ecological/material relationship before importing a second abstract language.

Choose one dominant mechanic. Add a second only if their interaction produces a discovery neither offers alone. Potential combinations worth testing *after* selection: moving a place changes where terrain is transformed; terrain changes what may pass through a connection. Do not ship separate rule-editing, nesting and growth systems merely because they already exist.

## Proposed journey rhythm

One continuous space, not a succession of level-loading screens:

1. **Arrival:** establish movement, pushing, a visible local need and a restrained sense of the landscape's dormancy.
2. **First response:** an understandable action creates a small sign of life. Teach control grammar explicitly, not the solution.
3. **Strangeness:** a safe experiment reveals the core impossible relationship; the world responds consistently.
4. **Reinterpretation:** familiar objects/rules allow a new use. A larger area deepens planning without multiplying verbs.
5. **Integration:** local restorations prove connected. The last puzzle draws on prior understanding; the full restoration payoff is reserved for completion.

This is a proposed rhythm, not five locked levels or a claimed 30-minute playthrough. Test pacing with humans; a 15–45-minute target cannot be guaranteed for every player, especially without explicit strategic hints.

## Interaction and presentation constraints

- Readable elevated diorama; foreground geometry/vegetation cannot obscure cells, exits or the avatar. Decide camera behavior through the prototype, not decorative cinematic ambition.
- Desktop arrows/WASD plus equally precise touch controls; no drag-only actions, timing demands, hover-only facts or tiny world targets. One contextual action where needed.
- Discrete simulation positions; responsive interpolation and short, legible effects. No animation locks on ordinary moves.
- Procedural **visuals only**: authored solvable logic must not change because a decorative seed changes. Generated detail respects traversability/readability boundaries.
- Use silhouettes, materials and motion in addition to color. Reduced motion, visible focus, text-equivalent state and accessible DOM controls remain requirements for a 3D renderer.
- No timer, score pressure, collectible checklist, combat, crafting economy or broad tool palette introduced by this brief.
- No final title, protagonist, detailed lore, soundtrack, custom engine or rendering dependency selected yet. Do not build an engine/editor before a mechanic has earned it.

## Evaluation and next decision

Observe unbriefed humans when available, with consent and no silent collection. Record predictions before experiments, their causal explanations afterward, accidental success, confusion, mistakes, recovery, mobile control friction and desire to continue. A screenshot, agent playthrough or correct solver trace cannot establish engagement.

Compare:

1. Can the player operate the world without strategic coaching?
2. Does the distinctive discovery actually occur, rather than random success?
3. Can they predict a new consequence of the same rule?
4. Does the interaction remain crisp and readable on a phone?
5. Can this rule support a continuous 15–45-minute arc without padding or repeated exceptions?
6. Does restoration feel caused by play rather than a reward animation pasted onto a disconnected puzzle?

Mechanical gates before playtesting: pure transition checks, solvability, invalid actions, reversibility, deterministic water/transformation ordering, no illegal containment/occupancy, exact bounded-search reporting where practical. Report human N=0 if none are available.

**Next decision:** compare the small prototypes, choose a core, then prepare the implementation plan for the continuous journey. No full merger or production build performed as part of this interview.

## Archive disposition

User described Archive as “totally unplayable” and authorized either complete redesign or removal. Chosen action: retire it from the playable collection, switcher and direct player routes. Preserve source, mechanical checks and historical research. This is direct usability feedback from the user, **not** a newly recruited/consented study participant or proof its abstract deduction model is invalid. No more incremental UI polish justified without a new core interaction proposal.
