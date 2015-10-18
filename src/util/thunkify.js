/**
 * Thunkify
 */

function thunkify (component, props, children) {
  if (typeof component === 'function') {
    component = {render: component}
  }

  props = props || {}
  props.children = children

  return {
    type: 'Thunk',
    props,
    component
  }
}

/**
 * Exports
 */

export default thunkify
