/**
 * Imports
 */

import map from '@f/map-array'
import {isThunk, createPath} from './util'
import {createNode, createThunk} from './actions'

/**
 * Create the initial document fragment
 */

function create (effect) {
  return (vnode, path = '0', element) => createRecursive(vnode, path, element)

  function createRecursive (vnode, path, element) {
    vnode.path = path

    if (isThunk(vnode)) {
      const next = effect(createThunk(vnode))

      if (!next) {
        throw new Error('Component returned null/undefined. Components must return valid virtual nodes.')
      }
      
      return createRecursive(next, createPath(next, path, 0), element)
    }

    return effect(createNode(
      vnode,
      map(createChild(path, element), vnode.children),
      element
    ))
  }

  function createChild (path, element) {
    return element
      ? (child, i) => createRecursive(child, createPath(child, path, i), element.childNodes[i])
      : (child, i) => createRecursive(child, createPath(child, path, i))
  }
}

/**
 * Exports
 */

export default create
