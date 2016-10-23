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
