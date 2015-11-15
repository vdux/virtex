/**
 * Imports
 */

import thunkify from './util/thunkify'
import textify from './util/textify'

/**
 * Vnode creator
 */

function element (tag, attrs) {
  const len = arguments.length
  const children = []

  for (let i = 2, j = 0; i < len; ++i) {
    j += filterFlatten(arguments[i], children, j)
  }

  let key
  if (attrs !== null && typeof attrs.key !== 'undefined') {
    key = attrs.key
    if (!hasMoreKeysThan(attrs, 1)) {
      attrs = null
    } else {
      attrs.key = null
    }
  }

  if (typeof tag !== 'string') {
    return thunkify(tag, attrs, children, key)
  }

  return {
    key,
    tag,
    attrs,
    children,
    el: null
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

function filterFlatten (item, arr, arrStart) {
  let added = 0

  switch (type(item)) {
    case 'array':
      const len = item.length
      for (let i = 0; i < len; ++i) {
        added += filterFlatten(item[i], arr, arrStart + added)
      }
      return added
    case 'null':
    case 'undefined':
      return 0
    case 'string':
    case 'number':
      arr[arrStart] = textify(item)
      break
    default:
      arr[arrStart] = item
      break
  }

  return 1
}

function type (val) {
  if (Array.isArray(val)) return 'array'
  if (val === null) return 'null'
  return typeof val
}

/**
 * Exports
 */

export default element
