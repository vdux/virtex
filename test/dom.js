/**
 * Imports
 */

import trigger from 'trigger-event'
import raf from 'component-raf'
import virtex from '../src'
import element from 'virtex-element'
import test from 'tape'
import {createStore, applyMiddleware} from 'redux'
import dom from 'virtex-dom'
import component from 'virtex-component'
import delegant from 'delegant'

/**
 * Setup store
 */

const store = applyMiddleware(dom(document), component)(createStore)(() => {}, {})

/**
 * Initialize virtex
 */

const {create, update} = virtex(store.dispatch)

// Test Components

const RenderChildren  = props => props.children[0]
const ListItem        = props => <li>{props.children}</li>
const Wrapper         = props => <div>{props.children}</div>
const TwoWords        = props => <span>{props.one} {props.two}</span>

// Test helpers

function div () {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function setup (equal) {
  const el = div()

  delegant(el)
  let tree
  let node
  return {
    mount (vnode) {
      if (tree) node = update(tree, vnode)
      else {
        node = create(vnode)
        el.appendChild(node)
      }

      tree = vnode
    },
    unmount () {
      node.parentNode.removeChild(node)
      tree = null
    },
    renderer: {
      remove () {
        const newTree = {children: []}
        const parentNode = node.parentNode
        update(tree, newTree)
        parentNode.removeChild(parentNode.firstChild)
        tree = newTree
        // node.parentNode.removeChild(node)
        tree = null
      }
    },
    el,
    $: el.querySelector.bind(el),
    html: createAssertHTML(el, equal)
  }
}

function teardown ({renderer, el}) {
  renderer.remove()
  if (el.parentNode) el.parentNode.removeChild(el)
}

function createAssertHTML (container, equal) {
  const dummy = document.createElement('div')
  return (html, message) => {
    html = html.replace(/\n(\s+)?/g,'').replace(/\s+/g,' ')
    equal(html, container.innerHTML, message || 'innerHTML is equal')
  }
}

/**
 * Tests
 *
 * Note: Essentially 100% of these tests copied from Deku
 * https://github.com/dekujs/deku/blob/1.0.0/test/dom/index.js
 * So all credit to them for this great test suite
 */

test('rendering DOM', ({equal,end,notEqual,pass,fail}) => {
  var {renderer,el,mount,unmount,html} = setup(equal)
  var rootEl

  // Render
  mount(<span />)
  html('<span></span>', 'no attribute')

  // Add
  mount(<span name="Bob" />)
  html('<span name="Bob"></span>', 'attribute added')

  // Update
  mount(<span name="Tom" />)
  html('<span name="Tom"></span>', 'attribute updated')

  // Update
  mount(<span name={null} />)
  html('<span></span>', 'attribute removed with null')

  // Update
  mount(<span name={undefined} />)
  html('<span></span>', 'attribute removed with undefined')

  // Update
  mount(<span name="Bob" />)
  el.children[0].setAttribute = () => fail('DOM was touched')

  // Update
  mount(<span name="Bob" />)
  pass('DOM not updated without change')

  // Update
  mount(<span>Hello World</span>)
  html(`<span>Hello World</span>`, 'text rendered')

  rootEl = el.firstChild

  // Update
  mount(<span>Hello Pluto</span>)
  html('<span>Hello Pluto</span>', 'text updated')

  // Remove
  mount(<span></span>)
  html('<span></span>', 'text removed')

  // Update
  mount(<span>{undefined} World</span>)
  html('<span> World</span>', 'text was replaced by undefined')

  // Root element should still be the same
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Replace
  mount(<div>Foo!</div>)
  html('<div>Foo!</div>', 'element is replaced')
  notEqual(el.firstChild, rootEl, 'root element replaced')

  // Clear
  unmount()
  html('', 'element is removed when unmounted')

  // Render
  mount(<div>Foo!</div>)
  html('<div>Foo!</div>', 'element is rendered again')

  rootEl = el.firstChild

  // Update
  mount(<div><span/></div>)
  html('<div><span></span></div>', 'replaced text with an element')

  // Update
  mount(<div>bar</div>)
  html('<div>bar</div>', 'replaced child with text')

  // Update
  mount(<div><span>Hello World</span></div>)
  html('<div><span>Hello World</span></div>', 'replaced text with element')

  // Remove
  mount(<div></div>)
  html('<div></div>', 'removed element')
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Children added
  mount(
    <div>
      <span>one</span>
      <span>two</span>
      <span>three</span>
    </div>
  )
  html(`
    <div>
      <span>one</span>
      <span>two</span>
      <span>three</span>
    </div>`
  )
  equal(el.firstChild, rootEl, 'root element not replaced')
  var span = el.firstChild.firstChild

  // Siblings removed
  mount(
    <div>
      <span>one</span>
    </div>
  )
  html('<div><span>one</span></div>', 'added element')
  equal(el.firstChild.firstChild, span, 'child element not replaced')
  equal(el.firstChild, rootEl, 'root element not replaced')

  // Removing the renderer
  teardown({ renderer, el })
  html('', 'element is removed')
  end()
})

test('falsy attributes should not touch the DOM', ({equal,end,pass,fail}) => {
  var {renderer,el,mount} = setup(equal)
  mount(<span name="" />)
  var child = el.children[0]
  child.setAttribute = () => fail('should not set attributes')
  child.removeAttribute = () => fail('should not remove attributes')
  mount(<span name="" />)
  pass('DOM not touched')
  teardown({ renderer, el })
  end()
})

test('innerHTML attribute', ({equal,end}) => {
  var {html,mount,el,renderer} = setup(equal)
  mount(<div innerHTML="Hello <strong>deku</strong>" />)
  html('<div>Hello <strong>deku</strong></div>', 'innerHTML is rendered')
  mount(<div innerHTML="Hello <strong>Pluto</strong>" />)
  html('<div>Hello <strong>Pluto</strong></div>', 'innerHTML is updated')
  mount(<div />)
  // Causing issues in IE10. Renders with a &nbsp; for some reason
  // html('<div></div>', 'innerHTML is removed')
  teardown({renderer,el})
  end()
})

test('input attributes', ({equal,notEqual,end,ok,test,comment}) => {
  var {html,mount,el,renderer,$} = setup(equal)
  mount(<input />)
  var checkbox = $('input')

  comment('input.value')
  mount(<input value="Bob" />)
  equal(checkbox.value, 'Bob', 'value property set')
  mount(<input value="Tom" />)
  equal(checkbox.value, 'Tom', 'value property updated')

  mount(<input />)
  equal(checkbox.value, '', 'value property removed')

  comment('input cursor position')
  mount(<input type="text" value="Game of Thrones" />)
  var input = $('input')
  input.focus()
  input.setSelectionRange(5,7)
  mount(<input type="text" value="Way of Kings" />)
  equal(input.selectionStart, 5, 'selection start')
  equal(input.selectionEnd, 7, 'selection end')

  comment('input cursor position on inputs that don\'t support text selection')
  mount(<input type="email" value="a@b.com" />)

  comment('input cursor position only the active element')
  mount(<input type="text" value="Hello World" />)
  var input = $('input')
  input.setSelectionRange(5,7)
  if (input.setActive) document.body.setActive()
  else input.blur()
  mount(<input type="text" value="Hello World!" />)
  notEqual(input.selectionStart, 5, 'selection start')
  notEqual(input.selectionEnd, 7, 'selection end')

  comment('input.checked')
  mount(<input checked={true} />)
  ok(checkbox.checked, 'checked with a true value')
  equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input checked={false} />)

  ok(!checkbox.checked, 'unchecked with a false value')
  ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')
  mount(<input checked />)
  ok(checkbox.checked, 'checked with a boolean attribute')
  equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input />)
  ok(!checkbox.checked, 'unchecked when attribute is removed')
  ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')

  comment('input.disabled')
  mount(<input disabled={true} />)
  ok(checkbox.disabled, 'disabled with a true value')
  equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input disabled={false} />)
  equal(checkbox.disabled, false, 'disabled is false with false value')
  equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')
  mount(<input disabled />)
  ok(checkbox.disabled, 'disabled is true with a boolean attribute')
  equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input />)
  equal(checkbox.disabled, false, 'disabled is false when attribute is removed')
  equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')

  teardown({renderer,el})
  end()
})

