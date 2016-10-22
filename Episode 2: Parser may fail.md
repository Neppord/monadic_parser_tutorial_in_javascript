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
