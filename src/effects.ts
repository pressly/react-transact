import Task from './internals/Task'
import { IActionThunk, IChainTask } from './interfaces'
import { applyValueOrPromise } from './internals/helpers'

/*
 * When given a function and a value, returns a new Task that, when forked,
 * will apply the value to the function, then resolve the value.
 *
 * This is useful for creating side-effects off of a computation chain (i.e. logging).
 *
 * Example:
 *
 * ```
 * taskCreator('BAD', 'GOOD', x => x)('Hello')
 *   .chain(tap(x => console.log(x)))
 *   .fork((action) => { ... }) // This will cause the above log function to execute.
 * ```
 */
export const tap = (fn: IActionThunk<any>): IChainTask<any,any> => (x: any) => new Task((rej: any, res: any) => {
  applyValueOrPromise(fn, x)
  res(x)
})

/*
 * Given a message, returns a task creator function that
 * can be chained with another Task. Useful for debugging.
 *
 * Example:
 *
 * ```
 * taskCreator('BAD', 'GOOD', x => x)('Hello!')
 *   .chain(trace('Message received'))
 *   .fork((action) => { ... })  // This will cause "Message received, 'Hello!'" to be logged.
 * ```
 */
export const trace = (msg: string): IChainTask<any,any> => tap((a: any) => console.log(msg, a))
