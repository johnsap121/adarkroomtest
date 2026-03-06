import assert from 'node:assert/strict';
import { TurnEngineCore } from '../script/turn_engine_core.js';

const engine = new TurnEngineCore();
const log = [];

engine.registerHook('a', (turn) => log.push(`hook-a-${turn}`), 10);
engine.registerHook('b', (turn) => log.push(`hook-b-${turn}`), 20);
engine.setTimeout(() => log.push('timeout-2'), 2);
engine.setInterval(() => log.push('interval-1'), 1);

engine.advanceTurn(3);

assert.deepEqual(log, [
  'hook-a-1',
  'hook-b-1',
  'interval-1',
  'hook-a-2',
  'hook-b-2',
  'timeout-2',
  'interval-1',
  'hook-a-3',
  'hook-b-3',
  'interval-1',
]);
