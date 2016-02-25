/**
 * Imports
 */

import * as actions from './actions'
import {findDOMNode} from './util'
import element from './element'
import update from './update'
import create from './create'

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
  actions,
  findDOMNode
}
