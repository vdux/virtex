/**
 * Set an attribute on an element
 */

function setAttribute (node, name, value) {
  if (typeof value === 'function') {
    value = value(node, name, false)
  }

  if (value === undefined) {
    return
  }

  switch (name) {
    case 'checked':
    case 'disabled':
    case 'selected':
    case 'value':
      node[name] = value
      break
    default:
      node.setAttribute(name, value)
  }
}

/**
 * Exports
 */

export default setAttribute
