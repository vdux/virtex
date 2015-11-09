/**
 * Imports
 */

import isThunk from './util/isThunk'
import isSameThunk from './util/isSameThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import * as actions from './actions'
import _create from './create'
import diff, * as ops from 'dift'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  const {setAttribute, removeAttribute, replaceChild, removeChild, insertBefore, renderThunk, unrenderThunk} = actions
  const {CREATE, MOVE, REMOVE, UPDATE} = ops

  return (prev, next) => updateRecursive(prev, next, '', 0)

  function updateRecursive (prev, next, path, idx) {

    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) {
        if (!isSameThunk(prev, next)) {
          unrenderThunk(prev)
        }

        next.path = path + '.' + idx
        next = effect(renderThunk(next, prev))
      } else {
        effect(unrenderThunk(prev))
      }

      prev = prev.vnode

      if (next === prev) {
        return (next.el = prev.el)
      } else {
        return updateRecursive(prev, next, next.path + '.0')
      }
    } else if (isThunk(next)) {
      next.path = path + '.' + idx
      next = effect(renderThunk(next))
      return updateRecursive(prev, next, next.path + '.0')
    }

    const node = next.el = prev.el

    if (isText(prev)) {
      if (isText(next)) {
        if (prev.text !== next.text) effect(setAttribute(node, 'nodeValue', next.text))
        return node
      } else {
        const newNode = next.el = create(next)
        effect(replaceChild(node.parentNode, newNode, node))
        return newNode
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      const newNode = next.el = create(next)
      unrenderChildren(prev)
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

    diff(prev.children, next.children, diffChild(node, path), key)

    return node
  }

  function diffChild (node, path) {
    return function (type, pItem, nItem, pos) {
      switch (type) {
        case UPDATE:
          return updateRecursive(pItem, nItem, path, pos)
        case CREATE:
          return effect(insertBefore(node, create(nItem, path, pos), node.childNodes[pos] || null))
        case MOVE:
          return effect(insertBefore(node, updateRecursive(pItem, nItem, path, pos), node.childNodes[pos] || null))
        case REMOVE:
          unrenderThunks(pItem)
          return effect(removeChild(node, nativeElement(pItem)))
      }
    }
  }

  function key (vnode) {
    return vnode.key
  }

  function nativeElement (vnode) {
    while (vnode.vnode) vnode = vnode.vnode
    return vnode.el
  }

  function unrenderThunks (vnode) {
    if (isThunk(vnode)) {
      effect(unrenderThunk(vnode))
      vnode = vnode.vnode
    }

    unrenderChildren(vnode)
  }

  function unrenderChildren (vnode) {
    const children = vnode.children

    if (children) {
      for (let i = 0, len = children.length; i < len; ++i) {
        unrenderThunks(children[i])
      }
    }
  }
}

/**
 * Exports
 */

export default update
