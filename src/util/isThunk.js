/**
 * Check if something is a thunk
 */

function isThunk (vnode) {
  return vnode.type === 'thunk'
}

/**
 * Exports
 */

export default isThunk
