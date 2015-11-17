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

const RenderChildren  = ({children}) => children[0]
const ListItem        = ({children}) => <li>{children}</li>
const Wrapper         = ({children}) => <div>{children}</div>
const TwoWords        = ({props}) => <span>{props.one} {props.two}</span>

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
        const newTree = {type: 'fake-element', children: []}
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

test('rendering DOM', t => {
  const {renderer, el, mount, unmount, html} = setup(t.equal)
  let rootEl

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
  t.pass('DOM not updated without change')

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
  t.equal(el.firstChild, rootEl, 'root element not replaced')

  // Replace
  mount(<div>Foo!</div>)
  html('<div>Foo!</div>', 'element is replaced')
  t.notEqual(el.firstChild, rootEl, 'root element replaced')

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
  t.equal(el.firstChild, rootEl, 'root element not replaced')

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

  t.equal(el.firstChild, rootEl, 'root element not replaced')
  const span = el.firstChild.firstChild

  // Siblings removed
  mount(
    <div>
      <span>one</span>
    </div>
  )
  html('<div><span>one</span></div>', 'added element')
  t.equal(el.firstChild.firstChild, span, 'child element not replaced')
  t.equal(el.firstChild, rootEl, 'root element not replaced')

  // Removing the renderer
  teardown({renderer, el})
  html('', 'element is removed')
  t.end()
})

test('falsy attributes should not touch the DOM', t => {
  const {renderer, el, mount} = setup(t.equal)
  mount(<span name="" />)

  const child = el.children[0]
  child.setAttribute = () => t.fail('should not set attributes')
  child.removeAttribute = () => t.fail('should not remove attributes')

  mount(<span name="" />)
  t.pass('DOM not touched')
  teardown({renderer, el})
  t.end()
})

test('innerHTML attribute', t => {
  const {html, mount, el, renderer} = setup(t.equal)
  mount(<div innerHTML="Hello <strong>deku</strong>" />)
  html('<div>Hello <strong>deku</strong></div>', 'innerHTML is rendered')
  mount(<div innerHTML="Hello <strong>Pluto</strong>" />)
  html('<div>Hello <strong>Pluto</strong></div>', 'innerHTML is updated')
  mount(<div />)
  // Causing issues in IE10. Renders with a &nbsp; for some reason
  // html('<div></div>', 'innerHTML is removed')
  teardown({renderer, el})
  t.end()
})

test('input attributes', t => {
  const {html, mount, el, renderer, $} = setup(t.equal)
  mount(<input />)
  const checkbox = $('input')

  t.comment('input.value')
  mount(<input value="Bob" />)
  t.equal(checkbox.value, 'Bob', 'value property set')
  mount(<input value="Tom" />)
  t.equal(checkbox.value, 'Tom', 'value property updated')

  mount(<input />)
  t.equal(checkbox.value, '', 'value property removed')

  t.comment('input cursor position')
  mount(<input type="text" value="Game of Thrones" />)
  let input = $('input')
  input.focus()
  input.setSelectionRange(5,7)
  mount(<input type="text" value="Way of Kings" />)
  t.equal(input.selectionStart, 5, 'selection start')
  t.equal(input.selectionEnd, 7, 'selection end')

  t.comment('input cursor position on inputs that don\'t support text selection')
  mount(<input type="email" value="a@b.com" />)

  t.comment('input cursor position only the active element')
  mount(<input type="text" value="Hello World" />)
  input = $('input')
  input.setSelectionRange(5,7)
  if (input.setActive) document.body.setActive()
  else input.blur()
  mount(<input type="text" value="Hello World!" />)
  t.notEqual(input.selectionStart, 5, 'selection start')
  t.notEqual(input.selectionEnd, 7, 'selection end')

  t.comment('input.checked')
  mount(<input checked={true} />)
  t.ok(checkbox.checked, 'checked with a true value')
  t.equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input checked={false} />)

  t.ok(!checkbox.checked, 'unchecked with a false value')
  t.ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')
  mount(<input checked />)
  t.ok(checkbox.checked, 'checked with a boolean attribute')
  t.equal(checkbox.getAttribute('checked'), null, 'has checked attribute')
  mount(<input />)
  t.ok(!checkbox.checked, 'unchecked when attribute is removed')
  t.ok(!checkbox.hasAttribute('checked'), 'has no checked attribute')

  t.comment('input.disabled')
  mount(<input disabled={true} />)
  t.ok(checkbox.disabled, 'disabled with a true value')
  t.equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input disabled={false} />)
  t.equal(checkbox.disabled, false, 'disabled is false with false value')
  t.equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')
  mount(<input disabled />)
  t.ok(checkbox.disabled, 'disabled is true with a boolean attribute')
  t.equal(checkbox.hasAttribute('disabled'), true, 'has disabled attribute')
  mount(<input />)
  t.equal(checkbox.disabled, false, 'disabled is false when attribute is removed')
  t.equal(checkbox.hasAttribute('disabled'), false, 'has no disabled attribute')

  teardown({renderer, el})
  t.end()
})