test('option[selected]', ({ok,end,equal}) => {
  var {mount,renderer,el} = setup(equal)
  var options

  // first should be selected
  mount(
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  ok(!options[1].selected, 'is not selected')
  ok(options[0].selected, 'is selected')

  // second should be selected
  mount(
    <select>
      <option>one</option>
      <option selected>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  ok(!options[0].selected, 'is not selected')
  ok(options[1].selected, 'is selected')

  teardown({renderer,el})
  end()
})

test('components', ({equal,end}) => {
  var {el,renderer,mount,html} = setup(equal)
  var Test = props => <span count={props.count}>Hello World</span>

  mount(<Test count={2} />)
  var root = el.firstElementChild
  equal(root.getAttribute('count'), '2', 'rendered with props')

  mount(<Test count={3} />)
  equal(root.getAttribute('count'), '3', 'props updated')

  teardown({renderer,el})
  equal(el.innerHTML, '', 'the element is removed')
  end()
})

test('simple components', ({equal,end}) => {
  var {el,renderer,mount,html} = setup(equal)
  var Box = (props) => <div>{props.text}</div>
  mount(<Box text="Hello World" />)
  html('<div>Hello World</div>', 'function component rendered')
  teardown({renderer,el})
  end()
})

test.skip('nested root components should not have an element', ({deepEqual,mount,end,equal}) => {
  var {el,renderer,mount,html} = setup(equal)
  var Box = props => <div>{props.text}</div>
  var Container = {
    render: props => <Box text="hello" />,
    afterMount: (props, el) => {
      equal(el, undefined)
    }
  }
  mount(<Container />)
  teardown({renderer,el})
  end()
})

test('nested component lifecycle hooks fire in the correct order', t => {
  const {el,renderer,mount} = setup(t.equal)
  let log = []

  const LifecycleLogger = {
    render (props) {
      log.push(props.name + ' render')
      return <div>{props.children}</div>
    },
    afterMount (props) {
      log.push(props.name + ' afterMount')
    },
    beforeUnmount (props) {
      log.push(props.name + ' beforeUnmount')
    },
    shouldUpdate () {
      return true
    }
  }

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )

  t.deepEqual(log, [
    'GrandParent render',
    'Parent render',
    'Child render',
    'Child afterMount',
    'Parent afterMount',
    'GrandParent afterMount'
  ], 'initial render')
  log = []

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )

  t.deepEqual(log, [
    'GrandParent render',
    'Parent render',
    'Child render',
  ], 'updated')
  log = []

  mount(<Wrapper></Wrapper>)

  t.deepEqual(log, [
    'GrandParent beforeUnmount',
    'Parent beforeUnmount',
    'Child beforeUnmount'
  ], 'unmounted with app.unmount()')

  mount(
    <Wrapper>
      <LifecycleLogger name="GrandParent">
        <LifecycleLogger name="Parent">
          <LifecycleLogger name="Child" />
        </LifecycleLogger>
      </LifecycleLogger>
    </Wrapper>
  )
  log = []

  teardown({renderer, el})

  t.deepEqual(log, [
    'GrandParent beforeUnmount',
    'Parent beforeUnmount',
    'Child beforeUnmount'
  ], 'unmounted with renderer.remove()')

  t.end()
})

