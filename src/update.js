/**
 * Imports
 */

import isThunk from './util/isThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import actions from './actions'
import _create from './create'
import diff, {CREATE, MOVE, REMOVE, UPDATE} from 'dift'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  const {
    setAttribute,
    removeAttribute,
    replaceChild,
    removeChild,
    insertBefore,
    renderThunk
  } = actions

  return updateRecursive

  function updateRecursive (prev, next) {

    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) next = effect(renderThunk(next, prev))
      prev = effect(renderThunk(prev))
      if (next === prev) {
        return (next.el = prev.el)
      }
    } else if (isThunk(next)) {
      next = effect(renderThunk(next))
    }

    const node = next.el = prev.el

    if (isText(prev)) {
      if (isText(next)) {
        if (prev.text !== next.text) effect(setAttribute(node, 'nodeValue', next.text))
        return node
      } else {
        const newNode = create(next)
        effect(replaceChild(node.parentNode, newNode, node))
        return newNode
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      const newNode = create(next)
      effect(replaceChild(node.parentNode, newNode, node))
      return newNode
    }

    /**
     * Diff attributes
     */

    const pattrs = prev.attrs
    const nattrs = next.attrs

    if (pattrs !== null) {
      forEach(pattrs, (val, key) => {
        if (!nattrs || !(key in nattrs)) {
          effect(removeAttribute(node, key))
        }
      })
    }

    if (nattrs !== null) {
      forEach(nattrs, (val, key) => {
        if (!pattrs || !(key in pattrs) || val !== pattrs[key]) {
          effect(setAttribute(node, key, val))
        }
      })
    }

    /**
     * Diff children
     */

    diff(prev.children, next.children, diffChild(node))

    return node
  }

  function diffChild (node) {
    return function (type, prev, next, pos) {
      switch (type) {
        case CREATE:
          effect(insertBefore(node, create(next), node.childNodes[pos] || null))
          break
        case UPDATE:
          updateRecursive(prev, next)
          break
        case MOVE:
          effect(insertBefore(node, updateRecursive(prev, next), nativeElement(prev)))
          break
        case REMOVE:
          effect(removeChild(node, nativeElement(prev)))
          break
      }
    }
  }
}

function nativeElement (vnode) {
  return vnode.vnode
    ? vnode.vnode.el
    : vnode.el
}

/**
 * Exports
 */

export default update
