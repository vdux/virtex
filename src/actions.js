/**
 * Action types
 */

const CREATE_TEXT_NODE = 'CREATE_TEXT_NODE'
const CREATE_ELEMENT = 'CREATE_ELEMENT'
const SET_ATTRIBUTE = 'SET_ATTRIBUTE'
const REMOVE_ATTRIBUTE = 'REMOVE_ATTRIBUTE'
const APPEND_CHILD = 'APPEND_CHILD'
const REMOVE_CHILD = 'REMOVE_CHILD'
const REPLACE_CHILD = 'REPLACE_CHILD'
const INSERT_BEFORE = 'INSERT_BEFORE'
const RENDER_THUNK = 'RENDER_THUNK'

/**
 * Action creators for effectful things
 */

function createTextNode (text) {
  return {
    type: 'CREATE_TEXT_NODE',
    text
  }
}

function createElement (tag, attrs, children) {
  return {
    type: 'CREATE_ELEMENT',
    tag,
    attrs,
    children
  }
}

function setAttribute (node, name, value) {
  return {
    type: 'SET_ATTRIBUTE',
    node,
    name,
    value
  }
}

function removeAttribute (node, name) {
  return {
    type: 'REMOVE_ATTRIBUTE',
    node,
    name
  }
}

function appendChild (node, childNode) {
  return {
    type: 'APPEND_CHILD',
    node,
    childNode
  }
}

function replaceChild (node, newChild, oldChild) {
  return {
    type: 'REPLACE_CHILD',
    node,
    newChild,
    oldChild
  }
}

function removeChild (node, childNode) {
  return {
    type: 'REMOVE_CHILD',
    node,
    childNode
  }
}

function insertBefore (node, newChild, oldChild) {
  return {
    type: 'INSERT_BEFORE',
    node,
    newChild,
    oldChild
  }
}

function renderThunk (thunk, prev) {
  return {
    type: 'RENDER_THUNK',
    thunk,
    prev
  }
}

/**
 * Exports
 */

export default {
  createTextNode,
  createElement,
  setAttribute,
  removeAttribute,
  appendChild,
  removeChild,
  replaceChild,
  insertBefore,
  renderThunk,

  types: {
    CREATE_TEXT_NODE,
    CREATE_ELEMENT,
    SET_ATTRIBUTE,
    REMOVE_ATTRIBUTE,
    APPEND_CHILD,
    REPLACE_CHILD,
    REMOVE_CHILD,
    INSERT_BEFORE,
    RENDER_THUNK
  }
}
