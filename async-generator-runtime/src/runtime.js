/**
 * This is an extremely hacky runtime to handle asynchronous events via
 * generators and the `yield` keyword as opposed to `async/await`.
 */
module.exports = class Runtime {
  constructor() {
    /**
     * Holds tasks to be run. When a "blocked" async function responds
     * to its callback, the generator and its new value are placed back
     * onto the event queue.
     */
    this._eventQueue = [];

    /**
     * Allows the runtime to be paused
     */
    this._running = false;
  }

  /**
   * Start the runtime and begin trampolining.
   * 
   * @param {Function} init Initial generator
   */
  start(init = function* () {}) {
    const self = this;
    this._running = true;
    this._eventQueue.push({ fn: (function* () {
      yield init();
      self.stop();
    })() });
    this.trampoline();
  }

  /**
   * Pause the runtime. Trampolining will cease after the current
   * iteration stops.
   */
  stop() {
    this._running = false;
  }

  /**
   * Trampoline method to pull items off of the event queue when available
   * and run them, otherwise using a short timeout to wait for the next
   * iteration and prevent a stack overflow.
   *
   * Since we're running this inside of the JS runtime, we don't have the
   * option to spin off a separate OS thread and use a traditional loop on
   * this one.
   */
  trampoline() {
    const task = this._eventQueue.shift();

    if (task) {
      /**
       * The `value` and `done` fields are returned by JS generator
       * executions. We rely on `done` to indicate that we have no need to
       * push the generator back onto the queue.
       */
      const { value: yielded, done } = task.fn.next(task.result);

      // Not every yield-able object will be an function with a callback.
      // Because of this, we need to handle generators and static values
      // differently.
      if (!done) {
        // Here we wrap yielded into an array if it's not already. This
        // is so we can support Promise.all()-style concurrent requests.
        const values = Array.isArray(yielded) ? yielded : [yielded];
        for (const value of values) {
          if (value && value.toString() === '[object Generator]') {
            // To support nested generators, it's important to store a
            // reference to the parent when a generator first enters the
            // queue. This allows us to check for a parent when a
            // generator is done and put it back in the flow.
            this._eventQueue.push({ fn: value, parent: task });
          } else if (value instanceof Function) {
            // If the yielded value is a non-generator function, we can
            // pass it a callback to resume execution after obtaining
            // a result. However, if the function does not execute the
            // callback, the current task will never get resumed.
            //
            // Because of this, for demonstration purposes, I've set
            // up some compatible "async" functions in the asyncs.js
            // file.
            //
            // Note that if we want to support conventional node-style
            // callbacks, we would need to accept both an error and a
            // result, but errors would need to propogate up somehow.
            value((result) => {
              this._eventQueue.push({ ...task, result });
            });
          } else {
            // Just as a precaution, if you yield a non-function, just
            // return the value.
            this._eventQueue.push({ ...task, result: value });
          }
        }
      } else if (task.parent) {
        this._eventQueue.push({ ...task.parent, result: task.result })
      }
    }

    // Re-run the trampoline function.
    if (this._running) setImmediate(this.trampoline.bind(this));
  }
}
