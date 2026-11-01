# Primary evidence ledger

Retrieval/interaction date: **2026-10-28**. Read before interpreting `STUDY.md`. Prior criticism in `RESEARCH.md` is not promoted to firsthand evidence. No original commercial game was purchased or installed. No recordings were watched. No claim below is a human study. New titles/expansions seen in fetched pages were excluded under `CORPUS.md`.

Classes: **FIRSTHAND** = interaction actually performed on original artifact; **DOCUMENTED** = source/developer material establishes behavior; **INFERRED** = interpretation beyond that evidence; **UNAVAILABLE** = relevant primary evidence not obtained. A documented high-level description is weaker than a transition trace; both are identified below.

## E01 — Type Help: original retrieval, FIRSTHAND (narrow)

- Corpus C12. Original: <https://william-rous.itch.io/type-help>. Inspected HTML build: <https://html-classic.itch.zone/html/18831707/index.html?v=1786900908>. Build ID/query are the available version identifiers, not an asserted release date.
- Dedicated headless Chrome for Testing 154.0.8037.57; isolated disposable profile, no account. Original DOM/accessibility tree inspected after actual input; this is text gameplay, not inferred visual observation.
- Fresh language screen → click **Skip intro** → command textbox.
- Type `help`, Enter → welcome, commands `inbox` and `list` shown.
- Type `list`, Enter → initial stored file `00-readme`.
- Type `00-readme`, Enter → file opens; its instructions provide exact example address `26-EN-1`.
- Type `26-EN-1`, Enter → transcript opens, heading `NEW FILE RETRIEVED — ADDED TO FILE LIST`.
- Change address to `26-EN-2`, Enter → `File could not be found.`
- **Caveat:** in the skip-intro run, a later `list` displayed `(0)` and only `00-readme`, despite the added-file banner. Persistence/bookkeeping is NOT established by this trace. Intro and long-form mystery not completed. A provided example address does not itself demonstrate that a human deduced an address.
- **Supported narrow claim:** the same textbox accepts a precise evidence address; successful retrieval exposes story evidence, not only a correctness marker; a nearby wrong address fails.
- **INFERRED:** identities/locations inferred from one record can guide later queries (also described by prior secondary research). Our archive explicitly models that dependency; whether its discovery resembles the original remains untested.
- Local raw tool snapshots retained outside Git; reproducible commands above are the portable evidence record. No original dialogue/assets copied into demos.

## E02 — Baba Is You: executable physical rules, DOCUMENTED (developer description)

- C01: <https://hempuli.itch.io/baba>, description before “More information”, live commercial page; version of depicted behavior unspecified. <https://www.hempuli.com/baba/> independently describes physical rules.
- Stated configuration: rules are blocks within a level. Action: manipulate/push these blocks. Documented outcomes include changing the player into a rock, making grass hot, changing the victory object. Exact coordinates, parsing order, simultaneous resolution are **UNAVAILABLE** here.
- A concrete wall example was located at <https://en.wikipedia.org/wiki/File:Baba_is_you_gameplay.gif>, attributed there to the developer's 2018 media: contiguous `WALL IS STOP`; displace `WALL`; walls become passable. **Not visually inspected**, therefore this is a secondary textual description, not a watched recording or independently verified transition.
- C02: <https://hempuli.itch.io/baba-is-you>, developer's “Jam Build” page: arrows, restart, undo and editor controls; developer reply warns rule logic differs/is buggier than commercial. No executable downloaded. Do not transfer current behavior to jam version unquestioningly.
- **INFERRED:** rule editing must remain distinct from learning a fixed rule. No demo here: a switch that opens a door would not preserve editable predicates/subjects.

## E03 — The Witness: rule acquisition then application, DOCUMENTED (pre-release developer interview, bounded)

- C07: <https://www.polygon.com/e3-2014/2014/6/11/5800968/the-witness-jonathan-blow-design-e3-2014/>, Alexa Ray Corriea, 2014-06-11, paragraphs beginning “Each puzzle introduces…” and “While Blow isn't fond…”. Describes E3 2014 build, **not release-build verification**.
- Configuration: panel with black/white marks. Action: trace a path separating marks. Documented outcome: panels are solved under separation rules; later panels operate machinery/doors. Developer says puzzles can be approached before their rules have been learned and earlier puzzles supply those rules. Exact line coordinates and feedback timing not provided.
- <https://time.com/4355763/the-witness-jonathan-blow-interview/>, 2016-06-09: search extraction included developer's black/white separation explanation, but full fetch returned metadata and browser navigation timed out. Not used as a complete inspected source.
- <https://intermittentmechanism.blog/2017/08/18/lets-study-the-witness/>, sections describing farmland tutorial and marsh: detailed **secondary transcript**, read but embedded video not watched. Describes false generalizations and counterexamples. Does NOT establish firsthand visual observations.
- **INFERRED:** the specific misconception “each symbol kind must form one connected group,” our original boards, transfer, and informed-law control. Our release-game fidelity claim is **provisional**. The executable study tests a separation-law model, not the original campaign's pedagogy.

