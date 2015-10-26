/**
 * Check if something is a thunk
 */

function isThunk (a) {
  return typeof a.thunk !== 'undefined'
}

/**
 * Exports
 */

export default isThunk
