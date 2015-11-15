/**
 * Thunkify
 */

function thunkify (component, props, children, key) {
  props = props || {}

  return {
    type: 'thunk',
    children,
    component,
    key,
    model: {
      props,
      children,
      key
    }
  }
}

/**
 * Exports
 */

export default thunkify
