/**
 * Imports
 */

import forEach from './forEach'

/**
 * Compose functions
 */

function compose (a, b) {
  return function innerCompose (c, d, e) {
    return a(b(c, d ,e))
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