test('component lifecycle hook signatures', t => {
  var {mount,renderer,el} = setup(t.equal)

  var MyComponent = {
    validate (props) {
      t.ok(props, 'validate has props')
    },
    render (props) {
      t.ok(props, 'render has props')
      return <div id="foo" />
    },
    afterMount (props) {
      t.ok(props, 'afterMount has props')
    },
    beforeUnmount (props) {
      t.ok(props, 'beforeUnmount has props')
      t.end()
    }
  }

  mount(<MyComponent />)
  teardown({renderer,el})
})

test('replace props instead of merging', t => {
  const {mount, renderer, el} = setup(t.equal)
  mount(<TwoWords one="Hello" two="World" />)
  mount(<TwoWords two="Pluto" />)
  t.equal(el.innerHTML, '<span> Pluto</span>')
  teardown({renderer,el})
  t.end()
})

test(`should update all children when a parent component changes`, t => {
  const {mount, renderer, el} = setup(t.equal)
  let parentCalls = 0
  let childCalls = 0

  const Child = {
    render (props) {
      childCalls++
      return <span>{props.text}</span>
    },
    shouldUpdate () {
      return true
    }
  }

  const Parent = {
    render (props) {
      parentCalls++
      return (
        <div name={props.character}>
          <Child text="foo" />
        </div>
      )
    }
  }

  mount(<Parent character="Link" />)
  mount(<Parent character="Zelda" />)
  t.equal(childCalls, 2, 'child rendered twice')
  t.equal(parentCalls, 2, 'parent rendered twice')
  teardown({renderer, el})
  t.end()
})

