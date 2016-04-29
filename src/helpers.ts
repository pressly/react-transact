export const compact = <A>(a: Array<A>): Array<A> => {
  return a.filter(x => x !== null && typeof x !== 'undefined')
}
