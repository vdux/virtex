/**
 * Component
 */

function component (render) {
  return (props, children) => {
    props = props || {}
    props.children = children
    return {
      type: 'Thunk',
      props,
      render (prev) {
        if (prev && shallowEqual(prev.props.children, props.children)) {
          props.children = prev.props.children
        }

        if (prev && shallowEqual(prev.props, props)) {
          return prev.vnode
        }

        return render(props)
      }
    }
  }
}

function shallowEqual (a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) {
    return true
  }

  for (var key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  for (var key in b) {
    if (b[key] !== a[key]) {
      return false
    }
  }

  return true
}

/**
 * Exports
 */

export default component
