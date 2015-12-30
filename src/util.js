/**
 * Imports
 */

import isString from '@f/is-string'

/**
 * Utilities
 */

function isThunk (a) {
  return !isString(a.type)
}

function isSameNode (a, b) {
  return a.type === b.type
}

function key (a) {
  return a.key
}

/**
 * Exports
 */

export default {
  isThunk,
  isSameNode,
  key
}
