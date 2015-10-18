/**
 * Imports
 */

import {compose} from './compose'
import actions from './actions'
import _render from './render'
import _create from './create'
import element from './element'

/**
 * Virtex
 */

function virtex (effect) {
  return {
    create: _create(effect),
    render: _render(effect)
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
