/**
 * Imports
 */

import * as actions from './actions'
import update from './update'
import create from './create'
import element from './element'

/**
 * Virtex
 */

function virtex (effect) {
  return {
    create: create(effect),
    update: update(effect)
  }
}

/**
 * Exports
 */

export default virtex
export {
  element,
  actions
}
