/**
 * Thunkify
 */

function thunkify (component, props, children, key) {
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
