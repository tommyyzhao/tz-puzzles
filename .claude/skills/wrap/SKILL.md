---
name: wrap
description: >
  End-of-session persistence for tz-puzzles (Golden Hills and the puzzle studio). Routes the session's user
  feedback, decisions, verified state, learnings, live resources and next steps to their homes: the private
  memory/ submodule, goldenhills/DECISIONS.md, RESULTS.md / PLAYTEST.md, and the machine-local memory. Then
  commits and pushes both repos, and redeploys if the game changed. Run before compacting or ending any
  substantive session. Triggers on: "wrap up", "/wrap", "end of session", "compacting soon", "log memory",
  "write down learnings", "handoff", "persist this session".
---

# /wrap — tz-puzzles session wrap

The memory for this project is **`memory/`**: a git submodule pointing at the PRIVATE repo
`tommyyzhao/tz-puzzles-memory`. The main repo `tommyyzhao/tz-puzzles` is PUBLIC, and its game is live on Cloudflare.
So every wrap has three audiences: a fresh session after compaction (memory/), the user reviewing choices
(DECISIONS.md, RESULTS.md), and the public (repo + site). Route each fact to the right one.

**Quality bar:** an empty bucket is a correct answer ("none met the bar"). Quote the user verbatim when they
gave feedback or a ruling; paraphrase loses the nuance that later sessions need. Never claim fun, duration,
real-device performance, audio quality or screen-reader success without evidence: human evidence here is the
user's own informal play only.

## Homes (write only to these)

| What | Home | Tracked where |
|---|---|---|
| Handoff, user feedback verbatim, standing constraints, phase plan, open questions | `memory/handoff.md` | private memory repo |
| Architecture, APIs, rendering/harness pitfalls, verification commands | `memory/engineering.md` | private memory repo |
| Entry point + status line | `memory/README.md` | private memory repo |
| Design/implementation choices with a rejected alternative, and how to reverse them | `goldenhills/DECISIONS.md` (next `Dn`) | public repo |
| What was verified (and what was not) | `RESULTS.md` (newest dated section on top) | public repo |
| What the user should look for when playing | `PLAYTEST.md` (newest on top) | public repo |
| Test count / play link | `README.md` | public repo |
| Machine-local handles: server task id, browser-script paths, scratch dirs, credential *file paths* | `~/.claude/projects/-Users-admin-Projects-opensource-puzzles-tz-puzzles/memory/local-processes.md` and its `MEMORY.md` index | never in Git |

`RESEARCH.md` is a frozen record: never edit it. Its SHA-256 is in `memory/README.md`, so check it.

## Procedure

0. **Survey.** Run `git log --oneline -15` and `git -C memory log --oneline -5`, check `git status --short` in both repos,
   and scan the conversation. List: user messages (verbatim), decisions, files touched, tests and browser
   runs with results, deploys, peer-session messages, background tasks still running.

1. **Handoff first** (top of `memory/handoff.md`, replacing the status line; ≤150 words). A fresh session must be able to act on it alone:
   - **Status:** what is built, played, or pending the user's playtest.
   - **Shipped:** commit SHAs (main repo and memory repo) and the deployed version ID.
   - **Open:** the next atomic step, with `file:line`.
   - **Live now:** each running resource with `check:` and `stop:` (e.g. the server on :8765, a pending custom-domain route).
   - **Blocked on the user:** the exact question.

2. **User feedback, verbatim**, goes into `memory/handoff.md` under a dated section. For each item: the quote, the diagnosis
   (reproduced? how?), and the fix with its D-number. Interview answers also go here.

3. **Decisions** go into `goldenhills/DECISIONS.md` as `**Dn Title** (source).` Give the what, the why (the rejected alternative) and how to
   reverse it. Only real choices; routine implementation isn't a decision. If a later decision overrides an earlier one, add a
   follow-up note to the earlier entry rather than rewriting history.

4. **Verified state** goes into `RESULTS.md`: a new dated section with exact counts (tests N/N, interaction checks N/N, which
   viewports/modes), what each browser run proved, and an explicit **Not verified** line. Update the test count
   in `README.md` and `memory/engineering.md` if it changed.

5. **Learnings** go into `memory/engineering.md`. Only non-obvious traps that cost time, each as *discovery → consequence →
   how to re-prove*. Existing examples: an earlier python edit script asserted partway through so later edits never happened; check
   after every scripted edit. Colours inside a shader are linear. Harness key-by-key runs are slow: use the
   `__goldenhills.act` hook in batches. Raycast from outside a FrontSide mesh. `G` key collisions in `terrain.mjs`.

