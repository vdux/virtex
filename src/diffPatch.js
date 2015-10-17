/**
 * Imports
 */

import removeAttribute from './removeAttribute'
import createElement from './createElement'
import setAttribute from './setAttribute'
import defaultReify from './reify'
import isThunk from './isThunk'
import isText from './isText'

/**
 * Diff two vnode trees
 */

function diffPatch (prev, next, node, opts = {}) {
  const {reify = defaultReify, doc = document} = opts

  /**
   * Render thunks if necessary
   */

  if (isThunk(prev) && isThunk(next)) {
    next = reify(next, prev)
    prev = prev.vnode

    if (next === prev) {
      return
    }
  } else if (isThunk(prev)) {
    prev = prev.vnode
  } else if (isThunk(next)) {
    next = reify(next)
    next = next.vnode
  }

  if (isText(prev)) {
    if (isText(next)) {
      if (prev !== next) node.nodeValue = next
      return
    } else {
      node.parentNode.replaceWith(createElement(next, opts), node)
      return
    }
  } else if (isText(next) || prev.tag !== next.tag) {
    node.parentNode.replaceChild(createElement(next, opts), node)
    return
  }

  /**
   * Diff attributes
   */

  for (let name in prev.attrs) {
    if (!next.attrs.hasOwnProperty(name)) {
      removeAttribute(node, name, prev.attrs[name])
    }
  }

  for (let name in next.attrs) {
    if (prev.attrs[name] !== next.attrs[name]) {
      setAttribute(node, name, next.attrs[name])
    }
  }

  /**
   * Diff children
   */

  const prevLen = prev.children.length
  const nextLen = next.children.length

  for (let i = 0; i < nextLen; i++) {
    if (i > prevLen) {
      node.appendChild(createElement(next.children[i], opts))
    } else {
      diffPatch(prev.children[i], next.children[i], node.childNodes[i], opts)
    }
  }

  if (nextLen < prevLen) {
    for (let i = nextLen; i < prevLen; i++) {
      node.childNodes[i].remove()
    }
  }
}

/**
 * Exports
 */

export default diffPatch
