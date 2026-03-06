import assert from 'node:assert/strict';
import { msToTurns } from '../script/turn_engine_core.js';

assert.equal(msToTurns(1), 1);
assert.equal(msToTurns(999), 1);
assert.equal(msToTurns(1000), 1);
assert.equal(msToTurns(1001), 2);
assert.equal(msToTurns(4500), 5);
assert.equal(msToTurns(-10), 1);