6. **Playtest asks** go into `PLAYTEST.md`, only when the build changed what the user should look at: a few numbered questions.

7. **Machine-local facts** go into `local-processes.md`: new browser scripts in `/private/tmp/tz-puzzles-browser.aOR6Eu/`
   and what each proves, new scratch dirs, server/task ids, and which agents/peers were contacted. Keep `MEMORY.md` a short
   index (under 200 lines). Never put these in Git.

8. **Peer sessions.** If the session coordinated with other Claude sessions (e.g. `safii-animation-sprint`, the Safii lead;
   `surreal-55`, the tz.mt deploy lead), record in `memory/handoff.md` what they own, what they said, and anything pending from them.
   Message a peer only if they have a concrete dependency (machine doctrine). The wrap itself is not a reason.

9. **Hygiene.**
   - **Tests:** `node --test tests.mjs architectures.test.mjs ui.test.mjs garden.test.mjs goldenhills/goldenhills.test.mjs` must be green.
   - **`RESEARCH.md` hash:** `shasum -a 256 RESEARCH.md` must equal the hash in `memory/README.md`.
   - **Secrets and local paths:** this pattern must return nothing outside `memory/` and `.claude/`:
     `grep -rIn -E "/Users/|/private/tmp|CLOUDFLARE_API|\.env\.local|aOR6Eu" . --exclude-dir=.git --exclude-dir=memory --exclude-dir=.claude --exclude-dir=vendor`
     Local paths are fine in `memory/` (private) and in this skill. Credentials are named, never quoted.
   - **Resources:** account for each one this session owns.
     - Browsers: the harness scripts close their own.
     - Background tasks: stop the ones that have finished their job.
     - The playtest server `b63ms0b8z` on :8765 stays running.
     - Never kill Chrome by name, and use no blanket kills.
   - **Local-only files:** `.local/` (e.g. `reset-save.html`) is git-ignored and stays that way.

10. **Commit and push.** The user authorized pushing to `main` on 2026-10-31 ("Commit + push to main branch").
    1. Commit and push the memory repo: `cd memory && git add -A && git commit -m "docs: wrap <date> <topic>" && git push`.
    2. Bump the submodule pointer in the main repo, then commit and push it: `git add -A && git commit -m "docs: session wrap <date> <topic>" && git push`.
       Use Conventional Commits, and end each message with the attribution trailer the harness gives.

11. **Redeploy if `goldenhills/` changed since the last deploy.** Deploy is authorized ("Deploy when ready").
    ```
    cd goldenhills && ( set -a; eval "$(grep -E '^(CLOUDFLARE_API_KEY|CLOUDFLARE_ACCOUNT_ID)=' /Users/admin/Projects/surreal/.env.local)"; set +a
      CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_KEY" npx -y wrangler@4 deploy )
    ```
    - Never echo the values.
    - Smoke-test the live site with `curl`: `/` returns 200 text/html, `/vendor/three/three.module.js` is immutable, and `/witness.mjs` returns 404.
    - Record the new version ID in the handoff.
    - **Custom domain:** add `"routes":[{"pattern":"goldenhills.tz.mt","custom_domain":true}]` to `wrangler.jsonc` only after the deploy lead reports the tz.mt zone `active`.

12. **Report to the user** in a few lines: what was persisted where, commit SHAs, deploy version, and anything left live or
    pending (with the exact question if blocked on them).

## Shape of work here (why the wrap looks like this)

- **Sessions run long and often autonomous** ("act on best judgement, document the decision"). So DECISIONS.md is how the
  user reviews what happened while they were away. It must be complete and reversible.
- **Feedback arrives as playtest reports** ("so confusing", "the box was pushed all the way to the left"). The fix
  must be traced back to the quote, and the diagnosis reproduced in the model (`goldenhills/model.mjs` is pure:
  replay the witness prefix in node and inspect the state) before any presentation change.
- **The puzzles are solver-gated and the user said to keep them** ("Keep the puzzles"). A wrap must flag any change to
  `world.mjs` grids or objects explicitly.
- **Compaction is frequent.** The handoff must survive with no chat history. Write it as if the reader has never seen the
  project, and point to `memory/README.md` first.