test('option[selected]', t => {
  const {mount, renderer, el} = setup(t.equal)
  let options

  // first should be selected
  mount(
    <select>
      <option selected>one</option>
      <option>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  t.ok(!options[1].selected, 'is not selected')
  t.ok(options[0].selected, 'is selected')

  // second should be selected
  mount(
    <select>
      <option>one</option>
      <option selected>two</option>
    </select>
  )

  options = el.querySelectorAll('option')
  t.ok(!options[0].selected, 'is not selected')
  t.ok(options[1].selected, 'is selected')

  teardown({renderer, el})
  t.end()
})

test('components', t => {
  const {el, renderer, mount, html} = setup(t.equal)
  const Test = ({props}) => <span count={props.count}>Hello World</span>

  mount(<Test count={2} />)
  const root = el.firstElementChild
  t.equal(root.getAttribute('count'), '2', 'rendered with props')

  mount(<Test count={3} />)
  t.equal(root.getAttribute('count'), '3', 'props updated')

  teardown({renderer,el})
  t.equal(el.innerHTML, '', 'the element is removed')
  t.end()
})

test('simple components', t => {
  const {el, renderer, mount, html} = setup(t.equal)
  const Box = ({props}) => <div>{props.text}</div>

  mount(<Box text="Hello World" />)
  html('<div>Hello World</div>', 'function component rendered')
  teardown({renderer, el})
  t.end()
})

test.skip('nested root components should not have an element', t => {
  const {el, renderer, mount, html} = setup(t.equal)
  const Box = ({props}) => <div>{props.text}</div>
  const Container = {
    render: () => <Box text="hello" />,
    afterMount: ({props}, el) => {
      t.equal(el, undefined)
    }
  }

  mount(<Container />)
  teardown({renderer, el})
  t.end()
})

test('nested component lifecycle hooks fire in the correct order', t => {
  const {el, renderer, mount} = setup(t.equal)
  let log = []

  const LifecycleLogger = {
    render ({props, children}) {
      log.push(props.name + ' render')
      return <div>{children}</div>
    },
    afterMount ({props}) {
      log.push(props.name + ' afterMount')
    },
    beforeUnmount ({props}) {
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
  const {mount, renderer, el} = setup(t.equal)

  const MyComponent = {
    validate ({props}) {
      t.ok(props, 'validate has props')
    },
    render ({props}) {
      t.ok(props, 'render has props')
      return <div id="foo" />
    },
    afterMount ({props}) {
      t.ok(props, 'afterMount has props')
    },
    beforeUnmount ({props}) {
      t.ok(props, 'beforeUnmount has props')
      t.end()
    }
  }

  mount(<MyComponent />)
  teardown({renderer, el})
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
    render ({props}) {
      childCalls++
      return <span>{props.text}</span>
    },
    shouldUpdate () {
      return true
    }
  }

  const Parent = {
    render ({props}) {
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

test.skip('batched rendering', t => {
  let i = 0
  const IncrementAfterUpdate = {
    render: function(){
      return <div></div>
    },
    afterUpdate: function(){
      i++
    }
  }

  const el = document.createElement('div')
  const app = deku()
  app.mount(<IncrementAfterUpdate text="one" />)
  const renderer = render(app, el)
  app.mount(<IncrementAfterUpdate text="two" />)
  app.mount(<IncrementAfterUpdate text="three" />)
  raf(() => {
    t.equal(i, 1, 'rendered *once* on the next frame')
    renderer.remove()
    t.end()
  })
})

test('rendering nested components', t => {
  const {mount, renderer, el, html} = setup(t.equal)

  const ComponentA = ({children}) => <div name="ComponentA">{children}</div>
  const ComponentB = ({children}) => <div name="ComponentB">{children}</div>

  const ComponentC = ({props}) => {
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
  t.equal(el.innerHTML, '<div name="ComponentC"><div name="ComponentB"><div name="ComponentA"><span>Hello Pluto!</span></div></div></div>', 'element is updated with props')
  teardown({renderer, el})
  html('', 'element is removed')
  t.end()
})

test('skipping updates when the same virtual element is returned', t => {
  const {mount, renderer, el} = setup(t.equal)
  let i = 0
  const vnode = <div onUpdate={el => i++} />

  const Component = {
    render (component) {
      return vnode
    }
  }

  mount(<Component />)
  mount(<Component />)
  t.equal(i, 1, 'component not updated')
  teardown({renderer, el})
  t.end()
})

test('firing mount events on sub-components created later', t => {
  const {mount, renderer, el} = setup(t.equal)
  const ComponentA = {
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

  const ComponentA = ({props}) => element(props.type, null, props.text)
  const Test = ({props}) => <ComponentA type={props.type} text={props.text} />

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

  const ComponentC = ({props}) => {
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

test('adding, removing and updating events', t => {
  const {mount, renderer, el, $} = setup(t.equal)
  let count = 0
  const onclicka = () => count += 1
  const onclickb = () => count -= 1

  mount(<Page clicker={onclicka} />)
  trigger($('span'), 'click')
  t.equal(count, 1, 'event added')
  mount(<Page clicker={onclickb} />)
  trigger($('span'), 'click')
  t.equal(count, 0, 'event updated')
  mount(<Page />)
  trigger($('span'), 'click')
  t.equal(count, 0, 'event removed')
  teardown({renderer, el})
  t.end()

  function Page ({props}) {
    return <span onClick={props.clicker} />
  }
})

test('should bubble events', t => {
  const {mount, renderer, el, $} = setup(t.equal)
  const state = {}

  const Test = {
    render: function ({props}) {
      const {state} = props

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

  mount(<Test state={state} />)
  trigger($('a'), 'click')
  t.equal(state.active, true, 'state was changed')
  mount(<Test state={state} />)
  t.ok($('.active'), 'event fired on parent element')
  teardown({renderer, el})
  t.end()

  function onClickTest (event) {
    state.active = true
    t.equal(el.firstChild.firstChild.firstChild, event.target, 'event.target is set')
    event.stopImmediatePropagation()
  }

  function onParentClick () {
    t.fail('event bubbling was not stopped')
  }
})

test('unmounting components when removing an element', t => {
  const {mount, renderer, el} = setup(t.equal)

  const Test = {
    render:        () => <div />,
    beforeUnmount: () => t.pass('component was unmounted')
  }

  t.plan(1)
  mount(<div><div><Test /></div></div>)
  mount(<div></div>)
  teardown({renderer, el})
  t.end()
})

test('update sub-components with the same element', t => {
  const {mount, renderer, el} = setup(t.equal)

  const Page1 = {
    render ({props}) {
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

  const Page2 = ({props}) => {
    return (
      <div>
        <span>{props.title}</span>
      </div>
    )
  }

  const App = ({props}) => props.page === 1 ? <Page1 show={props.show} /> : <Page2 title={props.title} />

  mount(<App page={1} show={true} />)
  mount(<App page={1} show={false} />)
  mount(<App page={2} title="Hello World" />)
  mount(<App page={2} title="foo" />)
  t.equal(el.innerHTML, '<div><span>foo</span></div>')
  teardown({renderer, el})
  t.end()
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
    render ({props}) {
      return (
        <li>
          <a onClick={e => { items.splice(props.index, 1); console.log('remove') }} />
        </li>
      )
    }
  }

  const List = {
    shouldUpdate () { return true },
    render ({props}) {
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
  t.test('moveFromStartToEnd (1)', diffXf(r => r.slice(1).concat(r[0])))
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