## E04 — SpaceChem / Opus Magnum: persistent programs, DOCUMENTED

- C39: developer PDF <https://www.zachtronics.com/images/SpaceChem%20-%20A%20Guide%20for%20Educators.pdf>, sections **What does SpaceChem teach?** and **What does SpaceChem not teach?**, dated approximately 2011 by search metadata; document itself has no verified version. Text extraction inspected; screenshot captions are not observed screenshots.
- Concrete documented construction: input H2 and O2; build a machine; output H2O2. Bonders directly create/remove bonds. Two concurrent threads use ordered instructions, loops, branches, synchronization and subroutines. **No specific successful program trace or timing order inspected.**
- C09: <https://www.gamedeveloper.com/business/road-to-the-igf-zachtronics-i-opus-magnum-i->, developer interview, 2019-02-18, sections **Creating a certain beauty of motion**, **On developing the components**, **Building for creative solutions**. Limited tools transform inputs into outputs; physical arms move components; authored machines manufacture repeatedly; cost/area/cycles are distinct objectives, no single prescribed optimal strategy.
- <https://store.steampowered.com/app/558990/Opus_Magnum/>, developer “About This Game / Design Machines”: programmable arms and customizable tracks. Live listing, not a versioned instruction manual.
- **INFERRED:** our one-arm return-to-start invariant and automatic-boundary-reset ablation. This is an original reduced model of repeated production. It does not reproduce chemical topology, two-thread synchronization, geometric arm collisions, or open spatial construction. Exact Opus Magnum reset/loop semantics are not asserted.

## E05 — Historical reconstruction, DOCUMENTED (high-level); concrete original trace UNAVAILABLE

- C56: <https://store.steampowered.com/app/1677770/The_Case_of_the_Golden_Idol/>, developer “About This Game” and “Mature Content Description”. Frozen murder scenes; observe evidence, identify suspect/motive/weapon, reconstruct events. Original release listed 2022-10-13; live store text may reflect updates. No case personally played.
- State/action/outcome: fixed scene and clues → build an account of a past event → identify identities/motive/weapon. Exact original answer checks not inspected. This supports reconstruction as an activity, not our archive's specific inference structure.
- C06: <https://steamcommunity.com/app/653530/discussions/0/1732090362049101021/>, developer-tagged response dated 2018-10-19 surfaced in search about three identity/fate confirmations. Full page returned a content gate. No gate bypass attempted. **UNAVAILABLE for independent verification**, not used to claim our feedback matches Obra Dinn.
- **INFERRED:** our explicit candidate worlds, counterfactual mechanical cause, address chain, and two separate ablations. Reconstructing an authored failure is a narrower task than reconstructing social history, intent, blame or unreliable testimony.

## E06 — Adaptation distinction, DOCUMENTED

- C31: <https://store.steampowered.com/app/3641000/The_Incident_at_Galley_House/>, **The Chilling Detective Game, Reimagined on Steam**, live page, release listed 2026-07-14.
- Developer explicitly identifies Type Help as the basis, with illustrated scenes, professional voices, 3D memory interface, new content/puzzles. The original itch page also identifies the adaptation.
- The new interface and its detailed queries were not interacted with. No direct equivalence of all puzzle logic or cognitive experience is claimed.

## E07 — Language and executable vocabulary, DOCUMENTED (limits)

- C17/C18: <https://www.blazgracar.com/lok> (redirected content branded Letibus), sections **LOK**, **PDF**, **Digital**; <https://letibus.itch.io/lok>. Find keywords, execute their special effects to black out all cells; infer most rules from the sequence. Digital adaptation adds puzzles/mechanics. Live pages now describe later paper editions; **2022 original-specific level content not obtained**. Do not silently map later additions back to 2022 or add editions to the frozen corpus.
- C51: <https://www.inklestudios.com/press/heavensvault/>, **Overview**; <https://www.inklestudios.com/heavensvault/>, **Translate / Linguistic inspiration**. Translations affect the protagonist's beliefs and story; glyph words have smaller compositional atoms. Wrong interpretations can remain playable.
- **INFERRED:** formal symbol induction shares falsification with semantic inference, but truth-conditional language, context, morphology and uncertain narrative consequences are not preserved by our panel. No “language learning reproduced” claim.

## E08 — Recursive containment, DOCUMENTED (description only)

