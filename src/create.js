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

    const node = isText(vnode)
      ? createTextNode(vnode.value)
      : createElement(vnode.tag, vnode.attrs, map(vnode.children, createRecursive))

    vnode.element = node
    return node
  }
}

/**
 * Exports
 */

export default create
