
# virtex

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Small, focused virtual dom library that allows you to re-interpret all side effects via an action dispatcher. Those side effects include rendering 'thunks' (the primitive from which components are built), and DOM rendering. This allows you to do interesting things, like thread state from a single atom into your components in a pure way.

## Installation

    $ npm install virtex

## Usage

virtex consists of two functions `create` and `update`, curried with an effect processor.  You initialize them like this:

`const {create, update} = virtex(effect)`

  * `create(tree)` - takes a virtual node tree and returns a DOM element (if you are using [virtex-dom](https://github.com/ashaffer/virtex-dom))
  * `update(oldTree, newTree)` - takes the previous vnode tree and the new vnode tree and renders them into the DOM over the old nodes
  * `effect(action)` - handle all effectful actions (DOM manipulation and thunk rendering, for the time being)

## Example

```javascript
import {createStore, applyMiddleware} from 'redux'
import dom from 'virtex-dom'
import virtex from 'virtex'
import app from './app'

const store = applyMiddleware(dom(document))(createStore)(() => {}, {})
const {create, update} = virtex(store.dispatch)

let tree = app(store.getState())
const node = create(tree)

document.body.appendChild(node)

store.subscribe(() => {
  const state = store.getState()
  const newTree = app(state)

  update(tree, newTree, node)
  tree = newTree
})
```

## JSX Pragma

Virtex itself exports a very minimal jsx/hyperscript function for building elements. It doesn't provide any syntactic sugar or register event handlers or anything like that - if you want those things, you should use [virtex-element](https://github.com/ashaffer/virtex-element). If you want to build your own JSX pragma, you should build it on top of virtex's element, however:

```javascript
import {element} from 'virtex'

function myElement (type, attrs, ...children) {
  if (attrs.focused) {
    attrs.focused = node => node.focus()
  }
}
```

Would allow you to pass a `focused` bool that would focus the element in question when it is rendered.

## Processing effects

Your effect processor receives an action object, with at least one field: `type`.  The other object properties are type specific. The available actions (and actions creators) are exported on the main virtex object, you can grab them like this:

```javascript
import {actions} from 'virtex'

const {CREATE_ELEMENT} = actions.types
```

The available actions are:

```
CREATE_ELEMENT
SET_ATTRIBUTE
REMOVE_ATTRIBUTE
APPEND_CHILD
REPLACE_NODE
REMOVE_NODE
INSERT_BEFORE
CREATE_THUNK
UPDATE_THUNK
DESTROY_THUNK
```

Refer to [actions.js](https://github.com/ashaffer/virtex/tree/master/src/actions.js) and the existing middleware for more details on their structure and interpretation.

## Performance

Virtex is not the fastest, but it's pretty fast. 6-7x faster than React, and about on par (ok, just a little slower) with [snabbdom](https://github.com/paldepind/snabbdom)/[deku](https://github.com/dekujs/deku).  Here's the [vdom-benchmark](https://github.com/ashaffer/vdom-benchmark-virtex).

## Ecosystem

  * [vdux](https://github.com/ashaffer/vdux) - High-level micro-framework that creates your update cycle for you.
  * [virtex-dom](https://github.com/ashaffer/virtex-dom) - DOM rendering effect processor
  * [virtex-component](https://github.com/ashaffer/virtex-component) - Enables react/deku-like components
  * [virtex-local](https://github.com/ashaffer/virtex-local) - Adds local state and refs
  * [virtex-string](https://github.com/ashaffer/virtex-string) - String rendering backend

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
