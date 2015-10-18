/**
 * Check if a node is a text node
 */

function isText (vnode) {
  return typeof vnode === 'string' || typeof vnode === 'number'
}

/**
 * Exports
 */

export default isText
