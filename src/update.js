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
  return (prev, next, path = 'a') => updateRecursive(prev, next, path)

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

      if (!next) {
        throw new Error('Component returned null/undefined. Components must return valid virtual nodes.')
      }

      return next === prev
        ? next
        : updateRecursive(prev, next, createPath(next, path, 0))
    } else if (prev !== next) {
      /**
       * Diff children
       */

      const children = new Array(next.children.length)
      diff(prev.children, next.children, (type, pItem, nItem, pos) => {
        switch (type) {
          case UPDATE:
            children[pos] = updateRecursive(pItem, nItem, createPath(nItem, path, pos))
            return
          case CREATE:
            children[pos] = create(nItem, createPath(nItem, path, pos))
            return effect(insertNode(prev, children[pos], pos))
          case MOVE:
            children[pos] = updateRecursive(pItem, nItem, createPath(nItem, path, pos))
            return effect(insertNode(prev, children[pos], pos))
          case REMOVE:
            return effect(removeNode(unrenderThunks(pItem)))
        }
      }, getKey)

      effect(updateNode(next, prev, children))
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