- C04: <https://www.patricksparabox.com/press/>, **Description**, live version unspecified: push boxes into/out of boxes; self-containment and infinity explicitly mentioned. Concrete transition ordering/level file **UNAVAILABLE**.
- **INFERRED:** changing a room's containment must affect the space subsequently navigated. Generic zooming or portals are not sufficient substitutes; no demo selected.

## E09 — Portable rooms / rule objects, expansion evidence (DOCUMENTED)

Retrieved 2026-10-28 for visual-v3, within frozen corpus.

- C04: <https://www.gamedeveloper.com/design/patrick-s-parabox->, John Harris interview with Patrick Traynor, 2023-01-18. Section question beginning “Patrick's Parabox's elegance masks…”: configuration is a box whose center edge is occupied; attempted entry must use that center, unlike an abandoned implementation searching alternate edge cells. Developer documents the center-only rule and why the alternate was removed. Earlier question documents pushing a self-containing box into another changing world structure. No original level personally played; no infinity implementation claimed by Pocket.
- C50: <https://store.steampowered.com/app/497780/Recursed/>, developer **About This Game**: jump into a chest to enter another room; pick up/move the chest to move the room. Exact reset/duplication transitions not inspected. Pocket preserves finite portable space only, not those Recursed laws.
- C01: <https://www.hempuli.com/gamelist/index.php?rule=id&ruleid=3>, developer Baba Is You entry (2019 heading): rules are pushable blocks that modify object purposes. Alongside E02, supports the Tiles comparison. Our limited icon grammar, parsing order, riveted tiles and level traces remain **INFERRED/original design**, not a reproduced commercial engine.

## E10 — Snowman developer animation inspected; growth not established

- C48: primary press kit <https://agoodsnowman.com/press/>, **Images**, links <https://agoodsnowman.com/press/snowman/images/AGoodSnowman_Animated_Demo.gif>. Downloaded to a new isolated temporary directory; no game installation or scripts executed from downloaded material.
- Media dimensions 576×276, 227 frames, duration 6.81 seconds; build/date not embedded/verified. Inspected contact sheet at 2 frames/second. At approximately 2.0s a small ball is beside a medium ball on cleared green ground; by approximately 2.5–3.0s it is stacked above it after a leftward push. Later frames show separation/repositioning. **DOCUMENTED visual observation**, not firsthand interaction.
- This clip does **not** demonstrate growth or fresh-snow consumption. A second press asset `AGoodSnowman_Animated_1.gif` returned the same dimensions/frame count/duration; not counted as independent evidence. No downloaded imagery copied into our app.
- Growth/consumption in Drift is an original explicit model inspired by prior secondary research. Original-game equivalence remains **INFERRED/provisional**. The retrieved 2014 developer Q&A describes prototyping, but does not fill this mechanical evidence gap: <https://www.gamedeveloper.com/design/q-a-a-good-snowman-is-hard-to-build>.
- Earlier opening statement “No recordings were watched” describes the initial pass; E10 adds this later frame inspection only, not a full gameplay viewing or playthrough.

## E11 — User-supplied Spokes candidate (outside the frozen corpus)

2026-10-28 chat attachment, referred to by the user as “Image #3”; no public URL, title attribution, build or external provenance supplied. Image directly inspected: eight radial endpoints clockwise from top carry 5, 6, 7, 8, 10, 18, 28, ?. User explicitly stipulated **40**. This is **DOCUMENTED user intent** and observed image content, not gameplay testing.

Opposite pairs yield 5×2=10, 6×3=18, 7×4=28; extending the ordered multipliers gives 8×5=40. That law is an **INFERRED explanation** consistent with the supplied answer; finite patterns admit alternatives. No unique-law proof or original-game fidelity claim. The rendered board, rotated transfer and paired control are authored implementations; their tests cannot establish human discovery. Candidate M8 in `STUDY.md`; no C01–C71 membership changes. No image upload or external publication.

Subsequent user direction, **Spokes-v2**: accept 8 as well as 40 initially; after 8, use 5→10, 6→18, 7→28, 8→? with answer 40; after 40, reverse all arrows and ask 40→? with answer 8. Same numbers, exactly two rounds; old rotated transfer removed. This is documented authored behavior, not new original-game evidence. First-round acceptance of 8 is stipulated; no unique alternative law is claimed.

## Scope and honesty

Except for entries explicitly updated in E09/E10, other corpus rows retain prior secondary evidence only; primary mechanical evidence **UNAVAILABLE in this bounded pass**, not “nonexistent.” See `COMPARISON.md` for individual mappings and exclusions. No broad discovery rerun. Some source text/date metadata conflicted or was dynamically updated; edition claims remain bounded accordingly. A correct implementation of our models cannot repair these original-evidence gaps.
