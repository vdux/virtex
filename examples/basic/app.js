/**
 * Imports
 */

import element from 'virtex-element'

function app ({counters}) {
  return (
    <div>
      Hello World
      {
        counters.map((value, idx) => <Counter value={value} idx={idx} />)
      }
    </div>
  )
}

const Counter = {
  beforeMount ({props}) {
    const {idx} = props
    return increment(idx)
  },
  render ({props}) {
    const {value = 0, idx} = props

    return (
      <div style={{color: value % 2 ? 'red' : 'blue'}}>
        <div>Counter: {value}</div>
        <button onClick={e => increment(idx)}>Increment Counter</button>
      </div>
    )
  }
}

function increment (idx) {
  return {
    type: 'INCREMENT',
    payload: {
      idx
    }
  }
}

/**
 * Exports
 */

export default app
