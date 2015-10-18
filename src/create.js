/**
 * Imports
 */

import {composeAll} from './util/compose'
import isThunk from './util/isThunk'
import isText from './util/isText'
import actions from './actions'
import map from './util/map'

/**
 * Create the initial document fragment
 */

function create (effect) {
  const {appendChild, setAttribute, createElement, renderThunk, createTextNode}
    = composeAll(effect, actions)

  return function createRecursive (vnode) {
    if (isThunk(vnode)) vnode = renderThunk(vnode)
    if (isText(vnode)) return createTextNode(vnode)

    return createElement(
      vnode.tag,
      vnode.attrs,
      map(vnode.children, createRecursive)
    )
  }
}

/**
 * Exports
 */

export default create
