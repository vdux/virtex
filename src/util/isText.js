/**
 * Check if a node is a text node
 */

function isText (vnode) {
  return typeof vnode.text !== 'undefined'
}

/**
 * Exports
 */

export default isText
