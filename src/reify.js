/**
 * Render a thunk
 */

function reify (thunk, prev) {
   thunk.vnode = thunk.render(prev)
   return thunk.vnode
}

/**
 * Exports
 */

export default reify
