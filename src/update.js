/**
 * Imports
 */

import isThunk from './util/isThunk'
import isSameThunk from './util/isSameThunk'
import isText from './util/isText'
import forEach from './util/forEach'
import actions from './actions'
import _create from './create'
import diff, {CREATE, MOVE, REMOVE, UPDATE} from 'dift'

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
    renderThunk,
    unrenderThunk
  } = actions

  return updateRecursive

  function updateRecursive (prev, next, path = '0') {

    /**
     * Render thunks if necessary
     */

    if (isThunk(prev)) {
      if (isThunk(next)) {
        if (!isSameThunk(prev, next)) {
          unrenderThunk(prev)
        }

        next.path = path
        next = effect(renderThunk(next, prev))
      } else {
        effect(unrenderThunk(prev))
      }

      prev = prev.vnode

      if (next === prev) {
        return (next.el = prev.el)
      } else {
        return updateRecursive(prev, next, path + '.0')
      }
    } else if (isThunk(next)) {
      next.path = path
      next = effect(renderThunk(next))
      return updateRecursive(prev, next, path + '.0')
    }

    const node = next.el = prev.el

    if (isText(prev)) {
      if (isText(next)) {
        if (prev.text !== next.text) effect(setAttribute(node, 'nodeValue', next.text))
        return node
      } else {
        const newNode = create(next)
        effect(replaceChild(node.parentNode, newNode, node))
        return newNode
      }
    } else if (isText(next) || prev.tag !== next.tag) {
      const newNode = create(next)
      unrenderChildren(prev)
      effect(replaceChild(node.parentNode, newNode, node))
      return newNode
    }

    /**
     * Diff attributes
     */

    const pattrs = prev.attrs
    const nattrs = next.attrs

    if (pattrs !== null) {
      forEach(pattrs, (val, key) => {
        if (!nattrs || !(key in nattrs)) {
          effect(removeAttribute(node, key))
        }
      })
    }

    if (nattrs !== null) {
      forEach(nattrs, (val, key) => {
        if (!pattrs || !(key in pattrs) || val !== pattrs[key]) {
          effect(setAttribute(node, key, val))
        }
      })
    }

    /**
     * Diff children
     */

    diff(prev.children, next.children, diffChild(node, path))

    return node
  }

  function diffChild (node, path) {
    return function (type, prev, next, pos) {
      switch (type) {
        case CREATE:
          effect(insertBefore(node, create(next, path + '.' + pos), node.childNodes[pos] || null))
          break
        case UPDATE:
          updateRecursive(prev, next, path + '.' + pos)
          break
        case MOVE:
          effect(insertBefore(node, updateRecursive(prev, next, path + '.' + pos), node.childNodes[pos] || null))
          break
        case REMOVE:
          unrenderThunks(prev)
          effect(removeChild(node, nativeElement(prev)))
          break
      }
    }
  }

  function unrenderThunks (vnode) {
    if (isThunk(vnode)) {
      effect(unrenderThunk(vnode))
      vnode = vnode.vnode
    }

    unrenderChildren(vnode)
  }

  function unrenderChildren (vnode) {
    const children = vnode.children

    if (children) {
      for (let i = 0, len = children.length; i < len; ++i) {
        unrenderThunks(children[i])
      }
    }
  }
}

function nativeElement (vnode) {
  return vnode.vnode
    ? vnode.vnode.el
    : vnode.el
}

/**
 * Exports
 */

export default update
