/**
 * Check if something is a thunk
 */

function isThunk (vnode) {
  return typeof vnode.thunk !== 'undefined'
}

/**
 * Exports
 */

export default isThunk
