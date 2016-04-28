import { IActionThunk, ITaskCreator } from './interfaces'
import Task from './Task'

export default <A,B>(rejectType: A, resolveType: B, fn: Function): ITaskCreator<A,B> => {
  return (...args: any[]) => new Task((rej: IActionThunk<A>, res: IActionThunk<B>) => {
    try {
      const promiseOrValue = fn(...args)
      if (typeof promiseOrValue.then === 'function') {
        promiseOrValue.then(
          (value: any) => res({ type: resolveType, payload: value }),
          (err: any) => rej({ type: rejectType, payload: err })
        )
      } else {
        res({ type: resolveType, payload: promiseOrValue })
      }
    } catch (err) {
      rej({ type: rejectType, payload: err })
    }
  })
}
