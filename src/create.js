/**
 * Imports
 */

import {composeAll} from './compose'
import actions from './actions'
import isThunk from './isThunk'
import isText from './isText'

/**
 * Create the initial document fragment
 */

function create (effect) {
  const {appendChild, setAttribute, createElement, reifyThunk, createTextNode}
    = composeAll(effect, actions)

  return function createRecursive (vnode) {
    if (isThunk(vnode)) vnode = reifyThunk(vnode)
    if (isText(vnode)) return createTextNode(vnode)

    return createElement(
      vnode.tag,
      vnode.attrs,
      vnode.children && vnode.children.map(createRecursive)
    )
  }
}

/**
 * Exports
 */

export default create
