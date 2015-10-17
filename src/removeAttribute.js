/**
 * Remove an attribute from an element
 */

function removeAttribute (node, name, priorValue) {
  if (typeof priorValue === 'function') {
    priorValue(node, name, true)
  }

  node.removeAttribute(name)
}

/**
 * Exports
 */

export default removeAttribute
