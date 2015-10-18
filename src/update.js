/**
 * Imports
 */

import {compose, composeAll} from './util/compose'
import isThunk from './util/isThunk'
import isText from './util/isText'
import actions from './actions'
import _create from './create'

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
    appendChild,
    removeChild,
    renderThunk
  } = composeAll(effect, actions)


  return function updateRecursive (prev, next, node) {
    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) next = renderThunk(next, prev)
      prev = renderThunk(prev)
      if (next === prev) {
        return node
      }
    } else if (isThunk(next)) {
      next = renderThunk(next)
    }

    if (!prev) return create(next)

    if (isText(prev)) {
      if (isText(next)) {
        if (prev !== next) setAttribute(node, 'nodeValue', next)
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

    if (pattrs && !nattrs) {
      const keys = Object.keys(pattrs)
      for (let i = 0, len = keys.len; i < len; i++) {
        removeAttribute(node, keys[i], pattrs[keys[i]])
      }
    } else if (!pattrs && nattrs) {
      const keys = Object.keys(nattrs)
      for (let i = 0, len = keys.len; i < len; i++) {
        setAttribute(node, keys[i], nattrs[keys[i]])
      }
    } else if (pattrs && nattrs) {
      const cache = {}
      const pkeys = Object.keys(pattrs)
      const nkeys = Object.keys(nattrs)
      const len = Math.max(pkeys.len, nkeys.len)

      for (let i = 0; i < len; i++) {
        const p = pkeys[i]
        const n = nkeys[i]

        if (n !== undefined && !cache[n]) {
          cache[n] = true
          if (!pattrs.hasOwnProperty(n) || nattrs[n] !== pattrs[n]) {
            setAttribute(node, n, nattrs[n])
          }
        }

        if (p !== undefined && !cache[p]) {
          cache[p] = true
          if (!nattrs.hasOwnProperty(p)) {
            removeAttribute(node, p)
          } else if (nattrs[p] !== pattrs[p]) {
            setAttribute(node, p, nattrs[p])
          }
        }
      }
    }

    /**
     * Diff children
     */

    const nchildren = next.children
    const pchildren = prev.children
    const prevLen = pchildren.length
    const nextLen = nchildren.length

    for (let i = 0; i < nextLen; i++) {
      if (i > prevLen) {
        appendChild(node, create(nchildren[i]))
      } else {
        updateRecursive(pchildren[i], nchildren[i], node.childNodes[i])
      }
    }

    if (nextLen < prevLen) {
      // Remove nodes starting at the end so that the
      // index doesn't shift on us as we go
      for (let i = nextLen; i < nextLen; i++) {
        removeChild(node, node.lastChild)
      }
    }

    return node
  }
}

/**
 * Exports
 */

export default update
