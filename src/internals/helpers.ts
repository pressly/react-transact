import {ITask, TasksOrEffects, IEffect} from "../interfaces"
import Call from "./Call"
import Task from "./Task"

export const invariant = (predicate: boolean, message: string) => {
  if (!predicate) {
    throw new Error(message)
  }
}

export const shallowEqual = (a, b) => {
  if (a === b) {
    return true
  }

  if (!a && b) {
    return false
  }

  if (a && !b) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  const hasOwn = Object.prototype.hasOwnProperty
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(b, keysA[i]) ||
      a[keysA[i]] !== b[keysA[i]]) {
      return false
    }
  }

  return true
}

export const getDisplayName = (C: any): string => C.displayName || C.name || 'Component'

export const compact = <A>(a: Array<A>): Array<A> => {
  return a.filter(x => x !== null && typeof x !== 'undefined')
}

/*
 * Applies the value `A` or `Promise<A>` to the function `fn`
 */
export const applyValueOrPromise = <T>(fn: (T) => any, x: T | Promise<T>): void => {
  if (typeof (x as Promise<T>).then === 'function') {
    (x as Promise<T>).then(fn)
  } else {
    fn(x)
  }
}

export const flattenComponents = (components: any[]): any[] => {
  return recur(components, [])

  function recur(components: any[], acc: any[]): any[] {
    if (components.length === 0) {
      return acc
    } else {
      return recur(
        components.reduce((cs, c) => {
          if (c && c.props && c.props.children && c.props.children.length > 0) {
            return cs.concat(c.props.children)
          } else {
            return cs
          }
        }, []),
        acc.concat(components)
      )
    }
  }
}

export const getTaskMappers = (components: any[]): Function[] => {
  const flattened = flattenComponents(components)
  return flattened.map(c => c._mapTasks).filter(m => typeof m !== 'undefined')
}

export const toTasks = (x: TasksOrEffects): Array<ITask<any,any>> => {
  const arr: Array<ITask<any,any> | IEffect<any>> = Array.isArray(x) ? x : [x]
  return arr.map((a) => {
    if (a instanceof Task || a instanceof Call) {
      return a
    } else if (a instanceof Function) {
      return new Call(a)
    }
  })
}

// Adapted from: https://github.com/mridgway/hoist-non-react-statics/

const REACT_STATICS = {
  childContextTypes: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  mixins: true,
  propTypes: true,
  type: true
}

const KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  arguments: true,
  arity: true
}

export function hoistStatics(targetComponent, sourceComponent) {
  if (typeof sourceComponent !== 'string') {
    let keys: any[] = Object.getOwnPropertyNames(sourceComponent)

    if (typeof Object.getOwnPropertySymbols === 'function') {
      keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent))
    }

    keys.forEach((key) => {
      if (!REACT_STATICS[key] && !KNOWN_STATICS[key]) {
        targetComponent[key] = sourceComponent[key]
      }
    })
  }

  return targetComponent
}
