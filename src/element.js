/**
 * Imports
 */

import thunkify from './util/thunkify'

/**
 * Vnode creator
 */

function element (tag, attrs, ...children) {
  children = filterFlatten(children, children, 0, 0)
  let key

  if (attrs !== null && attrs.hasOwnProperty('key')) {
    key = attrs.key
    attrs.key = null
    if (!hasMoreKeysThan(attrs, 1)) {
      attrs = null
    }
  }

  if (typeof tag !== 'string') {
    return thunkify(tag, attrs, children)
  }

  return {
    key,
    tag,
    attrs,
    children,
    // Add this property now so that we avoid mutating the keylist later,
    // which can cause de-optimization
    element: undefined
  }
}

function hasMoreKeysThan (obj, n) {
  let i = 0

  for (let k in obj) {
    i++
    if (i > n) return true
  }

  return false
}

/**
 * Very fast in-place, single-pass filter/flatten
 * algorithm
 */

function filterFlatten (items, arr, arrStart) {
  const len = items.length
  let remove = 0

  for (let i = 0, j = arrStart; i < len; i++, j++) {
    const item = items[i]

    if (Array.isArray(item)) {
      const delta = item.length - 1
      if (delta !== -1) {
        arr.length += delta
        filterFlatten(item, arr, j)
        j += delta
      } else {
        // Account for the possibility that 'item'
        // is an empty array
        j--
        remove++
      }
    } else if (item === undefined || item === null) {
      j--
      remove++
    } else if (typeof item === 'string' || typeof item === 'number') {
      arr[j] = {type: 'text', value: item}
    } else {
      arr[j] = item
    }
  }

  if (remove > 0) {
    arr.splice(len - (remove + arrStart), remove)
  }

  return arr
}

/**
 * Exports
 */

export default element
