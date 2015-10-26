/**
 * Imports
 */

import {compose, composeAll} from './util/compose'
import isThunk from './util/isThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import actions from './actions'
import _create from './create'
import keyDiff, {CREATE, REMOVE, MOVE, UPDATE} from 'key-diff'

const REMOVE_ALL = 5

/**
 * Diff and render two vnode trees
 */

function update (effect) {
  const create = _create(effect)
  const {
    setAttribute,
    removeAttribute,
    replaceChild,
    removeChild,
    insertBefore,
    renderThunk
  } = composeAll(effect, actions)

  return updateRecursive

  function updateRecursive (prev, next) {

    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) next = renderThunk(next, prev)
      prev = renderThunk(prev)
      if (next === prev) {
        return (next.element = prev.element)
      }
    } else if (isThunk(next)) {
      next = renderThunk(next)
    }

    const node = next.element = prev.element

    if (isText(prev)) {
      if (isText(next)) {
        if (prev.value !== next.value) setAttribute(node, 'nodeValue', next.value)
        return node
      } else {
        const newNode = create(next)
        replaceChild(node.parentNode, newNode, node)
        return newNode
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      const newNode = create(next)
      replaceChild(node.parentNode, newNode, node)
      return newNode
    }

    /**
     * Diff attributes
     */

    const pattrs = prev.attrs
    const nattrs = next.attrs

    forEach(pattrs, (val, key) => {
      if (!nattrs || !(key in nattrs)) {
        removeAttribute(node, key)
      }
    })

    forEach(nattrs, (val, key) => {
      if (!pattrs || !(key in pattrs) || val !== pattrs[key]) {
        setAttribute(node, key, val)
      }
    })

    /**
     * Diff children
     */

    diff(prev.children, next.children, diffChild(node))

    return node
  }

  function diffChild (node) {
    return function (type, prev, next, pos) {
      switch (type) {
        case CREATE:
          insertBefore(node, create(next), node.childNodes[pos] || null)
          break
        case UPDATE:
          updateRecursive(prev, next)
          break
        case MOVE:
          insertBefore(node, updateRecursive(prev, next), nativeElement(prev))
          break
        case REMOVE:
          removeChild(node, nativeElement(prev))
          break
      }
    }
  }
}


function diff (prev, next, effect) {
  const prevLen = prev.length
  const nextLen = next.length
  let pStartIdx = 0
  let pEndIdx = prevLen - 1
  let nStartIdx = 0
  let nEndIdx = nextLen - 1
  let pStartItem = prev[pStartIdx]
  let pEndItem = prev[pEndIdx]
  let nStartItem = next[nStartIdx]
  let nEndItem = next[nEndIdx]
  let created = 0

  // List head is the same
  while (pStartIdx < prevLen && nStartIdx < nextLen && pStartItem.key === nStartItem.key) {
    effect(UPDATE, pStartItem, nStartItem)
    pStartItem = prev[++pStartIdx]
    nStartItem = next[++nStartIdx]
  }

  // List tail is the same
  while (pEndIdx >= pStartIdx && nEndIdx >= nStartIdx && pEndItem.key === nEndItem.key) {
    effect(UPDATE, pEndItem, nEndItem)
    pEndItem = prev[--pEndIdx]
    nEndItem = next[--nEndIdx]
  }

  // Reversals
  while (pStartIdx <= pEndIdx && nEndIdx >= nStartIdx && pStartItem.key === nEndItem.key) {
    effect(MOVE, pStartItem, nEndItem)
    pStartItem = prev[++pStartIdx]
    nEndItem = next[--nEndIdx]
  }

  while (pEndIdx >= pStartIdx && nStartIdx <= nEndIdx && nStartItem.key === pEndItem.key) {
    effect(MOVE, pEndItem, nStartItem)
    pEndItem = prev[--pEndIdx]
    nStartItem = next[++nStartIdx]
  }

  const prevMap = keyMap(prev, pStartIdx, pEndIdx + 1)
  const keep = {}

  for(; nStartIdx <= nEndIdx; nStartItem = next[++nStartIdx]) {
    const oldIdx = prevMap[nStartItem.key]

    if (isUndefined(oldIdx)) {
      effect(CREATE, null, nStartItem, nStartIdx)
      ++created
    } else {
      keep[oldIdx] = true
      effect(MOVE, prev[oldIdx], nStartItem)
    }
  }

  // If there are no creations, then you have to
  // remove exactly prevLen - nextLen elements in this
  // diff.  You have to remove one more for each element
  // that was created.  This means once we have
  // removed that many, we can stop.

  const necessaryRemovals = (prevLen - nextLen) + created
  for (let removals = 0; removals < necessaryRemovals; pStartItem = prev[++pStartIdx]) {
    if (isUndefined(keep[pStartIdx])) {
      effect(REMOVE, pStartItem)
      ++removals
    }
  }
}

