/**
 * Action types
 */

const types = {
  CREATE_ELEMENT: 'CREATE_ELEMENT',
  SET_ATTRIBUTE: 'SET_ATTRIBUTE',
  REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
  APPEND_CHILD: 'APPEND_CHILD',
  REPLACE_NODE: 'REPLACE_NODE',
  REMOVE_NODE: 'REMOVE_NODE',
  INSERT_BEFORE: 'INSERT_BEFORE',
  CREATE_THUNK: 'CREATE_THUNK',
  UPDATE_THUNK: 'UPDATE_THUNK',
  DESTROY_THUNK: 'DESTROY_THUNK'
}

/**
 * Action creators for effectful things
 */

function vnodeAction (type) {
  return (vnode, prev) => ({
    type,
    vnode,
    prev
  })
}

const createElement = vnodeAction(types.CREATE_ELEMENT)
const createThunk = vnodeAction(types.CREATE_THUNK)
const updateThunk = vnodeAction(types.UPDATE_THUNK)
const destroyThunk = vnodeAction(types.DESTROY_THUNK)

function attrAction (type) {
  return (node, name, value) => ({
    type,
    node,
    name,
    value
  })
}

const setAttribute = attrAction(types.SET_ATTRIBUTE)
const removeAttribute = attrAction(types.REMOVE_ATTRIBUTE)

function nodeAction (type) {
  return (node, newNode, oldNode) => ({
    type,
    node,
    newNode,
    oldNode
  })
}

const appendChild = nodeAction(types.APPEND_CHILD)
const replaceNode = nodeAction(types.REPLACE_NODE)
const removeNode = nodeAction(types.REMOVE_NODE)

function insertBefore (node, newNode, pos) {
  return {
    type: types.INSERT_BEFORE,
    node,
    newNode,
    pos
  }
}

/**
 * Exports
 */

export {
  createElement,
  setAttribute,
  removeAttribute,
  appendChild,
  replaceNode ,
  removeNode,
  insertBefore,
  createThunk ,
  updateThunk ,
  destroyThunk,

  types
}
