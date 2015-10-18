/**
 * Imports
 */

import element from 'virtex-element'
import delegant from 'delegant'
import virtex from '../../src'
import createStore from './store'
import app from './app'

/**
 * Vars
 */

const store = createStore({counters: [0, 1]})
const {create, update} = virtex(store.dispatch)

/**
 * Initialize
 */

let tree
let node
let pending = false

document.addEventListener('DOMContentLoaded', () => {
  store.subscribe(() => {
    if (pending) return
    pending = true
    setTimeout(rerender)
  })

  tree = app(store.getState())
  node = create(tree)
  document.body.appendChild(node)
  delegant(document.body, store.dispatch)
})

function rerender () {
  pending = false
  const newTree = app(store.getState())
  update(tree, newTree, node)
  tree = newTree
}
