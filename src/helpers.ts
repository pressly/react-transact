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