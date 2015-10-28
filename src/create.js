/**
 * Imports
 */

import isThunk from './util/isThunk'
import isText from './util/isText'
import {createElement, createTextNode, renderThunk} from './actions'
import map from './util/map'

/**
 * Create the initial document fragment
 */

function create (effect) {
  return function createRecursive (vnode) {
    if (isThunk(vnode)) {
      vnode = effect(renderThunk(vnode))
    }

    return (vnode.el = isText(vnode)
      ? effect(createTextNode(vnode.text))
      : effect(createElement(vnode.tag, vnode.attrs, map(vnode.children, createRecursive))))
  }
}

/**
 * Exports
 */

export default create
