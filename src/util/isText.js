/**
 * Check if a node is a text node
 */

function isText (vnode) {
  return vnode && vnode.type === 'text'
}

/**
 * Exports
 */

export default isText
