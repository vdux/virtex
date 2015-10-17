/**
 * Imports
 */

import {element as _element, createElement, diffPatch} from '../../src'

/**
 * Initialize
 */

const state = {counters: [0, 1]}
let tree
let node

document.addEventListener('DOMContentLoaded', () => {
  tree = render(state)
  node = createElement(tree)
  document.body.appendChild(node)
})

function rerender () {
  const newTree = render(state)
  diffPatch(tree, newTree, node)
  tree = newTree
}

function render ({counters}) {
  return (
    <div>
      Hello World
      {
        counters.map((value, idx) => <Counter value={value} idx={idx} />)
      }
    </div>
  )
}

const Counter = component(({value = 0, idx}) => {
  return (
    <div style={'color:' + (value % 2 ? 'red' : 'blue')}>
      <div>Counter: {value}</div>
      <button onClick={e => increment(idx)}>Increment Counter</button>
    </div>
  )
})

function increment (idx) {
  state.counters[idx]++
  setTimeout(rerender)
}


/**
 * Component
 */

function component (render) {
  return (props, children) => {
    props = props || {}
    props.children = children
    return {
      type: 'Thunk',
      props,
      render (prev) {
        if (prev && shallowEqual(prev.props.children, props.children)) {
          props.children = prev.props.children
        }

        if (prev && shallowEqual(prev.props, props)) {
          return prev.vnode
        }

        return render(props)
      }
    }
  }
  return
}

function shallowEqual (a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) {
    return true
  }

  for (var key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  for (var key in b) {
    if (b[key] !== a[key]) {
      return false
    }
  }

  return true
}

/**
 * Custom element with event support
 */

function element (tag, attrs = {}, ...children) {
  for (let key in attrs) {
    attrs[key] = eventAttr(key, attrs[key])
  }

  return _element(tag, attrs, ...children)
}

const eventTypes = ['onClick']

function eventAttr (name, value) {
  if (eventTypes.indexOf(name) !== -1) {
    return bindEvent(value)
  }

  return eventTypes[name]
    ? bindEvent(value)
    : value
}

function bindEvent (fn) {
  return function (node, name) {
    const evt = name.slice(2).toLowerCase()
    const store = node['__stored_events'] = node['__stored_events'] || {}

    if (store[evt]) {
      node.removeEventListener(evt, store[evt])
    }

    node.addEventListener(evt, fn)
    store[evt] = fn
  }
}
