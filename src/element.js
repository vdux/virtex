/**
 * Vnode creator
 */

function element (tag, attrs = {}, ...children) {
  if (typeof tag === 'function') {
    return tag(attrs, children)
  }

  return {
    tag,
    attrs,
    children: children.reduce((acc, child) => {
      if (typeof child !== 'undefined') {
        Array.isArray(child)
          ? acc.push.apply(acc, child)
          : acc.push(child)
      }

      return acc
    }, [])
  }
}

/**
 * Exports
 */

export default element
