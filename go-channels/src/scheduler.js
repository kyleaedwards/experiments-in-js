/**
 * Crude scheduler to handle multiple channel events.
 */
module.exports = class Scheduler {
  constructor() {
    this._eventLoop = [];
    this._running = false;
  }

  /**
   * Registers a new function onto the event loop, usually called by a
   * channel operation.
   *
   * @param {Function} cb Callback
   */
  register(cb) {
    this._eventLoop.push(cb);
  }

  /**
   * Kicks off the scheduler and begin processing the event loop.
   */
  start() {
    if (this._running) return;
    this._running = true;
    this._run();
  }

  _run() {
    const cb = this._eventLoop.shift();
    if (cb instanceof Function) cb();
    if (this._running) setImmediate(this._run.bind(this));
  }

  /**
   * Stops the scheduler.
   */
  stop() {
    this._running = false;
  }
};
