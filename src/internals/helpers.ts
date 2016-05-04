import {MapperWithProps} from "../interfaces";
import RunContext from '../components/RunContext'

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
          if (c.props && c.props.children && c.props.children.length > 0) {
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
