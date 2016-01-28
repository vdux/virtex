/**
 * Imports
 */

import virtex from '../src'
import element from 'virtex-element'
import test from 'tape'
import {createStore, applyMiddleware} from 'redux'
import string from 'virtex-string'
import component from 'virtex-component'

/**
 * Setup
 */

const store = applyMiddleware(string, component())(createStore)(() => {}, {})
const {create} = virtex(store.dispatch)
const render = vnode => create(vnode).element

/**
 * Tests
 */

test('rendering virtual element to a string', t => {
  t.equal(render(<Component />), '<div id="foo"><span>foo</span><span>foo</span></div>', 'element rendered')
  t.end()

  function Other ({props}) {
    return <span>{props.text}</span>
  }

  function Component () {
    return (
      <div id="foo">
        <span>foo</span>
        <Other text="foo" />
      </div>
    )
  }
})

test('rendering components with children', t => {
  t.notEqual(render(<Component />), '<div>undefined</div>')
  t.equal(render(<Component>test</Component>), '<div>test</div>')
  t.end()

  function Component ({children}) {
    return <div>{children}</div>
  }
})

// test('renderString: components', t => {
//   const Component = {
//     defaultProps: {
//       hello: 'Hello'
//     },
//     initialState: function ({initialCount}) {
//       return { count: initialCount }
//     },
//     render: function ({ props, state }) {
//       return <div count={state.count}>{props.hello} {props.name}</div>
//     }
//   }

//   t.equal(render(<Component name="Amanda" initialCount={0} />), '<div count="0">Hello Amanda</div>', 'rendered correctly')
//   t.end()
// })

test('renderString: lifecycle hooks', t => {
  const called = []
  const Component = {
    onCreate: function(props) {
      called.push('onCreate')
      t.ok(props, 'onCreate has props')
    },
    render: function(){
      return <div />
    }
  }

  render(<Component />)
  t.ok(~called.indexOf('onCreate'), 'onCreate called')
  t.end()
})

// test('renderString: innerHTML', t => {
//   t.equal(<div innerHTML='<span>foo</span>' />, '<div><span>foo</span></div>', 'innerHTML rendered')
//   t.end()
// })

test('renderString: input.value', t => {
  t.equal(render(<input value='foo' />), '<input value="foo"></input>', 'value rendered')
  t.end()
})

test('renderString: function attributes', t => {
  function foo() { return 'blah' }
  t.equal(render(<div onClick={foo} />), '<div></div>', 'attribute not rendered')
  t.end()
})

test('renderString: empty attributes', t => {
  t.equal(
    render(<input type='checkbox' value='' />),
    '<input type="checkbox" value=""></input>',
    'empty string attribute not rendered'
  )

  t.equal(
    render(<input type='checkbox' value={0} />),
    '<input type="checkbox" value="0"></input>',
    'zero attribute not rendered'
  )

  t.equal(
    render(<input type="checkbox" disabled={false} />),
    '<input type="checkbox"></input>',
    'false attribute unexpectedly rendered'
  )

  t.equal(
    render(<input type="checkbox" disabled={null} />),
    '<input type="checkbox"></input>',
    'null attribute unexpectedly rendered'
  )

  const disabled = undefined

  t.equal(
    render(<input type="checkbox" disabled={disabled} />),
    '<input type="checkbox"></input>',
    'undefined attribute unexpectedly rendered'
  )

  t.end()
})
