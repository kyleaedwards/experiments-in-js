/**
 * Mocks the go command to simulate running a coroutine and logs
 * any uncaught exceptions without crashing.
 *
 * @param {Promise} promise Promise instance
 * @returns Wrapped promise
 */
module.exports = promise => new Promise((resolve) => {
  let result;
  promise
    .then((res) => {
      result = res;
    })
    .catch(e => {
      // Is this why go doesn't have try/catch? It actually
      // seems like a huge pain to implement and would be
      // easier to conventially return an (error, value) tuple.
      console.error('Uncaught exception', e);
    })
    .finally(() => {
      resolve(result);
    });
});
