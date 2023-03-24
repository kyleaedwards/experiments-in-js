/**
 * Crude implementation of a circular queue with a limited capacity.
 */
module.exports = class CircularQueue {
  /**
   * Sentinel to indicate an empty list to
   * differentiate from undefined values.
   */
  static EMPTY = {};

  constructor(size) {
    this.size = size;
    this.buf = new Array(size);
    this.wx = -1;
    this.rx = -1;
  }

  /**
   * Removes the last item at the read head and returns it
   * (or the EMPTY sentinel) to the caller.
   *
   * @returns {*} Value at the read queue if not empty
   */
  dequeue() {
    if (this.rx < 0) return CircularQueue.EMPTY;
    const value = this.buf[this.rx];
    if (this.rx === this.wx) {
      this.wx = this.rx = -1;
    } else {
      this.rx = (this.rx + 1) % this.size;
    }
    return value;
  }

  /**
   * Add item to the write head of the circular queue. If the
   * queue is at capacity, return false
   *
   * @param {*} value Value to be added to list
   * @returns {boolean} True if successful
   */
  queue(value) {
    let next = (this.wx + 1) % this.size;
    if (next === this.rx) return false;
    if (this.wx < 0) {
      this.rx = 0;
    }
    this.buf[next] = value;
    this.wx = next;
    return true;
  }
};
