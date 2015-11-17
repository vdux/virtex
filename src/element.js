/**
 * Imports
 */

import isUndefined from 'is-undefined'

/**
 * Vnode creator
 */

function element (type, attrs) {
  const len = arguments.length
  const children = []

  for (let i = 2, j = 0; i < len; ++i) {
    j += filterFlatten(arguments[i], children, j)
  }

  let key
  if (attrs && !isUndefined(attrs.key)) {
    key = attrs.key
    if (Object.keys(attrs).length === 1) {
      attrs = undefined
    } else {
      attrs.key = undefined
    }
  }

  return {
    key,
    type,
    attrs,
    children
  }
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
      arr[arrStart] = element('#text', {nodeValue: item})
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
