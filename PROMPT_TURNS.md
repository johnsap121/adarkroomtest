# Goal: Convert timers to strict turns

## High-level goal
Refactor the game from real-time timers/cooldowns into a deterministic, strict turn-based system.

**Strict turns requirement**
- The game simulation MUST NOT advance based on real time.
- Nothing advances unless the player clicks "End Turn" (or presses an optional keyboard shortcut that triggers the same action).
- Do NOT implement auto-advance, do NOT implement turns-per-second.

## Definition of “turn”
- A “turn” is exactly one discrete simulation step.
- Anything that used to progress over time now progresses over turns.
- Any “cooldown seconds” becomes “cooldown turns”.

## Player interaction / UI
- Add a clear “End Turn” button that advances the game by exactly 1 turn.
- Optional: add a keyboard shortcut (e.g. Space or Enter) that triggers End Turn.
- UI that previously displayed seconds should display remaining turns (or remove countdown display if easier).

## Core architecture requirement
Introduce a single Turn Engine module (e.g. TurnEngine / Clock / GameTurn):
- `advanceTurn(n=1)` (n defaults to 1)
- deterministic, documented update order each turn
- modules register hooks / callbacks for turn ticks
- NO module may schedule real-time advancement (no setTimeout/setInterval for simulation)

## Systems to convert
Convert all sources of real-time simulation:
- setTimeout / setInterval / requestAnimationFrame loops that advance game state
- timers for actions/buildings/crafting/cooldowns
- periodic worker income / events / triggers
- anything keyed off Date.now / timestamps for progression

Serving the UI is fine, but simulation progression must be turn-driven.

## Save compatibility
- Existing saves must still load.
- If old saves contain time-based fields (timestamps, seconds remaining), migrate them to turn counters in a reasonable way.
- Document any migration assumptions in a short note.

## Deliverables
1) Code refactor implementing strict turns
2) Add a short `DESIGN_TURNS.md` describing:
   - what a turn is
   - update order per turn
   - how timers were mapped to turns
3) Add at least minimal automated logic-level tests:
   - Use Node’s built-in test runner (`node --test`)
   - At minimum, test TurnEngine determinism and one converted system

## Validation: must run before finishing
- `npm install`
- `npm test`
- (optional) `npm start` should still serve successfully

## Implementation plan (commit in stages)
Commit 1: Add TurnEngine skeleton + plumbing (no behavior change yet)
Commit 2: Convert smallest timer subsystem + tests
Commit 3: Convert remaining systems + save migration
Commit 4: UI polish + docs

## Non-goals
- Don’t redesign unrelated UI
- Don’t rebalance the game beyond what is required for correctness
- Don’t add auto-turn or idle-time advancement