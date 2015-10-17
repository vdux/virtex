/**
 * Imports
 */

import setAttribute from './setAttribute'
import defaultReify from './reify'
import isThunk from './isThunk'
import isText from './isText'

/**
 * Create the initial document fragment
 */

function createElement (vnode, opts = {}) {
  const {doc = document, reify = defaultReify} = opts

  if (isThunk(vnode)) {
    vnode = reify(vnode)
  } else if (isText(vnode)) {
    return document.createTextNode(vnode)
  }

  const {tag, attrs, children} = vnode
  const node = doc.createElement(tag)

  for (let name in attrs) {
    setAttribute(node, name, attrs[name])
  }

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const childNode = createElement(children[i], opts)
      if (childNode) {
        node.appendChild(childNode)
      }
    }
  }

  return node
}

/**
 * Exports
 */

export default createElement
