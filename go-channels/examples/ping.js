const { setTimeout: sleep } = require('timers/promises');
const {
  Channel,
  go,
  Scheduler,
  sync,
} = require('..');

/**
 * Simple channel demo volleying ping/pong messages between
 * two channels.
 */

(async () => {
  const scheduler = new Scheduler();
  scheduler.start();

  const ping = new Channel(scheduler);
  const pong = new Channel(scheduler);

  // Ping
  go((async () => {
    while (true) {
      const ball = await ping.recv();
      console.log(`Ping receives`);
      await sleep(Math.floor(1000 * Math.random()));
      ball.hits++;
      console.log(`Ping hits #${ball.hits}`);
      await pong.send(ball);
    }
  })());

  // Pong
  go((async () => {
    while (true) {
      const ball = await pong.recv();
      console.log(`Pong receives`);
      await sleep(Math.floor(1000 * Math.random()));
      ball.hits++;
      console.log(`Pong hits #${ball.hits}`);
      await ping.send(ball);
    }
  })());

  // Let ping serve
  await ping.send({ hits: 0 });
})();
