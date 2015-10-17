/**
 * Check if something is a thunk
 */

function isThunk (a) {
  return a && a.type === 'Thunk'
}

/**
 * Exports
 */

export default isThunk
