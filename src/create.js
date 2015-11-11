/**
 * Imports
 */

import isThunk from './util/isThunk'
import isText from './util/isText'
import * as actions from './actions'

/**
 * Create the initial document fragment
 */

function create (effect) {
  // Destructure here so that babel doesn't keep referencing these functions on 'actions'
  // which is slightly slower
  const {createElement, createTextNode, renderThunk} = actions

  return vnode => createRecursive(vnode, '', 0)

  function createRecursive (vnode, path, idx) {
    while (isThunk(vnode)) {
      vnode.path = path = path + '.' + idx
      vnode = effect(renderThunk(vnode))
    }

    if (isText(vnode)) {
      return (vnode.el = effect(createTextNode(vnode.text)))
    } else {
      const vchildren = vnode.children

      for (let i = 0, len = vchildren.length; i < len; ++i) {
        const child = vchildren[i]
        child.el = createRecursive(child, path, i)
      }

      return (vnode.el = effect(createElement(vnode)))
    }
  }
}

/**
 * Exports
 */

export default create
