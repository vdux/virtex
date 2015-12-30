/**
 * Imports
 */

import {isThunk} from './util'
import {createNode, createThunk} from './actions'

/**
 * Create the initial document fragment
 */

function create (effect) {
  return (vnode, path = '0') => createRecursive(vnode, path, idx)

  function createRecursive (vnode, path) {
    vnode.path = path

    if (isThunk(vnode)) {
      return createRecursive(effect(createThunk(vnode)), vnode.path + '.0')
    }

    const children = vnode.children

    for (let i = 0, len = children.length; i < len; ++i) {
      createRecursive(children[i], path + '.' + i)
    }

    return effect(createNode(vnode))
  }
}

/**
 * Exports
 */

export default create
