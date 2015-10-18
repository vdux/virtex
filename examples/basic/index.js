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
const {create, render} = virtex(store.dispatch)

/**
 * Initialize
 */

let tree
let node

document.addEventListener('DOMContentLoaded', () => {
  tree = app(store.getState())
  node = create(tree)
  document.body.appendChild(node)
  delegant(document.body, store.dispatch)
  store.subscribe(rerender)
})

function rerender () {
  const newTree = app(store.getState())
  render(tree, newTree, node)
  tree = newTree
}
