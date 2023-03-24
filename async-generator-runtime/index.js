const Runtime = require('./src/runtime');
const {
  sleep,
  requestJSON
} = require('./src/asyncs');

/**
 * Helper function to make examples more readable.
 *
 * @param {Function*} gen Outer generator function
 * @returns {Runtime} Runtime instance
 */
const run = (gen) => {
  const runtime = new Runtime();
  runtime.start(gen);
  return runtime;
};

module.exports = {
  Runtime,
  sleep,
  requestJSON,
  run
};