test.skip('batched rendering', assert => {
  var i = 0
  var IncrementAfterUpdate = {
    render: function(){
      return <div></div>
    },
    afterUpdate: function(){
      i++
    }
  }
  var el = document.createElement('div')
  var app = deku()
  app.mount(<IncrementAfterUpdate text="one" />)
  var renderer = render(app, el)
  app.mount(<IncrementAfterUpdate text="two" />)
  app.mount(<IncrementAfterUpdate text="three" />)
  raf(function(){
    assert.equal(i, 1, 'rendered *once* on the next frame')
    renderer.remove()
    assert.end()
  })
})

test('rendering nested components', ({equal,end}) => {
  var {mount,renderer,el,html} = setup(equal)

  var ComponentA = (props) => <div name="ComponentA">{props.children}</div>
  var ComponentB = (props) => <div name="ComponentB">{props.children}</div>

  var ComponentC = (props) => {
    return (
      <div name="ComponentC">
        <ComponentB>
          <ComponentA>
            <span>{props.text}</span>
          </ComponentA>
        </ComponentB>
      </div>
    )
  }

  mount(<ComponentC text='Hello World!' />)
  html('<div name="ComponentC"><div name="ComponentB"><div name="ComponentA"><span>Hello World!</span></div></div></div>', 'element is rendered')
  mount(<ComponentC text='Hello Pluto!' />)
  equal(el.innerHTML, '<div name="ComponentC"><div name="ComponentB"><div name="ComponentA"><span>Hello Pluto!</span></div></div></div>', 'element is updated with props')
  teardown({renderer,el})
  html('', 'element is removed')
  end()
})

test('skipping updates when the same virtual element is returned', ({equal,end,fail,pass}) => {
  var {mount,renderer,el} = setup(equal)
  var i = 0
  var el = <div onUpdate={el => i++} />

  var Component = {
    render (component) {
      return el
    }
  }

  mount(<Component />)
  mount(<Component />)
  equal(i, 1, 'component not updated')
  teardown({renderer,el})
  end()
})

test('firing mount events on sub-components created later', t => {
  var {mount,renderer,el} = setup(t.equal)

  var ComponentA = {
    render: () => <div />,
    beforeUnmount: () => t.pass('beforeUnmount called'),
    afterMount: () => t.pass('afterMount called')
  }

  t.plan(2)
  mount(<ComponentA />)
  mount(<div />)
  teardown({renderer, el})
})

test('should change root node and still update correctly', t => {
  const {mount, html, renderer, el} = setup(t.equal)

  const ComponentA = props =>
    element(props.type, null, props.text)

  const Test = props =>
    <ComponentA type={props.type} text={props.text} />

  mount(<Test type="span" text="test" />)
  html('<span>test</span>')
  mount(<Test type="div" text="test" />)
  html('<div>test</div>')
  mount(<Test type="div" text="foo" />)
  html('<div>foo</div>')
  teardown({renderer, el})
  t.end()
})

test('replacing components with other components', t => {
  const {mount, renderer, el, html} = setup(t.equal)
  const ComponentA = () => <div>A</div>
  const ComponentB = () => <div>B</div>

  const ComponentC = (props) => {
    if (props.type === 'A') {
      return <ComponentA />
    } else {
      return <ComponentB />
    }
  }

  mount(<ComponentC type="A" />)
  html('<div>A</div>')
  mount(<ComponentC type="B" />)
  html('<div>B</div>')
  teardown({renderer, el})
  t.end()
})

test('adding, removing and updating events', ({equal,end}) => {
  var {mount,renderer,el,$} = setup(equal)
  var count = 0
  var onclicka = () => count += 1
  var onclickb = () => count -= 1

  var Page = {
    render: (props) => <span onClick={props.clicker} />
  }

  mount(<Page clicker={onclicka} />)
  trigger($('span'), 'click')
  equal(count, 1, 'event added')
  mount(<Page clicker={onclickb} />)
  trigger($('span'), 'click')
  equal(count, 0, 'event updated')
  mount(<Page />)
  trigger($('span'), 'click')
  equal(count, 0, 'event removed')
  teardown({renderer,el})
  end()
})

