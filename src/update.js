/**
 * Imports
 */

import {insertNode, updateNode, replaceNode, removeNode, updateThunk, destroyThunk} from './actions'
import {isThunk, isSameNode, getKey, createPath} from './util'
import diff, {CREATE, UPDATE, MOVE, REMOVE} from 'dift'
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

      while (isThunk(prev)) {
        prev = effect(updateThunk(prev))
      }

      next = create(next, path)
      effect(replaceNode(next, prev))
    } else if (isThunk(next)) {
      next = effect(updateThunk(next, prev))
      prev = effect(updateThunk(prev))

      return updateRecursive(prev, next, createPath(next, path, 0))
    } else {
      if (prev !== next) {
        /**
         * Diff children
         */

        diff(prev.children, next.children, (type, pItem, nItem, pos) => {
          switch (type) {
            case UPDATE:
              return updateRecursive(pItem, nItem, createPath(nItem, path, pos))
            case CREATE:
              return effect(insertNode(prev, create(nItem, createPath(nItem, path, pos)), pos))
            case MOVE:
              return effect(insertNode(prev, updateRecursive(pItem, nItem, createPath(nItem, path, pos)), pos))
            case REMOVE:
              return effect(removeNode(unrenderThunks(pItem)))
          }
        }, getKey)
      }

      effect(updateNode(next, prev))
    }

    return next
  }

  function unrenderThunks (vnode) {
    while (isThunk(vnode)) {
      effect(destroyThunk(vnode))
      vnode = effect(updateThunk(vnode))
    }

    forEach(unrenderThunks, vnode.children)
    return vnode
  }
}

/**
 * Exports
 */

export default update
