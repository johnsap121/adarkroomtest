# Turn System Design

## What A Turn Is
A turn is exactly one simulation step triggered by the player via `End Turn` (or Space key).
No simulation state should advance unless `Engine.advanceTurn()` is called.

## Turn Update Order
For each turn:
1. Increment `game.turn`.
2. Run registered turn hooks in stable order (`order`, then `name`).
3. Execute due timer callbacks (`Engine.setTimeout`/`Engine.setInterval`) in creation order.
4. Persist state.

## Timer Mapping
- Legacy millisecond timers are mapped with `ceil(ms / 1000)`.
- `1000ms` => `1` turn.
- A cooldown previously shown/managed in seconds is now tracked in integer turns.
- Engine timer wrappers (`Engine.setTimeout`, `Engine.setInterval`) now schedule by turn count.
- Core progression systems now use explicit turn constants where pacing matters (`Engine.setTurnTimeout` / `Engine.setTurnInterval`) to avoid excessive dead turns from minute-based legacy timings.

## Systems Converted
- Core simulation scheduler in `engine.js` now uses turn timers.
- Income and periodic resource changes now advance only through turn timers.
- Room fire/temperature/builder progression uses turn timers.
- Outside population scheduling uses turn timers.
- Combat status/DoT/enemy attack intervals were switched to turn timers.
- Button cooldowns now decrement per turn.

## Save Migration Assumptions
- Existing saves are preserved.
- Legacy countdown-like values are normalized to integer turns with `ceil`:
  - `cooldown.*`
  - `income[*].delay`
  - `income[*].timeLeft`
  - `wait.*`
- `game.turn` is initialized to `0` when missing.

## Notes
Some UI-only animations still use browser animation timing; these do not advance simulation state.
