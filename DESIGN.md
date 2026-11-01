# Studio-v4 — interface design record

2026-10-28. Complete redesign of Panel, Archive, Bench, Tiles, Pocket and Drift; **Spokes** added from the user's supplied image. No new commercial titles enter the frozen corpus. Apple/Luma quality is an aspiration, not a measured equivalence. **Human N=0; usability, enjoyment and cognitive fidelity remain unvalidated.**

## Research: authority, not decoration

Sources retrieved during this redesign, 2026-10-28 local / 2026-10-29 UTC. Web documents are living guidance, not pinned gameplay evidence. The WWDC transcript was read, not its video watched. Luma's public discover page was inspected in an isolated browser, without login or submission; its screenshot is an aesthetic reference, not usability research. No external assets/fonts copied or loaded by the app.

| Source / exact section | Kind | Applied decision |
|---|---|---|
| [Apple Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles), purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight | Platform guidance, reintroduced June 2026 | Make controls easy without explaining away the puzzle; reversible experiments; native controls; consistent object roles. |
| [Apple What's new](https://developer.apple.com/design/whats-new/), June/September 2026 entries | Currency check | Use current principles/layout guidance, not unrelated hardware or AI recommendations. |
| [WWDC26 Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/), transcript 1:52 agency, 2:41 forgiveness, 8:52 flexibility, 11:13 simplicity, 13:42 craft | Designer guidance, transcript only | Undo/redo, recoverable restart, optional help, coherent details. |
| [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), size, prominence, interaction | Platform guidance | Minimum 44×44 **CSS px** controls, 48px primary actions; one primary task action. Apple's points are not equated with web units. |
| [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials), functional layering | Platform guidance | Opaque boards; restrained surface layers. No imitation glass obscuring puzzle state. |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Platform guidance | System fonts, readable ink, distinct shape/texture alongside color, equivalent board descriptions. |
| [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback), [Undo and redo](https://developer.apple.com/design/human-interface-guidelines/undo-and-redo) | Platform guidance | Optional contextual help; immediate state updates; short cancellable transitions; no confetti, score pressure or forced timing. |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/), W3C Recommendation 2024-12-12; 1.4.3, 1.4.10, 1.4.11, 2.1.1, 2.4.11, 2.5.7, 2.5.8, 4.1.3 | Normative accessibility standard | Text ≥4.5:1; meaningful non-text ≥3:1; 320px reflow; keyboard; unobscured focus; no mandatory drag; live status. Our 44px target exceeds WCAG's 24px minimum. No blanket conformance certification. |
| [WAI APG](https://www.w3.org/WAI/ARIA/apg/patterns/), tabs/dialog/toolbar patterns | Implementation guidance | Native buttons/radios/dialog; Archive tab arrows/Home/End, selected state, roving tab stop; Escape and focus return. No unnecessary ARIA toolbar. |
| [web.dev INP](https://web.dev/articles/inp), updated 2025-09-02 | Performance guidance | Responsive feedback during every interaction; local next-frame measurements kept separate from field INP ≤200ms at the 75th percentile. |
| [NN/g 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), status, mapping, freedom, consistency, error prevention, recognition | Expert heuristics, not proof for these puzzles | Nearby feedback, directional mapping, Undo, stable controls, retained state. |
| [NN/g Direct manipulation](https://www.nngroup.com/articles/direct-manipulation/), visible objects and reversible incremental actions | Interaction framework | Visible effects from one move; no required dragging or opaque command forms. |
| [NN/g Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), primary/secondary information | Design heuristic | Help/board descriptions in a dialog; essential evidence stays available; Archive workspace sections replace a long form. |
| [NN/g Aesthetic–usability effect](https://www.nngroup.com/articles/aesthetic-usability-effect/) | Research synthesis | Visual praise cannot substitute for completion, error recovery or observed reasoning. |
| [Luma Discover](https://luma.com/discover), actual public category/card layout; [home](https://luma.com/) text | Aesthetic reference only | Restrained editorial collection, original miniature previews, quiet type and spacing. Not copied assets or a claim of equivalent quality. |

## First principles and decisions

1. **Separate interface uncertainty from puzzle uncertainty.** Label actions; reveal all legally available facts; hide answers and strategic coaching. Discovery, not operating the UI, should be the difficulty.
2. **Keep action and consequence together.** Board, direction pad and recovery controls share a surface. Bench keeps machine, tape, commands and playback together. Archive selects retrieved evidence, keeps records revisit-able, and moves focus to a newly retrieved record.
3. **Make mistakes cheap.** Undo, Redo and undoable Restart; switching level/station preserves work. No confirmation ceremony for reversible local actions.
4. **Use spatial relationships honestly.** Spokes preserves the image's eight positions. Pocket separates the active room from simultaneous context views. Goals remain visible when occupied. Panel hit targets never overlap.
5. **Spend visual weight on meaning.** Opaque warm surfaces, deliberate light/dark tokens, clear player/piece/wall/goal distinctions; sparse shadows. No stock imagery, decorative metrics or gradients.
6. **Don't call machinery evidence.** Passing checks establish implementation behavior; N=0 establishes nothing about discoverability, transfer or enjoyment.

## Before / after audit

| Earlier issue | Studio-v4 change |
|---|---|
| Repeated header and six equal pills precede the board | Collection entry; compact play header, native station switcher, numbered levels and direct URLs. |
| Entire app replaced on every move | Shell/controls persist; only visual state sections refresh. Rebuilt evidence controls restore focus by ID. |
| Reset/navigation destroy work | Redo, undoable Restart, per-level/condition memory and validated tab-local snapshots. Back/Forward/reload supported. |
| Archive roughly 4,400px mobile document | Scene / Records / Reconstruct workspace; compact native radio composer; selected evidence viewer; Before/Fall/After stepper. |
| Panel hit areas overlap at seam intersections | Independent 44px square midpoint targets; full seam barriers rendered separately from hit geometry. |
| Bench editing/executing cues compete | Selection outline versus execution triangle; visible Run/Pause/Step/Rewind; arrows/Home/End navigate tape slots. |
| Four mostly disabled Pocket Enter buttons | Contextual Enter room A/B; explicit alternatives only if multiple entries exist. |
| Spatial controls separated from board by prose | Direction pad and recovery inside board surface; details below/beside or in optional dialog. |
| Drift goal hidden beneath snowball | Persistent corner size marker plus dashed ring. |
| One-size-fits-all dark colors | Explicit light/dark palettes, user appearance choice, forced-colors fallback and shape redundancy. |

## Architecture and privacy

Plain HTML, CSS, ES modules, original inline SVG. No dependencies, build step, backend, network assets, account or analytics. Native HTML provides focus/radios/dialog behavior; pure transition functions are shared with Node tests. Existing six transition modules and encounter state spaces are unchanged.

`session.mjs` validates routes/snapshots. `sessionStorage` holds only current functional checkpoints, not event logs; Archive queries are stripped. Browser tab close ends normal storage lifetime; browsers may restore tabs according to their own settings. Undo/redo stacks remain memory-only. `?study=1` skips checkpoint loading/saving and separates condition state; use a fresh browser context for each participant. The appearance preference is not gameplay data. Quota/disabled/corrupt storage fails safely. The local Python server prints ordinary request lines; never put participant data in URLs.

Spokes is a separate user-supplied candidate, not a retroactive corpus addition. Spokes-v2 accepts either 8 or 40 initially, then uses directed arrows on the same numbers to require the other answer. Exactly two rounds; the earlier rotated transfer is removed. The explanation waits until round 2 is complete in every mode. Arrow direction is also exposed in the diagram's accessible description. `STUDY.md` records the ambiguity/ablation limits.

## Reproducible acceptance checklist

Run `node --test tests.mjs architectures.test.mjs ui.test.mjs`. Preserve original exhaustive counts, source-research hash and all corpus IDs. Serve `python3 -m http.server 8765 --bind 127.0.0.1`.

- Solve all 34 station/encounter/condition combinations with actual controls using `RESEARCHER.md`; verify error, success, Undo, Redo, Restart, Undo restart and Next level.
- Navigate collection/station/level, Back/Forward, reload; verify distinct condition state and disabled/corrupt storage fallback. Study URLs must never load normal snapshots.
- Archive: failed and repeated query, all three records, each frame, retained draft, no premature completion before Check, no unretrieved facts. Newly retrieved record focus stays visible.
- Bench: Step/Run/Pause, rewind, edit during playback, undo, navigation/visibility cancellation; no stale timer or duplicate action. Editing and executing cues remain distinct.
- Keyboard-only solve every station. Tabs use arrows/Home/End; radios use native arrows; dialog Escape restores opener. Z / Shift Z never capture input fields. No drag required.
- Inspect 1440×900, 768×1024, 390×844, 320px narrow, 844×390 landscape, light/dark; no horizontal page overflow, clipped controls, overlapping Panel targets or sub-44px buttons. At narrow widths six-slot tapes wrap rather than shrink targets.
- Check 200% text resizing, reduced motion, forced colors, focus rings and occupied goals. Actual screen-reader testing remains outstanding.
- Measure local input-to-next-frame time separately from field INP; inspect console/network over the actual action window. No app requests beyond localhost.
- Inspect every station's screenshots, not only the collection. Review touch readability and task friction with real unbriefed humans before claiming the target quality.

Verification outcomes are recorded in `RESULTS.md`. Browser scripts/screenshots are machine-local scratch artifacts; no participant data or machine process handles belong in Git.
