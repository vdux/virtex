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

    keyDiff(prev.children, next.children, (type, prev, next, pos) => {
      switch (type) {
        case keyDiff.CREATE:
          insertBefore(node, create(next), node.childNodes[pos] || null)
          break
        case keyDiff.REMOVE:
          removeChild(node, nativeElement(prev))
          break
        case keyDiff.MOVE:
          const oldNode = nativeElement(prev)
          updateRecursive(prev, next, oldNode)
          insertBefore(node, nativeElement(next), node.childNodes[pos] || null)
          break
        case keyDiff.UPDATE:
          updateRecursive(prev, next, nativeElement(prev))
          break
      }
    }, isSameVnode)

    return node
  }
}

function isSameVnode (a, b) {
  const aKey = a.item.attrs && a.item.attrs.key
  const bKey = b.item.attrs && b.item.attrs.key
  return aKey === bKey
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
