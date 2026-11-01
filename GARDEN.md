# Stillwater — human playtest build

**Play:** [http://127.0.0.1:8765/garden.html](http://127.0.0.1:8765/garden.html)

One continuous, linear garden. Walk, push, enter a portable place, observe what changes. Restore the landscape's dormant planting cradles. The same spring travels with you; local restoration opens physical paths and leaves permanent signs of life. The ending completes the connected landscape rather than launching another level.

## Controls and recovery

- Arrows / WASD: one precise step. The view is angled; north is upper-right, east lower-right. Direction buttons show that mapping.
- Walk into movable objects to push. No pulling, timing tests or dragging.
- **Enter spring / Enter hollow**, or **E** when unambiguous: step inside. Walk through an open edge to leave.
- **Undo / Redo**, or **Z / Shift Z**: reverse/restore a complete move and its consequences.
- **Restore clearing:** restore the latest arrival checkpoint. It is undoable. A new checkpoint requires the travelling spring and the player to reach the next clearing together.
- **Overview:** inspect the connected world; moving returns to local play.
- **How to play → Board details:** factual text-equivalent state, including objects, floors, water and goals. Escape returns focus.
- Tab-local save/resume; no account, uploads or analytics. Corrupt/unavailable storage falls back safely. `?study=1` skips gameplay persistence.

Start with the main journey. Avoid the research solution files if you want an unspoiled playtest. The **15–45-minute target is unvalidated**, not a measured completion time. No actual participant sessions have been run.

## What was consolidated

**Portable spaces are the core; persistent water-triggered growth provides consequences.** A seed becomes immovable when watered; a rooted seed in a cradle restores a reach. Moving a portable spring changes its outlet's position without changing its interior. Later situations require ordering and transporting a dry seed out of another place. Restored roots retain their own water, allowing the spring to continue.

Tiles' literal rule grammar was deliberately omitted. There is one ecological law to reinterpret, not a second language of commands. True recursive/self-containing worlds, general portals and randomized puzzle layouts were not forced into the journey. The original study models remain unchanged and accessible separately; Archive stays retired.

## Original comparison prototypes

These remain playable, separate from the journey:

- [Portable garden](http://127.0.0.1:8765/garden.html?prototype=portable)
- [Connected springs](http://127.0.0.1:8765/garden.html?prototype=connections)
- [Changing ground](http://127.0.0.1:8765/garden.html?prototype=terrain)

All use the same native renderer, embodied controls, goal type and recovery. Portable space required entering/altering an interior; terrain supplied a clear ordering consequence. The connection sketch admitted a short alignment solution and was not chosen as the dominant mechanic. This is implementation/design judgment from self-play, **not a human preference finding**. Do not infer cognitive superiority from shortest routes.

## Implementation

Native Canvas renders orthographically projected 3D cuboids/height geometry, depth-sorted objects, face lighting, contact shadows and seeded procedural scenery. This is not WebGL/Three.js or a photorealistic engine. Original geometry only; no downloaded assets, runtime CDN, package installation or build step. Decorative generation cannot change the puzzle topology. Water and growth are deterministic, settled per move; visual time never changes legality.

`garden-model.mjs` owns transitions/validation; `garden-world.mjs` owns authored topology; `garden-view.mjs` renders; `garden-app.mjs` owns controls/recovery/persistence. `history.mjs` is reused. Animation stops when hidden/dialog-paused, respects reduced motion, caps device-pixel ratio and caches water per state rather than recomputing it every frame. The renderer is intentionally specific to this small world, not an editor or generic engine.

## Checks

```sh
node --test tests.mjs architectures.test.mjs ui.test.mjs garden.test.mjs
```

The journey has a checked 201-action reference trace across all six restorations, including physical travel; it is a solvability witness, not a globally shortest solution or duration prediction. Prototype exploration has a 12,000-discovered-state cap each; it is **bounded, incomplete exploration**, explicitly not exhaustive proof. Every discovered state is checked for valid occupancy/containment. Reference routes, counterexamples, atomic effects, invalid actions, undo/redo, checkpoint eligibility and corrupted saves have runnable checks.

Actual Chrome for Testing playthroughs use keyboard and touch buttons, not injected model states. Details and measured limits belong in `RESULTS.md`. Real phone hardware, screen-reader use, human discovery, pacing and enjoyment remain to be tested.

## Human feedback wanted

1. Did you understand moving, pushing, entering and recovering without strategic coaching?
2. When did the impossible-space relationship become clear? Which observation changed your prediction?
3. Did you understand why a seed stopped moving, or did it feel arbitrary?
4. Did carrying the spring feel like a coherent journey or repetitive transport?
5. Did any camera view, object, direction or checkpoint confuse you?
6. Did the final response feel earned and connected? Where did the pace drag?

Report where you became uncertain, not only whether you finished. No automatic participant logging exists. Optional anonymous observations need consent under `PLAYTEST.md`.