test('should bubble events', ({equal,end,fail,ok}) => {
  var {mount,renderer,el,$} = setup(equal)
  var state = {}

  var Test = {
    render: function (props) {
      let state = props.state
      return (
        <div onClick={onParentClick}>
          <div class={state.active ? 'active' : ''} onClick={onClickTest}>
            <a>link</a>
          </div>
        </div>
      )
    },
    shouldUpdate () {
      return true
    }
  }

  var onClickTest = function (event) {
    state.active = true
    equal(el.firstChild.firstChild.firstChild, event.target, 'event.target is set')
    event.stopImmediatePropagation()
  }

  var onParentClick = function () {
    fail('event bubbling was not stopped')
  }

  mount(<Test state={state} />)
  trigger($('a'), 'click')
  equal(state.active, true, 'state was changed')
  mount(<Test state={state} />)
  ok($('.active'), 'event fired on parent element')
  teardown({renderer,el})
  end()
})

test('unmounting components when removing an element', ({equal,pass,end,plan}) => {
  var {mount,renderer,el} = setup(equal)

  var Test = {
    render:        () => <div />,
    beforeUnmount: () => pass('component was unmounted')
  }

  plan(1)
  mount(<div><div><Test /></div></div>)
  mount(<div></div>)
  teardown({renderer,el})
  end()
})

test('update sub-components with the same element', ({equal,end}) => {
  var {mount,renderer,el} = setup(equal)

  let Page1 = {
    render(props) {
      return (
        <Wrapper>
          <Wrapper>
            <Wrapper>
              {
                props.show ?
                  <div>
                    <label/>
                    <input/>
                  </div>
                :
                  <span>
                    Hello
                  </span>
              }
            </Wrapper>
          </Wrapper>
        </Wrapper>
      )
    }
  }

  let Page2 = (props) => {
    return (
      <div>
        <span>{props.title}</span>
      </div>
    )
  }

  let App = (props) => props.page === 1 ? <Page1 show={props.show} /> : <Page2 title={props.title} />

  mount(<App page={1} show={true} />)
  mount(<App page={1} show={false} />)
  mount(<App page={2} title="Hello World" />)
  mount(<App page={2} title="foo" />)
  equal(el.innerHTML, '<div><span>foo</span></div>')
  teardown({renderer,el})
  end()
})

test('replace elements with component nodes', t => {
  const {mount, renderer, el} = setup(t.equal)

  mount(<span/>)
  t.equal(el.innerHTML, '<span></span>', 'rendered element')

  mount(<Wrapper>component</Wrapper>)
  t.equal(el.innerHTML, '<div>component</div>', 'replaced with component')

  teardown({renderer, el})
  t.end()
})

test('svg elements', t => {
  const {mount, renderer, el} = setup(t.equal)

  mount(
    <svg width="92px" height="92px" viewBox="0 0 92 92">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <circle id="circle" fill="#D8D8D8" cx="46" cy="46" r="46"></circle>
      </g>
    </svg>
  )
  t.equal(el.firstChild.tagName, 'svg', 'rendered svg element')

  teardown({renderer, el})
  t.end()
})

test('moving components with keys', t => {
  const {mount, renderer, el} = setup(t.equal)
  let one, two, three

  t.plan(10)

  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Two</ListItem>
    </ul>
  )
  ;[one, two] = [].slice.call(el.querySelectorAll('li'))

  // Moving
  mount(
    <ul>
      <ListItem key="bar">Two</ListItem>
      <ListItem key="foo">One</ListItem>
    </ul>
  )

  let updated = el.querySelectorAll('li')
  t.ok(updated[1] === one, 'foo moved down')
  t.ok(updated[0] === two, 'bar moved up')

  // Removing
  mount(
    <ul>
      <ListItem key="bar">Two</ListItem>
    </ul>
  )
  updated = el.querySelectorAll('li')
  t.ok(updated[0] === two && updated.length === 1, 'foo was removed')

  // Updating
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Two</ListItem>
      <ListItem key="baz">Three</ListItem>
    </ul>
  )

  ;[one,two,three] = [].slice.call(el.querySelectorAll('li'))
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="baz">Four</ListItem>
    </ul>
  )
  updated = el.querySelectorAll('li')
  t.ok(updated[0] === one, 'foo is the same')
  t.ok(updated[1] === three, 'baz is the same')
  t.ok(updated[1].innerHTML === 'Four', 'baz was updated')
  let [foo, baz] = [].slice.call(updated)

  // Adding
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">Five</ListItem>
      <ListItem key="baz">Four</ListItem>
    </ul>
  )
  updated = el.querySelectorAll('li')
  t.ok(updated[0] === foo, 'foo is the same')
  t.ok(updated[2] === baz, 'baz is the same')
  t.ok(updated[1].innerHTML === 'Five', 'bar was added')

  // Moving event handlers
  const clicked = () => t.pass('event handler moved')
  mount(
    <ul>
      <ListItem key="foo">One</ListItem>
      <ListItem key="bar">
        <span onClick={clicked}>Click Me!</span>
      </ListItem>
    </ul>
  )
  mount(
    <ul>
      <ListItem key="bar">
        <span onClick={clicked}>Click Me!</span>
      </ListItem>
      <ListItem key="foo">One</ListItem>
    </ul>
  )
  trigger(el.querySelector('span'), 'click')

  // Removing handlers. If the handler isn't removed from
  // the path correctly, it will still fire the handler from
  // the previous assertion.
  mount(
    <ul>
      <ListItem key="foo">
        <span>One</span>
      </ListItem>
    </ul>
  )
  trigger(el.querySelector('span'), 'click')

  teardown({renderer, el})
  t.end()
})

