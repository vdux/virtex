/**
 * Reducer
 */

function reducer (state, action) {
  switch (action.type) {
    case 'INCREMENT':
      const counters = state.counters.slice(0)
      counters[action.payload.idx]++

      return {
        ...state,
        counters
      }
  }

  return state
}

/**
 * Exports
 */

export default reducer
