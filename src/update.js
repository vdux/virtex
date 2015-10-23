/**
 * Imports
 */

import {compose, composeAll} from './util/compose'
import isThunk from './util/isThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import actions from './actions'
import _create from './create'
import keyDiff, {CREATE, REMOVE, MOVE, UPDATE} from 'key-diff'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  const {
    createElement,
    setAttribute,
    removeAttribute,
    replaceChild,
    removeChild,
    insertBefore,
    renderThunk
  } = composeAll(effect, actions)

  return updateRecursive

  function updateRecursive (prev, next, node) {

    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) next = renderThunk(next, prev)
      prev = renderThunk(prev)
      if (next === prev) {
        next.element = node
        return node
      }
    } else if (isThunk(next)) {
      next = renderThunk(next)
    }

    next.element = node

    if (isText(prev)) {
      if (isText(next)) {
        if (prev.value !== next.value) setAttribute(node, 'nodeValue', next.value)
        return node
      } else {
        const newNode = create(next)
        replaceChild(node.parentNode, newNode, node)
        return newNode
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      const newNode = create(next)
      replaceChild(node.parentNode, newNode, node)
      return newNode
    }

    /**
     * Diff attributes
     */

    const pattrs = prev.attrs
    const nattrs = next.attrs

    forEach(pattrs, (val, key) => {
      if (!nattrs || !(key in nattrs)) {
        removeAttribute(node, key)
      }
    })

    forEach(nattrs, (val, key) => {
      if (!pattrs || !(key in pattrs) || val !== pattrs[key]) {
        setAttribute(node, key, val)
      }
    })

    /**
     * Diff children
     */

    keyDiff(prev.children, next.children, diffChild(node))
    return node
  }

  function diffChild (node) {
    const childNodes = node
    return function (type, prev, next, pos) {
      switch (type) {
        case CREATE:
          insertBefore(node, create(next), childNodes[pos] || null)
          break
        case UPDATE:
          updateRecursive(prev, next, nativeElement(prev))
          break
        case MOVE:
          insertBefore(node, updateRecursive(prev, next, nativeElement(prev)), childNodes[pos] || null)
          break
        case REMOVE:
          removeChild(node, nativeElement(prev))
          break
      }
    }
  }
}

function nativeElement (vnode) {
  return vnode.vnode
    ? vnode.vnode.element
    : vnode.element
}

/**
 * Exports
 */

export default update
