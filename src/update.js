/**
 * Imports
 */

import isString from 'is-string'
import isUndefined from 'is-undefined'
import forEach from 'foreach'
import {setAttribute, removeAttribute, replaceNode, removeNode, insertBefore, createThunk, updateThunk, destroyThunk} from './actions'
import _create from './create'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from 'dift'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  return (prev, next) => updateRecursive(prev, next, '0', 0)

  function updateRecursive (prev, next, path, idx) {
    const ptype = prev.type
    const ntype = next.type
    const pattrs = prev.attrs
    const nattrs = next.attrs
    const node = next.el = prev.el

    if (ptype !== ntype) {
      if (!isString(ptype)) {
        prev = unrenderThunks(prev)
      }

      const oldNode = prev.el
      const newNode = next.el = create(next)
      effect(replaceNode(oldNode, newNode))
      return newNode
    } else if (ntype === '#text') {
      if (nattrs.nodeValue !== pattrs.nodeValue) {
        effect(setAttribute(node, 'nodeValue', nattrs.nodeValue))
      }

      return node
    } else if (!isString(ntype)) {
      next.path = path = path + '.' + idx
      next = effect(updateThunk(next, prev))
      prev = prev.vnode

      return prev === next
        ? next.el = prev.el
        : updateRecursive(prev, next, path, 0)
    } else {
      /**
       * Diff attributes
       */

      forEach(pattrs, (val, key) => {
        if (!nattrs || isUndefined(nattrs[key])) {
          effect(removeAttribute(node, key))
        }
      })

      forEach(nattrs, (val, key) => {
        if (!pattrs || val !== pattrs[key]) {
          effect(setAttribute(node, key, val))
        }
      })

      /**
       * Diff children
       */

      diff(prev.children, next.children, (type, pItem, nItem, pos) => {
        switch (type) {
          case UPDATE:
            return updateRecursive(pItem, nItem, path, pos)
          case CREATE:
            return effect(insertBefore(node, create(nItem, path, pos), node.childNodes[pos] || null))
          case MOVE:
            return effect(insertBefore(node, updateRecursive(pItem, nItem, path, pos), node.childNodes[pos] || null))
          case REMOVE:
            unrenderThunks(pItem)
            return effect(removeNode(nativeElement(pItem)))
        }
      }, key)

      return node
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
    while (vnode.vnode) {
      effect(destroyThunk(vnode))
      vnode = vnode.vnode
    }

    unrenderChildren(vnode)
    return vnode
  }

  function unrenderChildren (vnode) {
    const children = vnode.children

    for (let i = 0, len = children.length; i < len; ++i) {
      unrenderThunks(children[i])
    }
  }
}

/**
 * Exports
 */

export default update
