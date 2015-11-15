
# virtex

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Small, focused virtual dom library.  Right now this is an experiment to try to create a simple virtual dom library that can be extended in interesting ways by allowing the calling code to reinterpret all side-effects (thunk rendering & DOM manipulation at the moment) via an action dispatcher.

## Installation

    $ npm install virtex

## Usage

virtex consists of two functions `create` and `update`, curried with an effect processor.  You initialize them like this:

`const {create, update} = virtex(effect)`

  * `create(tree)` - takes a virtual node tree and returns a DOM element
  * `update(oldTree, newTree)` - takes the previous vnode tree and the new vnode tree and rendders them into the DOM over the old nodes
  * `effect(action)` - handle all effectful actions (DOM manipulation and thunk rendering, for the time being)

## Example

```javascript
import dom from 'virtex-dom'
import virtex from 'virtex'
import {createStore, applyMiddleware} from 'redux'
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

## Processing effects

Your effect processor receives an action object, with at least one field: `type`.  The other object properties are type specific.  More documentation to be added here soon.

## Performance

Virtex is not the fastest, but it's pretty fast.  6-7x faster than React, and about on par (ok, just a little slower) with [snabbdom](https://github.com/paldepind/snabbdom)/[deku](https://github.com/dekujs/deku).  Here's the [vdom-benchmark](https://github.com/ashaffer/vdom-benchmark-virtex).

## Ecosystem

  * [virtex-dom](https://github.com/ashaffer/virtex-dom) - DOM rendering effect processor
  * [virtex-component](https://github.com/ashaffer/virtex-component) - Enables react/deku-like components
  * [virtex-local](https://github.com/ashaffer/virtex-local) - Adds local state and refs
  * [virtex-string](https://github.com/ashaffer/virtex-string) - String rendering

## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
