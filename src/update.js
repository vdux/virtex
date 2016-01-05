/**
 * Imports
 */

import {insertNode, updateNode, replaceNode, removeNode, updateThunk, destroyThunk} from './actions'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from 'dift'
import {isThunk, isSameNode, key} from './util'
import _create from './create'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  return (prev, next) => updateRecursive(prev, next, '0', 0)

  function updateRecursive (prev, next, path) {
    next.path = path

    if (!isSameNode(prev, next)) {
      unrenderThunks(prev)
      return effect(replaceNode(prev, create(next, path)))
    } else if (isThunk(next)) {
      next = effect(updateThunk(next, prev))
      prev = effect(updateThunk(prev))

      return prev === next
        ? next
        : updateRecursive(prev, next, path, 0)
    } else {
      effect(updateNode(prev, next))

      /**
       * Diff children
       */

      diff(prev.children, next.children, (type, pItem, nItem, pos) => {
        switch (type) {
          case UPDATE:
            return updateRecursive(pItem, nItem, path + '.' + pos)
          case CREATE:
            return effect(insertNode(node, create(nItem, path + '.' + pos), pos))
          case MOVE:
            return effect(insertNode(node, updateRecursive(pItem, nItem, path + '.' + pos), pos))
          case REMOVE:
            unrenderThunks(pItem)
            return effect(removeNode(pItem))
        }
      }, key)

      return next
    }
  }

  function unrenderThunks (vnode) {
    while (isThunk(vnode)) {
      effect(destroyThunk(vnode))
      vnode = effect(updateThunk(vnode))
    }

    const children = vnode.children

    for (let i = 0, len = children.length; i < len; ++i) {
      unrenderThunks(children[i])
    }

    return vnode
  }
}

/**
 * Exports
 */

export default update
