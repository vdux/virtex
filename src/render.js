/**
 * Imports
 */

import {compose, composeAll} from './compose'
import actions from './actions'
import isThunk from './isThunk'
import isText from './isText'
import _create from './create'

/**
 * Diff and render two vnode trees
 */

function render (effect) {
  const create = compose(effect, _create)
  const {
    createElement,
    setAttribute,
    removeAttribute,
    replaceChild,
    appendChild,
    removeChild,
    reifyThunk
  } = composeAll(effect, actions)


  return function renderRecursive (prev, next, node) {
    /**
     * Render thunks if necessary
     */

    if (isThunk(prev) && isThunk(next)) {
      next = reifyThunk(next, prev)
      prev = prev.vnode

      if (next === prev) {
        return
      }
    } else if (isThunk(prev)) {
      prev = prev.vnode
    } else if (isThunk(next)) {
      next = reifyThunk(next)
      next = next.vnode
    }

    if (isText(prev)) {
      if (isText(next)) {
        if (prev !== next) setAttribute(node, 'nodeValue', next)
        return
      } else {
        replaceChild(node.parentNode, create(next), node)
        return
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      replaceChild(node.parentNode, create(next), node)
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
        appendChild(node, create(next.children[i]))
      } else {
        renderRecursive(prev.children[i], next.children[i], node.childNodes[i])
      }
    }

    if (nextLen < prevLen) {
      for (let i = nextLen; i < prevLen; i++) {
        removeChild(node, node.childNodes[i])
      }
    }
  }
}

/**
 * Exports
 */

export default render
