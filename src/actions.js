/**
 * Action types
 */

const types = {
  CREATE_NODE: 'CREATE_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  REPLACE_NODE: 'REPLACE_NODE',
  REMOVE_NODE: 'REMOVE_NODE',
  INSERT_NODE: 'INSERT_NODE',
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

const createThunk = vnodeAction(types.CREATE_THUNK)
const updateThunk = vnodeAction(types.UPDATE_THUNK)
const destroyThunk = vnodeAction(types.DESTROY_THUNK)
const updateNode = vnodeAction(types.UPDATE_NODE)
const replaceNode = vnodeAction(types.REPLACE_NODE)
const removeNode = vnodeAction(types.REMOVE_NODE)

function createNode (vnode, children) {
  return {
    type: types.CREATE_NODE,
    vnode,
    children
  }
}

function insertNode (vnode, newVnode, pos) {
  return {
    type: types.INSERT_NODE,
    vnode,
    newVnode,
    pos
  }
}

/**
 * Exports
 */

export {
  createNode,
  insertNode,
  updateNode,
  replaceNode,
  removeNode,
  createThunk,
  updateThunk,
  destroyThunk,

  types
}