test('updating event handlers when children are removed', t => {
  const {mount, renderer, el} = setup(t.equal)
  const items = ['foo','bar','baz']

  const ListItem = {
    shouldUpdate () { return true },
    render (props) {
      return (
        <li>
          <a onClick={e => { items.splice(props.index, 1); console.log('remove') }} />
        </li>
      )
    }
  }

  const List = {
    shouldUpdate () { return true },
    render (props) {
      return (
        <ul>
          {props.items.map((_,i) => <ListItem index={i} />)}
        </ul>
      )
    }
  }

  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  trigger(el.querySelector('a'), 'click')
  mount(<List items={items} />)
  t.equal(el.innerHTML, '<ul></ul>', 'all items were removed')

  teardown({renderer, el})
  t.end()
})

test('components should receive path based keys if they are not specified', t => {
  t.end()
})

test('array jsx', t => {
  const {mount, renderer, el} = setup(t.equal)
  const arr = [1, 2]

  mount(
    <div>
      Hello World
      {arr.map(i => <span>{i}</span>)}
      <hr/>
    </div>
  )

  const n = el.firstChild
  t.equal(n.childNodes[0].nodeName, '#text')
  t.equal(n.childNodes[1].nodeName, 'SPAN')
  t.equal(n.childNodes[2].nodeName, 'SPAN')
  t.equal(n.childNodes[3].nodeName, 'HR')

  teardown({renderer, el})
  t.end()
})


test('diff', t => {
  t.test('reverse', diffXf(r => r.reverse()))
  t.test('prepend (1)', diffXf(r => [11].concat(r)))
  t.test('remove (1)', diffXf(r => r.slice(1)))
  t.test('reverse, remove(1)', diffXf(r => r.reverse().slice(1)))
  t.test('remove (1), reverse', diffXf(r => r.slice(1).reverse()))
  t.test('reverse, append (1)', diffXf(r => r.reverse().concat(11)))
  t.test('reverse, prepend (1)', diffXf(r => [11].concat(r.reverse())))
  t.test('sides reversed, middle same', diffXf(r => r.slice().reverse().slice(0, 3).concat(r.slice(3, 7)).concat(r.slice().reverse().slice(7))))
  t.test('replace all', diffXf(r => range(11, 25)))
  t.test('insert (3), randomize', diffXf(r => randomize(r.concat(range(13, 17)))))
})

function randomize (r) {
  return r.reduce(acc => {
    const i = Math.floor(Math.random() * 100000) % r.length
    acc.push(r[i])
    r.splice(i, 1)
    return acc
  }, [])
}

function range (begin, end) {
  const r = []

  for (let i = begin; i < end; i++) {
    r.push(i)
  }

  return r
}

function diffXf (xf) {
  return t => {
    const r = range(0, 10)
    diffTest(t, r, xf(r.slice()))
    t.end()
  }
}

function diffTest (t, a, b) {
  const {mount, renderer, el} = setup(t.equal)

  mount(<div>{a.map(i => <span key={i}>{i}</span>)}</div>)
  mount(<div>{b.map(i => <span key={i}>{i}</span>)}</div>)

  const node = el.firstChild
  for (let i = 0; i < node.childNodes.length; i++) {
    t.equal(node.childNodes[i].textContent, b[i].toString())
  }

  t.equal(node.childNodes.length, b.length)
}
