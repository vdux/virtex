/**
 * Compose functions
 */

function compose (a, b) {
  return function () {
    return a(b.apply(null, arguments))
  }
}

function composeAll (a, obj) {
  return Object
    .keys(obj)
    .reduce((acc, key) => {
      acc[key] = compose(a, obj[key])
      return acc
    }, {})
}

/**
 * Exports
 */

export default {
  compose,
  composeAll
}
