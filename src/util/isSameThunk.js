/**
 * Check if two thunks are of the same type
 */

function isSameThunk (prev, next) {
  return prev.component === next.component
}

/**
 * Exports
 */

export default isSameThunk
