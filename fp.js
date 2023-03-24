/**
 * FP Modules
 *
 * The following are a derivative based on the Static-Land spec
 * and an experimental way to talk to the canonical
 * definitions to be able to use generic functional programming utils
 *
 * SPDX-License-Identifier: MIT
 *
 * reaper <ahoy@barelyhuman.dev>
 */

export const fromSubscription = ({ next, complete }) => {
  return {
    next: val => {
      next && next(val)
    },
    complete: () => {
      complete && complete()
    },
  }
}

/**
 * Prefer using compose while the function flow is left to right
 * instead of the normal right to left data flow
 *
 * Normal => compose(fun2,fun1)(data)
 *
 * This implementation
 *
 * Normal => compose(fun1,fun2)(data)
 */
export const compose =
  (...funcs) =>
  d =>
    funcs.reduce((acc, f) => f(acc), d)

export const unary = f => x => f(x)
export const binary = f => (x, y) => f(x, y)

export function curry(fn) {
  function $curry(...args) {
    if (args.length < fn.length) {
      return $curry.bind(null, ...args)
    }

    return fn.call(null, ...args)
  }

  return $curry
}

export const prop = curry((prop, d) => d[prop])

const isNil = x => x === undefined || x === null

export const map = curry((fn, x) => {
  if (Array.isArray(x)) {
    return x.map(fn)
  }
  const dispatcher = x.canonical
  return dispatcher.map(fn, x)
})

export const join = x => {
  const dispatcher = x.canonical
  return dispatcher.join(x)
}

export const run = io => {
  return io.unsafePerformIO()
}

export const chain = curry((fn, x) => {
  return fn(map(join, x))
})

export const fromEvent = (elm, evt) => {
  const listeners = []
  const fn = e => {
    listeners.forEach(f => {
      f(e)
    })
  }
  elm.addEventListener(evt, fn)
  return {
    subscribe: x => {
      listeners.push(x)
      const leng = listeners.length
      return () => {
        listeners.slice(leng - 1, 1)
        elm.removeEventListener(evt, fn)
      }
    },
  }
}

export const IO = {
  of: fn => ({ canonical: IO, unsafePerformIO: fn }),
  map: curry((f, d) => IO.of(compose(d.unsafePerformIO, f))),
  chain: curry((f, d) => IO.join(IO.map(f, d))),
  join: x => {
    const io = x.unsafePerformIO()
    if (io.unsafePerformIO) {
      return io.unsafePerformIO()
    }
    return io
  },
}
