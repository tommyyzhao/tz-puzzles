# tz-puzzles — small encounters

Six playable **visual** puzzles in a responsive studio: shapes and barriers; a programmable gripper; editable rule tiles; portable rooms; snowball routing; a spatial number pattern supplied by the user. Archive is retired from the collection, switcher and direct player routes after user feedback; its source, checks and research remain preserved. Plain HTML/CSS/JavaScript with original inline SVG; no dependencies, accounts, build step, backend or analytics. Pure transition functions are shared by browser controls and Node tests. No commercial levels or narrative copied.

## Golden Hills — dry hills, and a small stone box

**[Play Golden Hills](https://goldenhills.sloprefinery.ai)** (local: `goldenhills/`) — a pocket-world puzzle game across one continuous stretch of hills, rebuilt from scratch on 2026-10-30, polished and rebranded on 2026-10-31 (formerly Stillwater).
- **Boxes:** pushed by their solid faces, entered through their arches, and nested inside each other.
- **Water** flows through the boxes to wake the valley's pools.
- **Look:** Three.js diorama with a grid-aligned camera and a splat backdrop.
- **Controls:** arrows, WASD, tap, swipe or the on-screen pad.
- **Progress** and undo survive a reload. You can keep walking after the ending.

More: [decisions](goldenhills/DECISIONS.md), [playtest notes](PLAYTEST.md), [checks](RESULTS.md). Human pacing and fun are unvalidated. The old `garden.html` build is retired but kept.

## Fluider — a liquid puzzle game

**[Play Fluider](https://fluider.sloprefinery.ai)** — formerly Verdigris, a six-room liquid puzzle game on svelte-fluid's air and liquid engines. [Source](https://github.com/tommyyzhao/verdigris) remains at submodule `verdigris/` (`git submodule update --init verdigris`). It is a SvelteKit app, unlike the dependency-free studio below: `cd verdigris && bun install && bun run dev`. Its playtest has not run yet.

## Play locally

From this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open **http://127.0.0.1:8765/**. Stop with Ctrl-C. Python 3.14.7 / Node 26.0.0 verified on this machine. Any available port is fine; replace `8765` if occupied. No package installation required.

| Station | Task | Local link |
|---|---|---|
| Panel | Find accepted partitions | [Play](http://127.0.0.1:8765/?station=panel) |
| Bench | Build an instruction tape | [Play](http://127.0.0.1:8765/?station=bench) |
| Tiles | Move through a world of physical rule tiles | [Play](http://127.0.0.1:8765/?station=tiles) |
| Pocket | Deliver cargo through portable rooms | [Play](http://127.0.0.1:8765/?station=pocket) |
| Drift | Roll snowballs onto matching rings | [Play](http://127.0.0.1:8765/?station=drift) |
| Spokes | Find the missing number | [Play](http://127.0.0.1:8765/?station=spokes) |

Keyboard: Tab / Shift-Tab to controls, Space / Enter to activate. No dragging or real-time burden. Panel: tap seams. Bench: select a slot, choose a command, Step or Run/Pause; arrows also navigate slots. Tiles/Pocket/Drift: arrows, WASD or direction pad; Pocket offers contextual Enter room. Spokes: enter a number, Check. How to play is always available; Escape closes help.

Undo/Redo and undoable Restart are free. Z / Shift Z work outside inputs. Level/station changes and Back/Forward preserve work. Validated checkpoints survive reload **in this tab**; undo history stays in memory. No event logs or gameplay uploads. Disabled storage falls back to memory. For research use a fresh private context and append `&study=1`; that mode never loads/saves gameplay checkpoints. Python's local server prints ordinary request lines; do not put participant data in URLs.

For unbriefed play, stop reading here and open the player page. Research files below contain mechanisms/solutions.

## Checks

```sh
node --test tests.mjs architectures.test.mjs ui.test.mjs garden.test.mjs goldenhills/goldenhills.test.mjs
```

62 tests: 17 cover the Golden Hills rules, campaign witness, connected finale, arch spills, the sealed box and clearing rewind. The other 45 cover the existing studies plus the complete garden trace, prototype solutions, water/growth counterexamples, state invariants and checkpoint/save validation. The original 38 checks include hidden-evidence visibility, visual chronology, complete reachable-state searches, route validation, redo/restart recovery, storage isolation/failure handling and the Spokes checker. Exhaustive checks cover 4,240 panel partitions, 12 candidate worlds and 36 addresses per archive case, all eight physical gate configurations, and 33,750 fixed-length tape/condition combinations. Bounds, alternate solutions and a known retrieval shortcut are documented; none proves a human needs the intended insight.

Browser verification used isolated Chrome for Testing: visual full/control variants and transfer encounters, pointer/keyboard operation, hidden evidence, pause/reset/edit cancellation, mobile layout, light/dark themes and reduced motion. Screenshots inspected; palettes validated. No external app requests or console warnings/errors in checked sessions. Real screen-reader testing remains unperformed.

## Research packet

- [Neo-Sokoban interview brief](VISION.md): agreed vision, three comparison prototypes and design boundaries; implementation update links to Golden Hills (formerly Stillwater).

- [Design research and acceptance checklist](DESIGN.md): current Apple/W3C/APG guidance, first principles, audit and verification boundaries.

- [Frozen corpus](CORPUS.md): 68 explicit game/edition entries; three provenance-only award-link titles retained separately.
- [Complete comparison mapping](COMPARISON.md): every corpus ID, mechanism hypotheses, evidence strength, retained/lost aspects, demo or exclusion reason.
- [Primary evidence ledger](EVIDENCE.md): narrow firsthand Type Help interaction; developer documentation; explicit unavailable/secondary boundaries.
- [Specifications and pretest predictions](STUDY.md): state/actions/order/goals, misconceptions, transfer, ablations, exclusions.
- [Researcher solutions](RESEARCHER.md): traces, exhaustive bounds, minimality comparisons and shortcuts.
- [Human protocol + blank template](PLAYTEST.md): neutral tasks, consent, familiarity, contamination controls; local anonymous notes only.
- [Results and verdicts](RESULTS.md): mechanical claims separated from cognitive claims.
- [Prior research](RESEARCH.md): preserved byte-for-byte; secondary synthesis, not gameplay evidence.

**Human N=0. Cognitive fidelity STILL UNTESTED.** This is a runnable study kit, not evidence that the originals' essential discoveries have already survived simplification. No commits, pushes, deployments or public publication performed.
