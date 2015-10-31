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
  return function createRecursive (vnode, path = '') {
    if (isThunk(vnode)) {
      vnode.key = vnode.key || path
      vnode = effect(renderThunk(vnode))
    }

    return (vnode.el = isText(vnode)
      ? effect(createTextNode(vnode.text))
      : effect(createElement(vnode.tag, vnode.attrs, map(vnode.children, (child, i) => createRecursive(child, path + '.' + i)))))
  }
}

/**
 * Exports
 */

export default create
