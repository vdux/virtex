/**
 * Imports
 */

import {applyMiddleware, createStore} from 'redux'
import reducer from './reducer'
import dom from 'virtex-dom'

/**
 * Store
 */

const createStoreWithMiddleware = applyMiddleware(
  dom(document),
  reify
)(createStore)

function reify (api) {
  return next => action => {
    if (action.type === 'REIFY_THUNK') {
      const {thunk, prev} = action.payload
      thunk.vnode = thunk.render(prev)
      return thunk.vnode
    }

    return next(action)
  }
}

/**
 * Exports
 */

export default initialState => createStoreWithMiddleware(reducer, initialState)
