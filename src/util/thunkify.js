/**
 * Thunkify
 */

function thunkify (component, props, children, key) {
  if (typeof component === 'function') {
    component = {render: component}
  }

  props = props || {}
  props.children = children

  return {
    thunk: true,
    props,
    component,
    key
  }
}

/**
 * Exports
 */

export default thunkify
