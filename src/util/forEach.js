/**
 * Fast forEach
 */

function forEach (obj, fn) {
  if (!obj) return

  const keys = Object.keys(obj)

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    fn(obj[key], key)
  }
}

/**
 * Exports
 */

export default forEach
