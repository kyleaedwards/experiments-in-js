/**
 * This file will hold synchronization utilities like mutexes and waitGroups.
 */

/**
 * Using a single-item channel, we can simulate a mutex. When the mutex is locked,
 * the channel is full, and no other caller can receive it until the lock is freed.
 */
module.exports.createMutex = () => {
  const channel = new Channel(1);
  return {
    async lock() {
      await channel.push(true);
      return () => channel.pop();
    }
  };
};

module.exports.waitGroup = () => {};