function isUndefined (val) {
  return typeof val === 'undefined'
}

// function diff (prev, next, effect) {
//   const prevLen = prev.length
//   const nextLen = next.length
//   const minLen = Math.min(prevLen, nextLen)
//   let i = 0

//   // To the extent that the list starts the same,
//   // iterate through it and update
//   for (; i < minLen; ++i) {
//     const pitem = prev[i]
//     const nitem = next[i]

//     if (pitem.key === nitem.key) {
//       effect(UPDATE, pitem, nitem)
//     } else {
//       break
//     }
//   }

//   if (prevLen === nextLen) {
//     // Special case list-reversal
//     for (i; i < nextLen; ++i) {
//       const pidx = prevLen - (i + 1)
//       const pitem = prev[pidx]
//       const nitem = next[i]

//       if (typeof nitem.key !== 'undefined' && pitem.key === nitem.key) {
//         if (i === pidx) {
//           effect(UPDATE, pitem, nitem)
//         } else {
//           effect(MOVE, pitem, nitem, i)
//         }
//       } else {
//         break
//       }
//     }

//     if (i === nextLen) {
//       return
//     }
//   } else if (prevLen === 0) {
//     // Special case empty prior child list
//     for (; i < nextLen; i++) {
//       effect(CREATE, null, next[i], i)
//     }

//     return
//   } else if (nextLen === 0) {
//     effect(REMOVE_ALL)
//     return
//   }

//   const nextMap = keyMap(next, i)
//   if (i < nextLen) {
//     const prevMap = keyMap(prev, 0)
//     let offset = 0

//     // Keep i from the previous loop, if it ran
//     for (i; i < nextLen; ++i) {
//       const nextItem = next[i]
//       const prevItem = prev[i]
//       const nextKey = nextItem.key
//       let oldPos = prevMap[nextKey]

//       if (i < prevLen && typeof nextMap[prevItem.key] === 'undefined') {
//         effect(REMOVE, prevItem)
//         offset--
//       }

//       if (typeof oldPos !== 'undefined') {
//         if (i === (oldPos + offset)) {
//           effect(UPDATE, prev[oldPos], nextItem, i)
//         } else {
//           effect(MOVE, prev[oldPos], nextItem, i)
//         }
//       } else {
//         effect(CREATE, null, nextItem, i)
//         offset++
//       }
//     }
//   }

//   if (prevLen > nextLen) {
//     for (let j = nextLen; j < prevLen; ++j) {
//       const item = prev[j]
//       if (typeof nextMap[item.key] === 'undefined') {
//         effect(REMOVE, item)
//       }
//     }
//   }
// }

function keyMap (items, start, end) {
  const map = {}

  for (let i = start; i < end; ++i) {
    map[items[i].key] = i
  }

  return map
}

function nativeElement (vnode) {
  return vnode.vnode
    ? vnode.vnode.element
    : vnode.element
}

/**
 * Exports
 */

export default update
