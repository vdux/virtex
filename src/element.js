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

  if (attrs !== null && typeof attrs.key !== 'undefined') {
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
    element: null
  }
}

function hasMoreKeysThan (obj, n) {
  let i = 0

  for (let k in obj) {
    ++i
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

  for (let i = 0, j = arrStart; i < len; ++i, ++j) {
    const item = items[i]

    switch (type(item)) {
      case 'array':
        const delta = item.length - 1
        if (delta !== -1) {
          filterFlatten(item, arr, j)
          j += delta
        } else {
          j--
          remove++
        }
        break
      case 'undefined':
      case 'null':
        j--
        remove++
        break
      case 'string':
      case 'number':
        arr[j] = {text: true, value: item}
        break
      default:
        arr[j] = item
        break
    }
  }

  if (remove > 0) {
    arr.splice(len - (remove + arrStart), remove)
  }

  return arr
}

function type (val) {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

/**
 * Exports
 */

export default element
