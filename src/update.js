/**
 * Imports
 */

import {compose, composeAll} from './util/compose'
import isThunk from './util/isThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import actions from './actions'
import _create from './create'
import keyDiff from 'key-diff'

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
    insertBefore,
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

    if (isText(prev)) {
      if (isText(next)) {
        if (prev !== next) setAttribute(node, 'nodeValue', next)
        return node
      } else {
        const newNode = create(next)
        replaceChild(node.parentNode, newNode, node)
        return newNode
      }
    } else if (isText(next) || !prev || prev.tag !== next.tag) {
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
      forEach(pattrs, (val, key) => removeAttribute(node, key))
    } else if (!pattrs && nattrs) {
      forEach(nattrs, (val, key) => setAttribute(node, key, val))
    } else if (pattrs && nattrs) {
      const cache = {}
      const pkeys = Object.keys(pattrs)
      const nkeys = Object.keys(nattrs)
      const len = Math.max(pkeys.length, nkeys.length)

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

    keyDiff(prev.children, next.children, ({type, prev, next, pos}) => {
      switch (type) {
        case keyDiff.CREATE:
          const oldChild = node.childNodes[pos]
          const newChild = create(next.item)

          if (oldChild) insertBefore(node, newChild, oldChild)
          else appendChild(node, newChild)
          break
        case keyDiff.REMOVE:
          removeChild(node, node.childNodes[prev.idx])
          break
        case keyDiff.MOVE:
          const child = node.childNodes[prev.idx]
          updateRecursive(prev.item, next.item, child)
          removeChild(node, child)
          insertBefore(node, child, node.childNodes[pos])
          break
        case keyDiff.UPDATE:
          updateRecursive(prev.item, next.item, node.childNodes[next.idx])
          break
      }
    })

    return node
  }
}

/**
 * Exports
 */

export default update
