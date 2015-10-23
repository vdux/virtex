/**
 * Imports
 */

import forEach from './forEach'
import apply from './fastApply'

/**
 * Compose functions
 */

function compose (a, b) {
  return function () {
    return a(b.apply(null, arguments))
  }
}

function composeAll (a, obj) {
  const res = {}

  forEach(obj, (val, key) => {
    res[key] = compose(a, obj[key])
  })

  return res
}

/**
 * Exports
 */

export default {
  compose,
  composeAll
}
