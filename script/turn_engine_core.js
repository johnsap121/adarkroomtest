export class TurnEngineCore {
  constructor() {
    this.turn = 0;
    this._hooks = [];
    this._timers = new Map();
    this._nextId = 1;
  }

  registerHook(name, callback, order = 0) {
    this._hooks = this._hooks.filter((h) => h.name !== name);
    this._hooks.push({ name, callback, order });
    this._hooks.sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name));
  }

  setTimeout(callback, delayTurns = 1) {
    const id = this._nextId++;
    const turns = Math.max(1, Math.ceil(delayTurns));
    this._timers.set(id, {
      id,
      callback,
      nextTurn: this.turn + turns,
      intervalTurns: null,
    });
    return id;
  }

  setInterval(callback, delayTurns = 1) {
    const id = this._nextId++;
    const turns = Math.max(1, Math.ceil(delayTurns));
    this._timers.set(id, {
      id,
      callback,
      nextTurn: this.turn + turns,
      intervalTurns: turns,
    });
    return id;
  }

  clear(id) {
    this._timers.delete(id);
  }

  advanceTurn(n = 1) {
    const steps = Math.max(1, Math.floor(n));
    for (let i = 0; i < steps; i += 1) {
      this.turn += 1;
      for (const hook of this._hooks) {
        hook.callback(this.turn);
      }
      const due = [...this._timers.values()]
        .filter((timer) => timer.nextTurn <= this.turn)
        .sort((a, b) => a.id - b.id);
      for (const timer of due) {
        if (!this._timers.has(timer.id)) {
          continue;
        }
        timer.callback(this.turn);
        if (!this._timers.has(timer.id)) {
          continue;
        }
        if (timer.intervalTurns) {
          timer.nextTurn = this.turn + timer.intervalTurns;
          this._timers.set(timer.id, timer);
        } else {
          this._timers.delete(timer.id);
        }
      }
    }
  }
}

export function msToTurns(ms, turnMs = 1000) {
  if (typeof ms !== 'number' || ms <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(ms / turnMs));
}
