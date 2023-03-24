const {
  run,
  sleep,
  requestJSON
} = require("..");

run(function* () {
  // First we fetch data from an external API.
  const data = yield requestJSON('https://pokeapi.co/api/v2/pokemon/pikachu');
  console.log(`Pikachu's ID is ${data.id} and...`);

  // Once we've fetched the data and printed some data to the console, now we sleep for 1s.
  yield sleep(1000);

  // Then we print some more!
  console.log(`...it's an ${data.types[0].type.name}-type pokemon!`);
});
