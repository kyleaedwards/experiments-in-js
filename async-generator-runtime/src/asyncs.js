/**
 * Yieldable functions compatible with this demo runtime.
 */

/**
 * Wraps setTimeout to provide a delay in milliseconds.
 *
 * @param {Number} delay Time in milliseconds
 * @returns {Function} Wrapped setTimeout
 */
module.exports.sleep = delay =>
  (cb) => {
    console.info(`${delay}ms delay started`);
    setTimeout(() => {
      console.info(`${delay}ms delay finished`);
      cb();
    }, delay);
  };

/**
 * Wraps fetch/response.json() to return a yieldable
 * HTTP request.
 */
module.exports.requestJSON = (url, options = {}) =>
  (cb) => {
    console.info(`Starting request to ${url}`);
    let value;
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    })
      .then(res => res.json())
      .then((res) => {
        value = res;
        console.info(`Completing request to ${url}`);
      })
      .catch((e) => {
        console.error(`Request to ${url} failed: ${e.message}`);
      })
      .finally(() => {
        cb(value);
      });
  };
