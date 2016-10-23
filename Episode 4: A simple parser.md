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
