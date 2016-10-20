function keyword (keyw) {
  return function (text /* The text to parse*/) {
    if (keyw.length > text.length) {
      return undefined
    } else {
      for (var i = 0; i < keyw.length; i += 1) {
        if (keyw[i] !== text[i]) {
          return undefined
        }
      }
      return [keyw, text.slice(keyw.length)]
    }
  }
}
// it worked!
// we can parse keywords, but we dont have a monad yet!
// Monad needs composition, so we need to define how to compose them.
console.log(keyword('for')('foreach'))
