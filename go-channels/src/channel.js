const CircularQueue = require("./circularQueue");

/**
 * Like the hchan struct in Go, this channel holds a circular queue that
 * represents its capacity for data.
 */
module.exports = class Channel {
  constructor(scheduler, size = 1) {
    this._scheduler = scheduler;
    this._queue = new CircularQueue(size);
  }

  /**
   * Private method. Attempts to queue a value, however if it fails,
   * this request is re-inserted onto the scheduler queue to try
   * again later.
   *
   * @param {*} value Value to be sent via channel
   * @param {Function} resolve Resolve from public method
   */
  _send(value, resolve) {
    if (this._queue.queue(value)) {
      resolve();
    } else {
      this._scheduler.register(() => {
        this._send(value, resolve);
      });
    }
  }

  /**
   * Return a promise that waits to resolve until the provided value
   * can push to the queue.
   *
   * @param {*} value Value to be sent via channel
   * @returns {Promise} Resolves when send completes
   */
  async send(value) {
    return new Promise((resolve) => {
      this._send(value, resolve);
    });
  }

  /**
   * Private method. Attempts to pull a value from the queue. If
   * the queue is empty,  this request is re-inserted onto th
   * scheduler queue to try again later.
   *
   * @param {Function} resolve Resolve from public method
   */
  _recv(resolve) {
    const result = this._queue.dequeue();
    if (result !== CircularQueue.EMPTY) {
      resolve(result);
    } else {
      this._scheduler.register(() => {
        this._recv(resolve);
      });
    }
  }

  /**
   * Return a promise that waits to resolve until the channel is populated.
   *
   * @returns {Promise} Resolves when receive completes
   */
  async recv() {
    return new Promise((resolve) => {
      this._recv(resolve);
    });
  }
};
