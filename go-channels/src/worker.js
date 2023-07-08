const { parentPort } = require('node:worker_threads');

// How can our "Go channels" run code on separate threads?
parentPort.on('message', (task) => {
  parentPort.postMessage(task.a + task.b);
});