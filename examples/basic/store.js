/**
 * Imports
 */

import {applyMiddleware, createStore} from 'redux'
import reducer from './reducer'
import dom from 'virtex-dom'
import component from 'virtex-component'

/**
 * Store
 */

const createStoreWithMiddleware = applyMiddleware(
  dom(document),
  component
)(createStore)

/**
 * Exports
 */

export default initialState => createStoreWithMiddleware(reducer, initialState)
