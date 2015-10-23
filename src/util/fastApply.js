/**
 * Fast apply
 */

function fastApply (fn, args) {
  switch (args.length) {
    case 1:
      return fn(args[0])
    case 2:
      return fn(args[0], args[1])
    case 3:
      return fn(args[0], args[1], args[2])
    case 4:
      return fn(args[0], args[1], args[2], args[3])
    case 5:
      return fn(args[0], args[1], args[2], args[3], args[4])
    default:
      return fn.apply(null, args)
  }
}

/**
 * Exports
 */

export default fastApply
