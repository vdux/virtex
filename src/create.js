/**
 * Imports
 */

import isString from 'is-string'
import {createElement, createThunk} from './actions'

/**
 * Create the initial document fragment
 */

function create (effect) {
  return (vnode, path = '0', idx = 0) => createRecursive(vnode, path, idx)

  function createRecursive (vnode, path, idx) {
    while (!isString(vnode.type)) {
      vnode.path = path = path + '.' + (vnode.key || idx)
      vnode = effect(createThunk(vnode))
    }

    const vchildren = vnode.children

    for (let i = 0, len = vchildren.length; i < len; ++i) {
      const child = vchildren[i]
      child.el = createRecursive(child, path, i)
    }

    return (vnode.el = effect(createElement(vnode)))
  }
}

/**
 * Exports
 */

export default create
