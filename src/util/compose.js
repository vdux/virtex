/**
 * Compose functions
 */

function compose (a, b) {
  return function () {
    switch (arguments.length) {
      case 1:
        return a(b(arguments[0]))
      case 2:
        return a(b(arguments[0], arguments[1]))
      case 3:
        return a(b(arguments[0], arguments[1], arguments[2]))
      case 4:
        return a(b(arguments[0], arguments[1], arguments[2], arguments[3]))
      case 5:
        return a(b(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]))
      default:
        return a(b.apply(null, arguments))
    }
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
