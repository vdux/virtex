/**
 * Imports
 */

import {insertNode, updateNode, replaceNode, removeNode, updateThunk, destroyThunk} from './actions'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from 'dift'
import {isThunk, isSameNode, getKey} from './util'
import forEach from '@f/foreach'
import _create from './create'

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  return (prev, next) => updateRecursive(prev, next, '0')

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
        : updateRecursive(prev, next, path + '.0')
    } else {
      effect(updateNode(prev, next))

      /**
       * Diff children
       */

      diff(prev.children, next.children, (type, pItem, nItem, pos) => {
        const key = isUndefined(nItem.key) ? pos : nItem.key
        const subpath = path + '.' + key

        switch (type) {
          case UPDATE:
            return updateRecursive(pItem, nItem, subpath)
          case CREATE:
            return effect(insertNode(node, create(nItem, subpath), pos))
          case MOVE:
            return effect(insertNode(node, updateRecursive(pItem, nItem, subpath), pos))
          case REMOVE:
            unrenderThunks(pItem)
            return effect(removeNode(pItem))
        }
      }, getKey)

      return next
    }
  }

  function unrenderThunks (vnode) {
    while (isThunk(vnode)) {
      effect(destroyThunk(vnode))
      vnode = effect(updateThunk(vnode))
    }

    forEach(vnode.children, unrenderThunks)
  }
}

/**
 * Exports
 */

export default update
