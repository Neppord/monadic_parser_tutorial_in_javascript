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
# A Parser may fail

What should happen when we call a function with arguments of the correct type but still are unusable to us? Or how do we tell the caller that the function can't produce the correct output.

There are many ways to solve this, and it has been solved many times with different result. We could throw a exception. We could say that functions always return the 'success code' and use autput parameters as a way to return values. We can return something that is of the wrong type, or we can 'lift' the type to include a special value that signals failure.

In JavaScript and many other languages all types are already lifted this way. Integers are not only integers they also include `null` so they are a Nullable type. In Javascript types also include `undefined` and to be fair in JavaScript all values are in the same type, but lets not talk about that. We could argue that every value in JavaScript is in the Maybe Functor, all values could be of its type or `undefined`.

Lets write an example, a function `head` that fetches the first element from an Array:

``` js
function head (array) {
  if (array.length !== 0) {
    return array[0]
  } else {
    return undefined
  }
}
```

So this function returns something of the type that the Array contains or `undefined`.

# Pure

So we actually don't need to define a way to lift types to the Maybe Functor in JavaScript since all types are a Maybe type.

# Fmap

Fmap is easy, we will just ignore maping the value if its undefined.

``` js
function maybe_fmap (f) {
  return function (value) {
    if (value === undefined) {
      return undefined
    } else {
      return f(value)
    }
  }
}
```

But what does this mean? It means that if you fmap something it wont run if something before it have had a `undefined` behaviour. This is both handy and dangerus and is definetly something you want to opt-in to and not have as a default behaviour. We will see usage of this later.

# Examples

``` js

double_head = compose(maybe_fmap(double), head)

double_head([]) // undefined
double_head([1]) // 2
```
# Parsers have side effects

When parsing a string from the input its not only finding the parsed phrase that is the effect of calling the parser but also consuming the phrase from the input.

## Side effects without side effects.

How can we model a function that takes a string and returns a string so that it also changes the first string for later parsers. For some this might be oblius for others not. But the easy answare is to not only return what you have produced but also whats left from the thing you are consuming. So by writing a function that returns a string and retuns a pair of the parsed string and whats left of the input we can continue to use whats left or roleback and reuse the original input if we whant to have a nother go on parsing the input differently.

## Wait, is pair a Functor?

Yes, a pair is a Functior. It is atualy two Functors or a Bifunctor. Lets first implement a Functor for the first value of the pair:

``` js
function map_first(f) {
  return function (pair) {
    return [f(pair[0]), pair[1]]
  }
}
```

You can probably already guess the implementation for `map_second` but here it is in any case:

``` js
function map_second(f) {
  return function (pair) {
    return [pair[0], f(pair[1])]
  }
}
```

Lets also implment the bimap, since a pair is a bifunktor:

``` js
function bimap_pair(f, g) {
  return function (pair) {
    return [f(pair[0]), g(pair[1])]
  }
}
```

## Do we know any other Bifunctiors?

The maybe functor is almost a Bifunctor. A closly related functor Either which is a general case og Maybe is a Bifunctor. Either is a type that is one of two types, its like a invers pair. And Maybe is Either undefied or the type of oure choise.

We are not going into depth of Either here, I only wanted it as a bridg to implement the diagonal for maybe that also is posible for Either. Here is the Diabonal for maybe:

``` js
function diag_maybe(f) {
  return function (value) {
    if (value === undefined) {
      return f(value)
    } else {
      return value
    }
  }
}
```

Diag takes a function that returns something of the same type as is lifted with Maybe and is called if the value is undefined.

This is yet again very similar to how a Promise works in javascript. Which makes Promise a Functor, Bifunctor and a Diagonal Bifunctor.
o
# Our First Parser

The parser that we are going to build are functions. There input is a string and there output is a pair of there result and the rest of the input that they have yet not consumed. The parser are also alowed to fail by returning undefined.

Lets implement a super simple parser that can consume a singel '1' and return it.

``` js
function one(input) {
  if (input[0] === '1') {
    return ['1', input.slice(1)]
  } else {
    return undefined
  }
}
```

It simple and not so interesting, i agree. Lets see what we can do with it. We could use the `one`parser to  parse the number '11':

``` js
function eleven (input) {
  var result = one(input)
  if (result !== undefined) {
    result2 = one(result[0])
    if (result2 !== undefined) {
      return [result[0] + result2[0], result2[1]]
    } else {
      return undefined
    }
  } else {
    return undefined
  }
}
```

So much code for almost no work, lets generalise and simplify.

## Composition

Monadic parsers are all about composition, but we cant compose them with ordenary function composition it will not work, parsers have not the same input as output. This is more or less what monads solve, compose Functors with there unliftetd counterpart.

Simply put what we do is that we redefine composition for this set of functions:

``` js
function compose_parsers(p2, p1) {
  retrurn function (input) {
    r1 = p1(input)
    if (r1 === undefined) {
      return undefined
    } else {
      r2 = p2(r1[1])
      if (r2 === undefined) {
        return undefined
      } else {
        return [r1[0] + r2[0] , r2[1]]
      }
    }
  }
}
```

Using the Maybe Functor and new style JavaScript functions we can simplify but its still not that nice to look at, we will fix this later:

``` js
var compose_parsers = p1 => p2 =>
  input => maybe_fmap(
    r1 => maybe_fmap(
    r2 => [r1[0] + r2[0], r2[1]]
    )(p2(r1[1]))
    )(p1(input)
  )
```

Using composition to build the `eleven` parser is now super simple:

``` js
var eleven = compose_parsers(one)(one)
```


# Bind

Even if parsers now can be composed they produce quite useless results. The reason is that we have no way to create results that are different from what we have parserd. There is a trick, a function called bind.


Bind takes a parser as first argument and a function wich will recive what whcih is parsed and should return a parser reciing what is left to parse. If any of the parsers fail the parser returned by bind will fail.

``` js
var bind_parser = p => f =>
  input => maybe_fmap(r => f(r[0])(r[1]))(p(input))

var pure_parser = value =>
  input => [value, input]

var eleven = (
  bind_parser(one)(first_one =>
  bind_parser(one)(second_one =>
  pure_parser(first_one + second_one)
)))
```
See! That was not so bad, and it looks better too!

## Example

Lets build a parser that can add two ones togeather.

``` js
var plus = input => input[0] === '+' ? ['+', input.slice(1)] : undefined
var number = (
  bind_parser(one)(str =>
  pure_parser(parseInt(str))
))
var expr = (
  bind_parser(number)(a =>
  bind_parser(plus)(_ =>
  bind_parser(number)(b =>
  pure_parser(a + b)
))))
expr('1+1') // [2, '']
```
# Regular Expressions

``` js
let match = reg =>
  input => {
    let texts = reg.exec(input)
    if (texts === null) {
      return undefined
    } else {
      let text = texts[0]
      return [text, input.slice(text.length)]
    }
  }
```
