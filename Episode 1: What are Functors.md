# Monads are Functors, but what are Functors

The short but maybe not so helpful description of Functors is that they are enhancers. They lift Functions and Values to a new type.

## Pure

Lifting values is done with a constructor (indicated by the `new` keyword in javascript)  or the function pure sometimes called return (not existing in JavaScript). This operation changes a values type, lifting it into the given Functor. In javascript, one of the constructors you have probably already used is the list literal `[]`. Writing `[1]` lifts `1` from the type `Number` to the type `Array` of `Number`.

If pure was defined for Array it would look like this:

``` js
function pure (x) {
  return [x]
}
```

## Fmap

Lifting values is not enough. We need to lift, or map, Functions too. You might have already used `Array.map`. It lets you apply a function to all of the elements in the Array returning a new Array with the result, like so:

``` js
function double (x) {
  return x * 2
}
var result = ([1, 2, 3]).map(double)
```

This assigns the Array `[2, 4, 6]` to the variable `result` however this is impractical for real functional programming wizardry. If we had a function `fmap` which did exactly what we needed, then it would create a new function which we could use on any Array later on. Using it would look something like this:

``` js
var lifted_double = fmap(double)
var result = lifted_double([1, 2, 3])
```

This would also assign the Array `[2, 4, 6]` to the variable `result`, the difference being that the lifted version of the function `double` is now assingned to the variable `lifted_double` and  can be reused and passed around.

## Composition

When defining `pure` and `fmap` it's not enough just to give them these names. They also need to follow some rules, or as the functional programming comunity like to call them laws. One of these is composition.

The result of fmap needs to be composable in the same way that the original, unlifted function, was. Formally this is referred to as preserving the structure of the original functions and their relationship between their types.

Normal Functions that take one argument are very easy to compose. If you take two functions `g` and `h`, where `h` returns values of the same type as the argument of `g`. Then you can compose `g` after `h` like so `g(h(x))` where `x` is a placeholder for the argument of the composition.

In JavaScript this would be:

``` js
function g_after_h(x) {
  return g(h(x))
}
```

We can of course generalise this function for any `g` and `h`:

``` js
function compose(g, h) {
  return function (x) {
    return g(h(x))
  }
}
```

Using the Array Functor as an example and some pseudo code I'll try to illustrate what it looks like when these rules of composition hold:

``` js
var fmap = function (f) {
  return function (array) {
    return array.fmap(f)
  }
}
var pure = function (value) {
  return new Array(value)
}

var add_one = function (x) {
  return x + 1
}
var double = function (x) {
  return x * 2
}

// The folowing part is  pseudo, and will probably not execute, because of how `===` works
fmap(compose(double, add_one)) === compose(fmap(double), fmap(add_one))
fmap(compose(double, add_one))(pure(1)) === pure(compose(double, add_one)(1))
```

## What happens `Then`?

There are a lot of hidden Functors in JavaScript, Promises are one example. Take a closer look at `then` and `resolve`.

``` js
function fmap(f) {
  return function (promise) {
    return promise.then(f)
  }
}

function pure(x) {
  return Promise.resolve(x)
}
```

This is only one example of a Functor in JavaScript. It seems like its a design pattern designed by nature, and when you start looking for Functors they are everywhere.
