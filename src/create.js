/**
 * Imports
 */

import {isThunk, createPath} from './util'
import map from '@f/map-array'
import {createNode, createThunk} from './actions'

/**
 * Create the initial document fragment
 */

function create (effect) {
  return (vnode, path = '0') => createRecursive(vnode, path)

  function createRecursive (vnode, path) {
    vnode.path = path

    if (isThunk(vnode)) {
      return createRecursive(effect(createThunk(vnode)), createPath(vnode, path, 0))
    }

    const children = map((child, i) => createRecursive(child, createPath(child, path, i)), vnode.children)
    return effect(createNode(vnode, children))
  }
}

/**
 * Exports
 */

export default create
