/**
 * Imports
 */

import thunkify from './util/thunkify'

/**
 * Vnode creator
 */

function element (tag, attrs, ...children) {
  if (typeof tag !== 'string') {
    return thunkify(tag, attrs, children)
  }

  return {
    tag,
    attrs,
    children: filterFlatten(children)
  }
}

/**
 * Filter out undefined and flatten nested
 * arrays.  In-place, for speed.
 */

function filterFlatten (children) {
  for (let i = 0, len = children.length; i < len; i++) {
    let item = children[i]

    if (item === undefined) {
      children.splice(i, 1)
    } else if (Array.isArray(item)) {
      children.splice.apply(children, [i, 1].concat(filterFlatten(item)))
    }
  }

  return children
}

/**
 * Exports
 */

export default element
