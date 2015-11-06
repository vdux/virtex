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
  return function createRecursive (vnode, path = '0') {
    if (isThunk(vnode)) {
      vnode.path = path
      return createRecursive(effect(renderThunk(vnode)), path + '.0')
    }

    vnode.el = isText(vnode)
      ? effect(createTextNode(vnode.text))
      : effect(createElement(vnode.tag, vnode.attrs, map(vnode.children, (child, i) => createRecursive(child, path + '.' + i))))

    return vnode.el
  }
}

/**
 * Exports
 */

export default create
