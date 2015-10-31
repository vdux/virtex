/**
 * Fast map
 */

function map (arr, fn) {
  const len = arr.length
  const result = new Array(len)

  for (let i = 0; i < len; ++i) {
    result[i] = fn(arr[i], i)
  }

  return result
}

/**
 * Exports
 */

export default map
