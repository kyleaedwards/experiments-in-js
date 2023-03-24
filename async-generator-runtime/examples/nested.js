const {
  run,
  sleep
} = require("..");

function* outer() {
  console.log('outer() starting')
  yield sleep(2000)
  console.log('calling inner()')
  const res = yield inner()
  console.log(`inner() returned "${res}"`)
  yield sleep(3000)
  console.log('outer() ending')
}

function* inner() {
  console.log('inner() starting')
  yield sleep(1000)
  console.log('inner() ending')
  yield 'all done!'
}

run(function* () {
  yield outer()
});
