# Experiment: Hacking `async` with Generators

> **Warning**: This is **not** production-quality code — as such it should never be used in a project you intend to publish.

An idiomatic use of generators for asynchronous code execution is to use it as it's own control device.

The `yield` keyword pauses execution of the generator function, and will only resume after `.next()` is called. If we `yield` the execution of an asynchronous function, and then call `.next()` within the callback, then we can reduce [callback hell](https://www.scaler.com/topics/callback-hell-in-javascript/#callback-hell) by resuming execution after the `yield` statement.

```js
const gen = createGenerator();
gen.next();

function* createGenerator() {
  const result = yield setTimeout(() => gen.next("Hello"), 1000);
  console.log(result); // (after 1s) "Hello" is printed to the console
  try {
    yield setTimeout(() => gen.throw(new Error('Something went wrong')), 1000);
  } catch (e) {
    console.error(e.message); // (after another 1s) Error logged
  }
}
```

We can do something like this with promises within the `.then()` callback. We can even leverage the generator's `.throw()` method to have errors thrown when we `.catch()` an error.

We could take this a step further and write a wrapper for an outer function that handles any `yield`ed promise or callback-style function. Digital Ocean's [Understanding Generators in Javascript](https://www.digitalocean.com/community/tutorials/understanding-generators-in-javascript#async-await-with-generators) article has a good example of this in their `asyncAlt()` implementation.

However, this all only seems to work on one level (perhaps we can use `yield*` delegation or pass the top-level generator in to nested functions to remedy this). The bigger limitation here is that it effectively linearalizes our code. Without some event loop, this does clean up our code, but it doesn't give us the benefits of cooperative concurrency.

The experiment in this folder attempts to use a queue to hold generators before running. Rather than have promise callbacks immediately call `generator.next()`, it pushes the generator and its next value onto the queue to run later.

> **Note**: This has nothing to do with [AsyncGenerators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator), which is something else with which you can do some [pretty nifty things](https://kamsar.net/index.php/2021/07/Fun-with-async-generators-and-for-await/).
