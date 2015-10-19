/**
 * Imports
 */

import thunkify from './util/thunkify'

/**
 * Vnode creator
 */

function element (tag, attrs /*, ...children */) {
  const children = filterFlatten(arguments, 2)

  if (typeof tag !== 'string') {
    return thunkify(tag, attrs, children)
  }

  return {
    tag,
    attrs,
    children: children
  }
}

/**
 * Filter out undefined and flatten nested
 * arrays.
 */

function filterFlatten (children, i) {
  const len = children.length
  const arr = []

  for (; i < len; i++) {
    const item = children[i]
    if (item !== undefined && item !== null) {
      if (Array.isArray(item)) {
        arr.push.apply(arr, filterFlatten(item, 0))
      } else if (typeof item === 'string' || typeof item === 'number') {
        arr.push({type: 'text', value: item})
      } else {
        arr.push(item)
      }
    }
  }

  return arr
}

/**
 * Exports
 */

export default element
